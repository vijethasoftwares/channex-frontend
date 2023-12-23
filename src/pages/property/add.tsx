import Container from "@/components/container";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import MemoizedMapComponent from "@/components/map-component";
import { PropertyProps } from "@/components/types/app";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, convertImagesToBase64 } from "@/lib/utils";
import {
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Selection,
  useDisclosure,
} from "@nextui-org/react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import React, { FC, useState } from "react";
import toast from "react-hot-toast";

type Props = {
  children?: React.ReactNode;
};

type Permission = {
  key: string;
  value: string;
};

interface FoodMenuProps {
  day: string;
  bgColor: string;
  meals: MealData[];
}

interface MealData {
  name: string;
  type: string;
  items: string[];
}

interface PlacesData {
  name: string;
  types: string[];
  rating: number;
}

const Permissions = [
  { key: "entry", value: "27/7 entry" },
  { key: "smoking", value: "allow smoking" },
  { key: "pets", value: "allow pets" },
  { key: "drinking", value: "allow drinking" },
  { key: "guests", value: "allow guests" },
];

const facilitiesEnum = [
  "Parking space",
  "Gym",
  "Common Room with TV",
  "Indoor Play games",
  "Laundry",
  "Common Washing machine",
  "Washing machine per floor",
  "Food served to room",
  "Dining hall",
  "Food on order (payable)",
];
const FoodMenuData = [
  {
    day: "Monday",
    bgColor: "bg-yellow-100",
    meals: [
      {
        name: "Breakfast",
        type: "Veg",
        items: ["Cereal", "Milk", "Banana"],
      },
      {
        name: "Lunch",
        type: "Veg",
        items: ["Rice", "Lentils", "Salad"],
      },
      {
        name: "Dinner",
        type: "Veg",
        items: ["Pasta", "Tomato Sauce", "Cheese"],
      },
    ],
  },
  {
    day: "Tuesday",
    bgColor: "bg-green-100",
    meals: [
      {
        name: "Breakfast",
        type: "Veg",
        items: ["Cereal", "Milk", "Banana"],
      },
      {
        name: "Lunch",
        type: "Veg",
        items: ["Rice", "Lentils", "Salad"],
      },
      {
        name: "Dinner",
        type: "Veg",
        items: ["Pasta", "Tomato Sauce", "Cheese"],
      },
    ],
  },
  {
    day: "Wednesday",
    bgColor: "bg-red-100",
    meals: [
      {
        name: "Breakfast",
        type: "Veg",
        items: ["Cereal", "Milk", "Banana"],
      },
      {
        name: "Lunch",
        type: "Veg",
        items: ["Rice", "Lentils", "Salad"],
      },
      {
        name: "Dinner",
        type: "Veg",
        items: ["Pasta", "Tomato Sauce", "Cheese"],
      },
    ],
  },
  {
    day: "Thursday",
    bgColor: "bg-blue-100",
    meals: [
      {
        name: "Breakfast",
        type: "Veg",
        items: ["Cereal", "Milk", "Banana"],
      },
      {
        name: "Lunch",
        type: "Veg",
        items: ["Rice", "Lentils", "Salad"],
      },
      {
        name: "Dinner",
        type: "Veg",
        items: ["Pasta", "Tomato Sauce", "Cheese"],
      },
    ],
  },
  {
    day: "Friday",
    bgColor: "bg-yellow-100",
    meals: [
      {
        name: "Breakfast",
        type: "Veg",
        items: ["Cereal", "Milk", "Banana"],
      },
      {
        name: "Lunch",
        type: "Veg",
        items: ["Rice", "Lentils", "Salad"],
      },
      {
        name: "Dinner",
        type: "Veg",
        items: ["Pasta", "Tomato Sauce", "Cheese"],
      },
    ],
  },
  {
    day: "Saturday",
    bgColor: "bg-green-100",
    meals: [
      {
        name: "Breakfast",
        type: "Veg",
        items: ["Cereal", "Milk", "Banana"],
      },
      {
        name: "Lunch",
        type: "Veg",
        items: ["Rice", "Lentils", "Salad"],
      },
      {
        name: "Dinner",
        type: "Veg",
        items: ["Pasta", "Tomato Sauce", "Cheese"],
      },
    ],
  },
  {
    day: "Sunday",
    bgColor: "bg-red-100",
    meals: [
      {
        name: "Breakfast",
        type: "Veg",
        items: ["Cereal", "Milk", "Banana"],
      },
      {
        name: "Lunch",
        type: "Veg",
        items: ["Rice", "Lentils", "Salad"],
      },
      {
        name: "Dinner",
        type: "Veg",
        items: ["Pasta", "Tomato Sauce", "Cheese"],
      },
    ],
  },
];

