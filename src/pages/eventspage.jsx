import React, { useState, useContext } from "react";
import { EventCard } from "../components/EventCard";
import { useLoaderData, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ApplicationData } from "../components/Root";
import {
  Heading,
  Box,
  Flex,
  Radio,
  RadioGroup,
  Button,
  Input,
  Center,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  useToast,
  Checkbox,
  FormLabel,
  Select,
  HStack,
  ModalCloseButton,
} from "@chakra-ui/react";

export const EventsPage = () => {
  const { users, categories } = useContext(ApplicationData);
  const events = useLoaderData();

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onClose: onFormClose,
  } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();

  const [filteredEvents, setFilteredEvents] = useState(events);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Functions for filtering events displayed on screen
  const handleSearch = (searchString) => {
    setSearchQuery(searchString);

    if (categoryFilter === "") {
      const items = events.filter((event) => {
        return event.title.toLowerCase().includes(searchString.toLowerCase());
      });
      setFilteredEvents(items);
    } else {
      const items = events
        .filter((event) => {
          return event.categoryIds.includes(Number(categoryFilter));
        })
        .filter((event) => {
          return event.title.toLowerCase().includes(searchString.toLowerCase());
        });

      setFilteredEvents(items);
    }
  };

  const handleFilter = (id) => {
    setCategoryFilter(id);
    

    if (categoryFilter === "") {
      const items = filteredEvents.filter((event) => {
        return event.categoryIds.includes(Number(id));
      });
      setFilteredEvents(items);
    } else if (searchQuery !== "") {
      const items = events
        .filter((event) => {
          return event.categoryIds.includes(Number(id));
        })
        .filter((event) => {
          return event.title.toLowerCase().includes(searchQuery.toLowerCase());
        });
      setFilteredEvents(items);
    } else {
      const items = events.filter((event) => {
        return event.categoryIds.includes(Number(id));
      });
      setFilteredEvents(items);
    }
  };

  const handleReset = () => {
    setFilteredEvents(events);
    setSearchQuery("");
    setCategoryFilter("");
  };

  

  const onFormSubmit = async (data) => {
    const categoryIds = data.categoryIds.map((id) => Number(id));
    const userId = Number(data.createdBy);

    const newData = {
      ...data,
      createdBy: userId,
      categoryIds: categoryIds,
    };

    await fetch("http://localhost:3000/events", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(newData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`${response.status} ${response.statusText}`);
        } else {
          toast({
            status: "success",
            title: "Succes",
            description: "Event was added",
            duration: 10000,
            isClosable: true,
          });
          return response.json();
        }
      })
      .then((data) => {
        onFormClose();
        navigate(`/event/${data.id}`);
      })
      .catch((error) => {
        toast({
          status: "error",
          title: "Error while creating event",
          description: `${error}`,
          duration: 10000,
          isClosable: true,
        });
      });
  };

  const minDate = new Date().toISOString().slice(0, 16);

  return (
    <Box>
      <Flex
        direction={"column"}
        rowGap={"1em"}
        alignItems={"center"}
        marginBottom="0.5em"
      >
        <RadioGroup value={Number(categoryFilter)} onChange={handleFilter}>
          <HStack spacing={"1rem"}>
            {categories.map((category) => (
              <Radio
                colorScheme={"linkedin"}
                key={category.id}
                value={category.id}
              >
                {" "}
                {category.name}
              </Radio>
            ))}
          </HStack>
        </RadioGroup>

        <Center>
          <Input
            value={searchQuery}
            placeholder="Type to search.."
            onChange={(e) => handleSearch(e.target.value)}
            background={"hsl(0, 0%, 96%)"}
            width={{ base: "250px", md: "400px" }}
          />
        </Center>

        <Box>
          <Button
            onClick={handleReset}
            isDisabled={!categoryFilter && !searchQuery}
            size={{ base: "sm", md: "md" }}
            colorScheme="linkedin"
          >
            Reset filters
          </Button>
          <Button
            onClick={onFormOpen}
            marginLeft={"0.5rem"}
            size={{ base: "sm", md: "md" }}
            colorScheme="linkedin"
          >
            Add new event
          </Button>
        </Box>

        <Heading marginTop={"1rem"} marginBottom={"1rem"}>
          Events list
        </Heading>
      </Flex>

      <Flex
        flexWrap={"wrap"}
        columnGap={"1rem"}
        alignItems={"center"}
        justifyContent={"center"}
        margin={"0 2vw 0 2vW"}
      >
        {filteredEvents.map((event) => (
          <EventCard key={event.id} event={event} categories={categories} />
        ))}
      </Flex>

      {/* Modal used to display the addEventForm */}
      <Modal
        closeOnOverlayClick={false}
        isOpen={isFormOpen}
        onClose={onFormClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add an event</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit(onFormSubmit)}>
              <Flex direction={"column"} rowGap={"1rem"}>
                <Box>
                  <FormLabel htmlFor="title">Title of event</FormLabel>
                  <Input
                    type="text"
                    id="title"
                    {...register("title", { required: true })}
                    placeholder="Title of event"
                  />
                  {errors.title && (
                    <span style={{ color: "red" }}>This field is required</span>
                  )}
                </Box>

                <Box>
                  <FormLabel htmlFor="desciption">Description</FormLabel>
                  <Input
                    type="text"
                    id="desciption"
                    {...register("description", { required: true })}
                    placeholder="Describe the event"
                  />
                  {errors.description && (
                    <span style={{ color: "red" }}>This field is required</span>
                  )}
                </Box>

                <Box>
                  <FormLabel htmlFor="image-link">Image</FormLabel>
                  <Input
                    id="image-link"
                    type="text"
                    {...register("image", { required: true })}
                    placeholder="Provide a hyperlink of the image"
                  />
                  {errors.image && (
                    <span style={{ color: "red" }}>This field is required</span>
                  )}
                </Box>

                <Box>
                  <FormLabel htmlFor="location">Location</FormLabel>
                  <Input
                    type="text"
                    id="location"
                    {...register("location", { required: true })}
                    placeholder="Event location"
                  />
                  {errors.location && (
                    <span style={{ color: "red" }}>This field is required</span>
                  )}
                </Box>

                <Box>
                  <FormLabel htmlFor="start-time">Start time</FormLabel>
                  <Input
                    type="datetime-local"
                    id="start-time"
                    {...register("startTime", {
                      required: "This field is required",
                      min: {
                        value: minDate,
                        message: "Cannot enter a date in the past",
                      },
                      pattern: {
                        value: /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}$/,
                        message: "Invalid date selected",
                      },
                    })}
                    placeholder="Event location"
                  />
                  <span style={{ color: "red" }}>
                    {errors.startTime?.message}
                  </span>
                </Box>

                <Box>
                  <FormLabel htmlFor="end-time">End time</FormLabel>
                  <Input
                    type="datetime-local"
                    id="end-time"
                    {...register("endTime", {
                      required: "This field is required",
                      min: {
                        value: minDate,
                        message: "Cannot enter a date in the past",
                      },
                      pattern: {
                        value: /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}$/,
                        message: "Invalid date selected",
                      },
                    })}
                    placeholder="Event location"
                  />
                  <span style={{ color: "red" }}>
                    {errors.endTime?.message}{" "}
                  </span>
                </Box>

                <Box>
                  <FormLabel htmlFor="categories">Categories</FormLabel>
                  <HStack spacing="1rem">
                    {categories.map((category) => (
                      <Checkbox
                        key={category.id}
                        id="categories"
                        {...register("categoryIds", { required: true })}
                        value={category.id}
                      >
                        {category.name}
                      </Checkbox>
                    ))}
                  </HStack>
                  {errors.categoryIds && (
                    <span style={{ color: "red" }}>This field is required</span>
                  )}
                </Box>

                <Box>
                  <FormLabel htmlFor="organiser">Select an organiser</FormLabel>
                  <Select
                    id="organiser"
                    placeholder="Select event organiser"
                    {...register("createdBy", { required: true })}
                  >
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </Select>
                  {errors.createdBy && (
                    <span style={{ color: "red" }}>This field is required</span>
                  )}
                </Box>

                <Center>
                  <Button
                    colorScheme="green"
                    type="submit"
                    marginTop={"1rem"}
                    marginBottom={"1rem"}
                  >
                    Add event
                  </Button>
                </Center>
              </Flex>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export async function loader() {
  const fetchEvents = await fetch("http://localhost:3000/events");
  const events = await fetchEvents.json();

  return events;
}