const GOOGLE_API_KEY = import.meta.env.VITE_MAP_API_KEY as string;

const AddProperty: FC<Props> = () => {
  const [location, setLocation] = useState<string>("");
  const [fetchingLocation, setFetchingLocation] = useState<boolean>(false);
  const [coordinate, setCoordinate] = useState({
    lat: 0,
    lng: 0,
  });
  const [nearbyPlacesData, setNearbyPlacesData] = useState([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<Selection>(new Set([]));
  const [fetchingNearbyPlaces, setFetchingNearbyPlaces] =
    useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [coupleFriendly, setCoupleFriendly] = useState<boolean>(false);
  const [images, setImages] = useState<File[]>([]);
  const [permissions, setPermissions] = useState<Selection>(new Set([]));
  const [isParkingSpaceAvailable, setIsParkingSpaceAvailable] =
    useState<Selection>(new Set(["false"]));
  const [facilities, setFacilities] = useState<Selection>(new Set([]));
  const [managerName, setManagerName] = useState<string>("");
  const [managerEmail, setManagerEmail] = useState<string>("");
  const [managerPhoneNumber, setManagerPhoneNumber] = useState<string>("");
  const [foodMenu, setFoodMenu] = useState<FoodMenuProps[]>(FoodMenuData);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleLocationInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(event.target.value);
  };

  const handleGetLiveLocation = () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      setCoordinate({ lat: latitude, lng: longitude });
      setFetchingLocation(true);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
      );

      if (!response.ok) {
        toast.error(
          `Geolocation API request failed with status ${response.status}`
        );
        setFetchingLocation(false);
        return;
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setLocation(data.results[0].formatted_address);
      }
      setFetchingLocation(false);
    });
  };

  const handleGetNearbyPlaces = async () => {
    if (!coordinate || !coordinate.lat || !coordinate.lng) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinate({ lat: latitude, lng: longitude });
      });
      return;
    }
    setFetchingNearbyPlaces(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/api/map/nearby-places?lat=${coordinate.lat}&lng=${coordinate.lng}`
      );

      const data = await response.data;
      console.log(data);
      const slicedData = data.results.slice(0, 5);
      const np = slicedData.map((place: PlacesData) => {
        return `${place.name} - Type: ${
          place.types[0].split("_").join(" ") || "NA"
        } - Rating: ${place.rating || "NA"}`;
      });
      setNearbyPlacesData(np);
      setNearbyPlaces(new Set(np));
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching nearby places");
    } finally {
      setFetchingNearbyPlaces(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length + images.length <= 5) {
      setImages([...images, ...Array.from(e.target.files)]);
    } else {
      toast.error("You can only upload 5 images");
    }
  };

  const handleImageDelete = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async () => {
    const img = await convertImagesToBase64(images);
    const property: PropertyProps = {
      name: name,
      location: location,
      address: location,
      coOfLocation: {
        type: "Point",
        coordinates: [coordinate.lat, coordinate.lng],
      },
      description: "",
      images: img,
      size: 0,
    };
    console.log(property);
  };

  const handleAddManager = async () => {
    if (!managerName || !managerEmail) {
      toast.error("Required fields are missing");
      return;
    }
    onOpenChange();
  };

  return (
    <>
      <Container>
        <ContainerColumn>
          <Heading>Add Property</Heading>
          <div className="p-5 bg-zinc-50 border rounded-md w-full">
            <Heading variant="subheading">Details</Heading>
            <div className="mt-5 grid grid-cols-3 gap-5 w-full">
              <Input
                type="text"
                name="name"
                label="Property Name"
                labelPlacement="outside"
                placeholder="Enter property name"
                color="default"
                isRequired={true}
                value={name}
                onValueChange={setName}
                radius="md"
                size="lg"
                variant="bordered"
              />
              <Select
                name=""
                color="default"
                label="Permissions"
                labelPlacement="outside"
                selectionMode="multiple"
                placeholder="Select permissions"
                selectedKeys={permissions}
                onSelectionChange={setPermissions}
                radius="md"
                size="lg"
                variant="bordered"
              >
                {Permissions.map((permission: Permission) => (
                  <SelectItem key={permission.value} value={permission.value}>
                    {permission.value}
                  </SelectItem>
                ))}
              </Select>
              <Select
                name="is_parking_space_available"
                label="Is Parking Space Available"
                labelPlacement="outside"
                placeholder="Select an option"
                color="default"
                radius="md"
                size="lg"
                variant="bordered"
                selectedKeys={isParkingSpaceAvailable}
                onSelectionChange={setIsParkingSpaceAvailable}
              >
                <SelectItem key={"true"} value="true">
                  Yes
                </SelectItem>
                <SelectItem key={"false"} value="false">
                  No
                </SelectItem>
              </Select>
              <div className="w-full flex justify-center items-end flex-col gap-2 relative">
                <Input
                  type="text"
                  name="location"
                  label="Location"
                  labelPlacement="outside"
                  placeholder="Enter location"
                  className="relative"
                  color="default"
                  isRequired={true}
                  radius="md"
                  size="lg"
                  variant="bordered"
                  value={location}
                  onChange={handleLocationInput}
                  endContent={
                    fetchingLocation ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <span
                        className="text-xs h-auto bg-white hover:bg-zinc-50 -mr-1 cursor-pointer px-3 py-2 rounded-md border border-gray-300 text-nowrap font-medium"
                        onClick={handleGetLiveLocation}
                      >
                        Get Location
                      </span>
                    )
                  }
                />
              </div>
              <Select
                label="Nearby Places"
                labelPlacement="outside"
                placeholder="Select an option"
                color="default"
                radius="md"
                size="lg"
                variant="bordered"
                selectionMode="multiple"
                selectedKeys={nearbyPlaces}
                onSelectionChange={setNearbyPlaces}
                endContent={
                  fetchingNearbyPlaces ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <span
                      className="text-xs h-auto bg-white hover:bg-zinc-50 -mr-1 cursor-pointer px-3 py-2 rounded-md border border-gray-300 text-nowrap font-medium"
                      onClick={handleGetNearbyPlaces}
                    >
                      Get Nearby Places
                    </span>
                  )
                }
              >
                {nearbyPlacesData &&
                  nearbyPlacesData.map((place) => (
                    <SelectItem key={place} value={place}>
                      {place}
                    </SelectItem>
                  ))}
              </Select>
              <Select
                label="Facilities"
                labelPlacement="outside"
                placeholder="Select an option"
                color="default"
                radius="md"
                size="lg"
                variant="bordered"
                selectionMode="multiple"
                selectedKeys={facilities}
                onSelectionChange={setFacilities}
              >
                {facilitiesEnum &&
                  facilitiesEnum.map((facility) => (
                    <SelectItem key={facility} value={facility}>
                      {facility}
                    </SelectItem>
                  ))}
              </Select>
              <div className="flex items-end justify-start w-full">
                <Checkbox
                  isSelected={coupleFriendly}
                  onValueChange={setCoupleFriendly}
                >
                  Couple Friendly
                </Checkbox>
              </div>
            </div>
          </div>
          <Container className="flex flex-col gap-2.5 w-full p-0 bg-white rounded-md">
            <Heading variant="subheading">Food Menu</Heading>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {foodMenu.map((day, dayIndex: number) => (
                <div key={dayIndex} className={cn("p-1 py-2 rounded-lg")}>
                  <Heading variant="subtitle" className="mb-2 text-black p-1">
                    {day.day}
                  </Heading>
                  <div className="flex flex-col gap-.5">
                    {day.meals.map((meal, mealIndex: number) => {
                      return (
                        <>
                          <Meal
                            dayIndex={dayIndex}
                            mealIndex={mealIndex}
                            meal={meal}
                            foodMenu={foodMenu}
                            setFoodMenu={setFoodMenu}
                          />
                        </>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Container>
          <div className="w-full grid lg:grid-cols-2 gap-2.5">
            <div className="p-5 bg-zinc-50 border rounded-md w-full flex flex-col justify-start items-start gap-5">
              <Heading variant="subheading">Images</Heading>
              <div className="relative px-16 py-7 bg-zinc-100 rounded-md border-dashed border-2 w-full">
                <input
                  type="file"
                  name="images"
                  multiple={true}
                  required
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full h-full absolute top-0 right-0 bottom-0 left-0 opacity-0 cursor-pointer z-10"
                />
                <span className="inset-0 absolute z-[1] text-sm text-zinc-600 flex justify-center items-center">
                  + Add Images
                </span>
              </div>
              <motion.div
                layout="size"
                transition={{
                  duration: 0.5,
                  ease: [0.87, 0, 0.13, 1],
                }}
                className="relative w-full grid grid-cols-5 gap-3"
              >
                <AnimatePresence>
                  {images.map((image, index) => (
                    <AnimatePresence key={image.name}>
                      <motion.div
                        layout
                        initial={{
                          opacity: 0,
                          scale: 0.5,
                          x: 100,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          x: 0,
                        }}
                        transition={{
                          duration: 0.5,
                          ease: [0.87, 0, 0.13, 1],
                          delay: index * 0.1,
                        }}
                        className="relative p-2.5 rounded-md bg-zinc-100 border-2 border-dashed origin-right"
                      >
                        <img
                          key={index}
                          src={URL.createObjectURL(image)}
                          alt={`Uploaded ${index}`}
                          className="min-h-20 w-full object-cover h-full rounded-md"
                        />
                        <div
                          className="absolute top-1 right-1 cursor-pointer p-1 bg-white border rounded-3xl z-10"
                          onClick={() => handleImageDelete(index)}
                        >
                          <X size={20} className="text-black" />
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
            <div className="w-full min-w-0 border rounded-md">
              <MemoizedMapComponent
                containerStyle={{
                  height: "275px",
                  width: "100%",
                  borderRadius: "0.375rem",
                }}
                coordinate={coordinate}
                // coordinates={location}
              />
            </div>
          </div>
          <div className="w-full flex justify-end items-center gap-2.5 mt-5">
            <Button variant="ghost" className=" active:scale-95">
              Cancel
            </Button>
            <Button
              onClick={onOpen}
              variant="outline"
              className=" active:scale-95"
            >
              Add Manager
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-purple-700 active:scale-95"
            >
              Add Property
            </Button>
          </div>
        </ContainerColumn>
      </Container>

      <Modal
        isDismissable={false}
        backdrop="blur"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add Manager Details
              </ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  label="Name"
                  labelPlacement="outside"
                  placeholder="Enter manager name"
                  variant="bordered"
                  size="lg"
                  radius="md"
                  value={managerName}
                  onValueChange={setManagerName}
                  isRequired
                />
                <Input
                  autoFocus
                  label="Email"
                  labelPlacement="outside"
                  placeholder="Enter manager email"
                  variant="bordered"
                  size="lg"
                  radius="md"
                  value={managerEmail}
                  onValueChange={setManagerEmail}
                  isRequired
                />
                <Input
                  autoFocus
                  type="number"
                  label="Phone Number"
                  labelPlacement="outside"
                  placeholder="Enter manager phone number"
                  variant="bordered"
                  size="lg"
                  radius="md"
                  value={managerPhoneNumber}
                  onValueChange={setManagerPhoneNumber}
                />
              </ModalBody>
              <ModalFooter>
                <Button className="px-8" variant="ghost" onClick={onClose}>
                  Close
                </Button>
                <Button className="px-8" onClick={handleAddManager}>
                  Add
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

interface MealProps {
  dayIndex: number;
  mealIndex: number;
  meal: {
    name: string;
    type: string;
    items: string[];
  };
  foodMenu: {
    day: string;
    bgColor: string;
    meals: MealData[];
  }[];
  setFoodMenu: React.Dispatch<
    React.SetStateAction<
      {
        day: string;
        bgColor: string;
        meals: MealData[];
      }[]
    >
  >;
}

interface MealData {
  name: string;
  type: string;
  items: string[];
}

const Meal: FC<MealProps> = ({
  dayIndex,
  mealIndex,
  meal,
  foodMenu,
  setFoodMenu,
}) => {
  const [mealName, setMealName] = useState("");
  const [mealType, setMealType] = useState("");
  const [mealItems, setMealItems] = useState("");
  const [mealItemsArray, setMealItemsArray] = useState([""]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAddMeal = (e: React.MouseEvent<HTMLButtonElement>) => {
    const _mealData = {
      name: mealName,
      type: mealType,
      items: mealItemsArray,
    };
    //add meal to food menu data and update state of food menu dont remove any data and aslo close the modal
    const newFoodMenu = [...foodMenu];
    newFoodMenu[dayIndex].meals.splice(mealIndex + 1, 0, _mealData);
    setFoodMenu(newFoodMenu);
    setMealName("");
    setMealType("");
    setMealItems("");
    setMealItemsArray([]);
    onOpenChange();
  };

  return (
    <>
      <div
        key={mealIndex}
        className="px-3 py-3 flex flex-col justify-start items-start gap-2 bg-zinc-50 rounded-lg border border-zinc-200"
      >
        <div>
          <Heading variant="body" className="text-md font-medium">
            {meal.name} - {meal.type}
          </Heading>
        </div>
        <div className="flex flex-wrap justify-start items-center gap-1.5">
          {meal.items.map((item: string) => (
            <Badge className="px-3 py-1.5">{item}</Badge>
          ))}
        </div>
      </div>
      <div className="flex justify-center items-center py-1">
        <button
          className="px-3 py-0.5 rounded-3xl hover:bg-zinc-100 active:scale-95"
          data-day-index={dayIndex}
          data-meal-index={mealIndex}
          data-meal={meal}
          // onClick={handleAddMeal}
          onClick={onOpen}
        >
          +
        </button>
      </div>
      <Modal
        isDismissable={false}
        backdrop="blur"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add Manager Details
              </ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  label="Meal Name"
                  labelPlacement="outside"
                  placeholder="Enter Meal Name"
                  variant="bordered"
                  size="lg"
                  radius="md"
                  value={mealName}
                  onValueChange={setMealName}
                  isRequired
                />
                <Input
                  autoFocus
                  label="Meal Type"
                  labelPlacement="outside"
                  placeholder="Enter Meal Type"
                  variant="bordered"
                  size="lg"
                  radius="md"
                  value={mealType}
                  onValueChange={setMealType}
                  isRequired
                />
                <Input
                  autoFocus
                  type="text"
                  label="Meal Items"
                  labelPlacement="outside"
                  placeholder="Enter Meal Items"
                  variant="bordered"
                  size="lg"
                  radius="md"
                  value={mealItems}
                  onValueChange={setMealItems}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setMealItemsArray([...mealItemsArray, mealItems]);
                      setMealItems("");
                    }
                  }}
                />

                <div className="flex gap-1">
                  {mealItemsArray.map((item) => {
                    return <Badge className="px-3 py-1.5 ">{item}</Badge>;
                  })}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button className="px-8" variant="ghost" onClick={onClose}>
                  Close
                </Button>
                <Button className="px-8" onClick={handleAddMeal}>
                  Add
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddProperty;
