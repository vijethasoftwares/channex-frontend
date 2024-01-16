import Container from "@/components/container";
import ContainerBetween from "@/components/container-between";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import MemoizedMapComponent from "@/components/map-component";
import { GlobalContextType } from "@/components/providers";
// import { PropertyProps } from "@/components/types/app";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import firebase_app from "@/lib/firebase";
import {
  SERVER_URL,
  // convertImagesToBase64,
  useGlobalContext,
} from "@/lib/utils";
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
import axios, { AxiosError, AxiosResponse } from "axios";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import React, { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  DaysEnum,
  MealNameEnum,
  Permissions,
  PropertyTypeEnum,
  facilitiesEnum,
} from "./consts";

type Props = {
  children?: React.ReactNode;
};

type Permission = {
  key: string;
  value: string;
};

interface PropertyProps {
  name: string;
  type: string;
  location: string;
  address: string;
  coOfLocation: { type: "Point"; coordinates: [number, number] };
  nearbyPlaces?: string[];
  images: { label: string; url: string }[];
  manager?: {
    name: string;
    email: string;
    phoneNumber: string;
  };
  permissions?: string[];
  facilities?: string[];
  isParkingSpaceAvailable?: boolean | "true" | "false" | string;
  isCoupleFriendly?: boolean;
  foodMenu?: FoodMenuProps[];
  managerId?: string;
}

interface FoodMenuProps {
  day: string;
  meals: MealData[];
}

interface MealData {
  name: string;
  hasMealItems?: boolean;
  vegMealItems: string[];
  nonVegMealItems: string[];
}

interface PlacesData {
  name: string;
  types: string[];
  rating: number;
}

const GOOGLE_API_KEY = import.meta.env.VITE_MAP_API_KEY as string;

const storage = getStorage(firebase_app);

const EditProperty: FC<Props> = () => {
  const { user } = useGlobalContext() as GlobalContextType;
  const { id } = useParams();
  const [location, setLocation] = useState<string>("");
  const [coordinate, setCoordinate] = useState({
    lat: 0,
    lng: 0,
  });
  const [nearbyPlacesData, setNearbyPlacesData] = useState([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<Selection>(new Set([]));
  const [fetchingNearbyPlaces, setFetchingNearbyPlaces] =
    useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [propertyType, setPropertyType] = useState<Selection>(new Set([]));
  const [coupleFriendly, setCoupleFriendly] = useState<boolean>(false);
  const [images, setImages] = useState<{ label: string; url: string }[]>([]);
  const [permissions, setPermissions] = useState<Selection>(new Set([]));
  const [isParkingSpaceAvailable, setIsParkingSpaceAvailable] =
    useState<Selection>(new Set(["false"]));
  const [facilities, setFacilities] = useState<Selection>(new Set([]));
  /*
   ** loading state
   */
  const [fetchingLocation, setFetchingLocation] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  /*
   ** Manager States
   */
  const [managerName, setManagerName] = useState<string>("");
  const [managerEmail, setManagerEmail] = useState<string>("");
  const [managerPhoneNumber, setManagerPhoneNumber] = useState<string>("");
  const [managerId, setManagerId] = useState<string>("");

  /*
   ** Food Menu States
   */
  const [foodMenu, setFoodMenu] = useState<FoodMenuProps[]>(
    DaysEnum.map((day) => {
      return {
        day: day,
        meals: [
          {
            name: MealNameEnum[0],
            hasMealItems: false,
            vegMealItems: [],
            nonVegMealItems: [],
          },
          {
            name: MealNameEnum[1],
            hasMealItems: false,
            vegMealItems: [],
            nonVegMealItems: [],
          },
          {
            name: MealNameEnum[2],
            hasMealItems: false,
            vegMealItems: [],
            nonVegMealItems: [],
          },
          {
            name: MealNameEnum[3],
            hasMealItems: false,
            vegMealItems: [],
            nonVegMealItems: [],
          },
        ],
      };
    })
  );
  const [mealName, setMealName] = useState<Selection>(new Set([]));
  const [day, setDay] = useState<Selection>(new Set([]));
  const [vegMealItems, setVegMealItems] = useState<string>("");
  const [vegMealItemsArray, setVegMealItemsArray] = useState<string[]>([]);
  const [nonVegMealItems, setNonVegMealItems] = useState<string>("");
  const [nonVegMealItemsArray, setNonVegMealItemsArray] = useState<string[]>(
    []
  );
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isOpenFoodMenu,
    onOpen: onOpenFoodMenu,
    onOpenChange: onOpenChangeFoodMenu,
  } = useDisclosure();

  const navigate = useNavigate();

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
        `${SERVER_URL}/map/nearby-places?lat=${coordinate.lat}&lng=${coordinate.lng}`
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length + images.length <= 5) {
      const imagesLinks = await uploadImagesToFirebase(
        Array.from(e.target.files) as File[]
      );
      setImages([...images, ...imagesLinks]);
    } else {
      toast.error("You can only upload 5 images");
    }
  };

  const handleImageDelete = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit: () => Promise<void> = async () => {
    setSubmitting(true);
    const np = Array.from(nearbyPlaces) as string[];
    const p = Array.from(permissions) as string[];
    const f = Array.from(facilities) as string[];
    const ipsa = Array.from(isParkingSpaceAvailable) as string[];
    const property: PropertyProps = {
      name: name,
      type: Array.from(propertyType).toString(),
      location: location,
      address: location,
      coOfLocation: {
        type: "Point",
        coordinates: [coordinate.lat, coordinate.lng],
      },
      images,
      nearbyPlaces: np,
      permissions: p,
      facilities: f,
      isParkingSpaceAvailable: ipsa[0],
      isCoupleFriendly: coupleFriendly,
      foodMenu: foodMenu,
      managerId: managerId,
      manager: {
        name: managerName,
        email: managerEmail,
        phoneNumber: managerPhoneNumber,
      },
    };
    console.log(property);

    try {
      navigate("/property");
    } catch (error) {
      const err = error as AxiosError & { response: AxiosResponse };
      console.log(err.response);
      toast.error(err.response.data?.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const uploadImagesToFirebase = async (images: File[]) => {
    const imageUrls = [];

    try {
      toast.loading("Uploading images...");
      for (const image of images) {
        const imageRef = ref(
          storage,
          `property_images/${Date.now()}-${image.name}`
        );
        await uploadBytes(imageRef, image);
        const imageUrl = await getDownloadURL(imageRef);
        imageUrls.push({
          label: image.name,
          url: imageUrl,
        });
      }
      return imageUrls;
    } catch (error) {
      console.error("Error uploading images:", error);
      return [];
    } finally {
      toast.dismiss();
      toast.success("Images uploaded successfully");
    }
  };

  const handleAddManager = async () => {
    if (!managerName || !managerPhoneNumber) {
      toast.error("Required fields are missing");
      return;
    }
    const ToastID = toast.loading("Adding manager...");
    try {
      const res = await axios.post(
        SERVER_URL + "/admin/create-manager",
        {
          phoneNumber: managerPhoneNumber,
          name: managerName,
          email: managerEmail || "",
        },
        {
          headers: {
            Authorization: "Bearer " + user.token,
          },
        }
      );
      const data = await res.data;
      console.log(data);
      toast.success(data.message || "Manager added successfully");
      setManagerId(data.data._id);
    } catch (error) {
      console.log(error);
      toast.error("An error occurred while adding manager");
      setManagerEmail("");
      setManagerName("");
      setManagerPhoneNumber("");
    } finally {
      toast.dismiss(ToastID);
      onOpenChange();
    }
  };
  const handleAddMeal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const dayString = Array.from(day).toString();
    const vmi = Array.from(vegMealItemsArray);
    const nvmi = Array.from(nonVegMealItemsArray);
    const mn = Array.from(mealName).toString();
    if (dayString.length == 0) {
      toast.error("Day cannot be empty");
      return;
    }
    if (mn.length == 0) {
      toast.error("Meal name cannot be empty");
      return;
    }
    if (vmi.length == 0 && nvmi.length == 0) {
      toast.error("Meal items cannot be empty");
      return;
    }

    const dayIndex = foodMenu.findIndex((d) => d.day === dayString);

    if (dayIndex !== -1) {
      // Day already exists in the foodMenu array, update it
      const foodDay = foodMenu[dayIndex];
      const mealIndex = foodDay.meals.findIndex((m) => m.name === mn);

      if (mealIndex !== -1) {
        // Meal already exists in the meals array, update it
        const updatedMeal = {
          ...foodDay.meals[mealIndex],
          vegMealItems: vmi,
          nonVegMealItems: nvmi,
          hasMealItems: true,
        };
        const updatedMeals = [...foodDay.meals];
        updatedMeals[mealIndex] = updatedMeal;
        const updatedFoodDay = { ...foodDay, meals: updatedMeals };
        const newFoodMenu = [...foodMenu];
        newFoodMenu[dayIndex] = updatedFoodDay;
        console.log(newFoodMenu);
        setFoodMenu(newFoodMenu);
      } else {
        // Meal does not exist in the meals array, add it
        const updatedFoodDay = {
          ...foodDay,
          meals: [
            ...foodDay.meals,
            {
              name: mn,
              hasMealItems: true,
              vegMealItems: vmi,
              nonVegMealItems: nvmi,
            },
          ],
        };
        const newFoodMenu = [...foodMenu];
        newFoodMenu[dayIndex] = updatedFoodDay;
        console.log(newFoodMenu);
        setFoodMenu(newFoodMenu);
      }
    }

    setDay(new Set([]));
    setMealName(new Set([]));
    setVegMealItems("");
    setVegMealItemsArray([]);
    setNonVegMealItems("");
    setNonVegMealItemsArray([]);
    onOpenChangeFoodMenu();
  };

  useEffect(() => {
    if (id && user?.userId) {
      const fetchProperty = async () => {
        try {
          const res = await axios.get(
            SERVER_URL + `/owner/get-property-by-id/${id}`,
            {
              headers: {
                Authorization: `Bearer ${user?.token}`,
              },
            }
          );
          const data = await res.data?.property;
          console.log(data);
          setName(data.name);
          setPropertyType(new Set([data.type]));
          setPermissions(new Set(data.permissions));
          setIsParkingSpaceAvailable(new Set([data.isParkingSpaceAvailable]));
          setFacilities(new Set(data.facilities));
          setCoupleFriendly(data.isCoupleFriendly);
          setLocation(data.location);
          setNearbyPlaces(new Set(data.nearbyPlaces));
          setImages(data.images);
          setFoodMenu(data.foodMenu);
          setManagerId(data.managerId);
          setManagerName(data.manager?.name || "");
          setManagerEmail(data.manager?.email || "");
          setManagerPhoneNumber(data.manager?.phoneNumber || "");
          setCoordinate({
            lat: data.coOfLocation.coordinates[0],
            lng: data.coOfLocation.coordinates[1],
          });
        } catch (error) {
          console.error(error);
          toast.error("Error fetching property");
        }
      };
      fetchProperty();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

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
                label="Property Type"
                labelPlacement="outside"
                placeholder="Select property type"
                selectedKeys={propertyType}
                onSelectionChange={setPropertyType}
                radius="md"
                size="lg"
                variant="bordered"
              >
                {PropertyTypeEnum.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </Select>
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
                {facilitiesEnum.map((facility) => (
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
            <ContainerBetween>
              <Heading variant="subheading">Food Menu</Heading>
              <Button
                onClick={onOpenFoodMenu}
                size={"sm"}
                className="active:scale-95"
              >
                + Add
              </Button>
            </ContainerBetween>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>
                    Breakfast
                    <span className="block text-xs">
                      Timing: 7:00 AM - 10:00 AM
                    </span>
                  </TableHead>
                  <TableHead>
                    Lunch
                    <span className="block text-xs">
                      Timing: 12:00 PM - 3:00 PM
                    </span>
                  </TableHead>
                  <TableHead>
                    Snack
                    <span className="block text-xs">
                      Timing: 4:00 PM - 6:00 PM
                    </span>
                  </TableHead>
                  <TableHead>
                    Dinner
                    <span className="block text-xs">
                      Timing: 8:00 PM - 10:00 PM
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {foodMenu &&
                  foodMenu.length > 0 &&
                  foodMenu.map((day: FoodMenuProps, dayIndex) => {
                    return (
                      <TableRow key={dayIndex}>
                        <TableCell className="border-r">{day?.day}</TableCell>
                        <TableCell className="border-r p-0">
                          <div className=" flex flex-col *:flex-1 *:p-4 w-full">
                            <div className="border-b">
                              <span className="block">
                                {day.meals.map(
                                  (meal, mealIndex) =>
                                    meal["name"] === MealNameEnum[0] &&
                                    meal.vegMealItems.length > 0 && (
                                      <span
                                        className="font-semibold"
                                        key={mealIndex}
                                      >
                                        Veg
                                      </span>
                                    )
                                )}
                              </span>
                              <span className="mt-2 flex gap-1">
                                {day?.meals.map((meal) => {
                                  if (
                                    meal["name"] === MealNameEnum[0] &&
                                    meal.vegMealItems.length > 0
                                  ) {
                                    return meal?.vegMealItems?.map((item) => (
                                      <Badge>{item}</Badge>
                                    ));
                                  }
                                })}
                              </span>
                            </div>
                            <div>
                              <span className="block">
                                {day.meals.map(
                                  (meal, mealIndex) =>
                                    meal["name"] === MealNameEnum[0] &&
                                    meal.nonVegMealItems.length > 0 && (
                                      <span
                                        className="font-semibold"
                                        key={mealIndex}
                                      >
                                        Non-Veg
                                      </span>
                                    )
                                )}
                              </span>
                              <span className="mt-2 flex gap-1">
                                {day?.meals.map((meal) => {
                                  if (
                                    meal["name"] === MealNameEnum[0] &&
                                    meal.nonVegMealItems.length > 0
                                  ) {
                                    return meal?.nonVegMealItems?.map(
                                      (item) => <Badge>{item}</Badge>
                                    );
                                  }
                                })}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="border-r p-0">
                          <div className=" flex flex-col *:flex-1 *:p-4 w-full">
                            <div className="border-b">
                              <span className="block">
                                {day?.meals.map(
                                  (meal, mealIndex) =>
                                    meal["name"] === MealNameEnum[1] &&
                                    meal.vegMealItems.length > 0 && (
                                      <span
                                        className="font-semibold"
                                        key={mealIndex}
                                      >
                                        Veg
                                      </span>
                                    )
                                )}
                              </span>
                              <span className="mt-2 flex gap-1">
                                {day?.meals.map((meal) => {
                                  if (
                                    meal["name"] === MealNameEnum[1] &&
                                    meal.vegMealItems.length > 0
                                  ) {
                                    return meal?.vegMealItems?.map((item) => (
                                      <Badge>{item}</Badge>
                                    ));
                                  }
                                })}
                              </span>
                            </div>
                            <div>
                              <span className="block">
                                {day.meals.map(
                                  (meal, mealIndex) =>
                                    meal["name"] === MealNameEnum[1] &&
                                    meal.nonVegMealItems.length > 0 && (
                                      <span
                                        className="font-semibold"
                                        key={mealIndex}
                                      >
                                        Non-Veg
                                      </span>
                                    )
                                )}
                              </span>
                              <span className="mt-2 flex gap-1">
                                {day?.meals.map((meal) => {
                                  if (
                                    meal["name"] === MealNameEnum[1] &&
                                    meal.nonVegMealItems.length > 0
                                  ) {
                                    return meal?.nonVegMealItems?.map(
                                      (item) => <Badge>{item}</Badge>
                                    );
                                  }
                                })}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="border-r">
                          <div className="flex flex-col *:flex-1 w-full">
                            <span className="block">
                              {day?.meals.map((meal, mealIndex) => {
                                //check if there is a meal name snack
                                //and if there are any meal items
                                //if there are no meal items, then show N/P
                                if (
                                  meal["name"] === MealNameEnum[2] &&
                                  meal.hasMealItems == false
                                ) {
                                  return "N/P";
                                }
                                if (
                                  meal["name"] === MealNameEnum[2] &&
                                  (meal.vegMealItems.length > 0 ||
                                    meal.nonVegMealItems.length > 0)
                                ) {
                                  return (
                                    <span
                                      className="font-semibold"
                                      key={mealIndex}
                                    >
                                      snack items
                                    </span>
                                  );
                                }
                              })}
                              {day?.meals.length < 2 && "N/P"}
                            </span>
                            <span className="mt-2 flex gap-1">
                              {day?.meals?.map((meal) => {
                                if (
                                  meal["name"] === MealNameEnum[2] &&
                                  meal.vegMealItems.length > 0
                                ) {
                                  return meal?.vegMealItems?.map((item) => (
                                    <Badge>{item}</Badge>
                                  ));
                                }
                              })}
                            </span>
                            <span className="mt-2 flex gap-1">
                              {day?.meals.map((meal) => {
                                if (
                                  meal["name"] === MealNameEnum[2] &&
                                  meal.nonVegMealItems.length > 0
                                ) {
                                  return meal?.nonVegMealItems?.map((item) => (
                                    <Badge>{item}</Badge>
                                  ));
                                }
                              })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="p-0">
                          <div className=" flex flex-col *:flex-1 *:p-4 w-full">
                            <div className="border-b">
                              <span className="block">
                                {day?.meals.map(
                                  (meal, mealIndex) =>
                                    meal["name"] === MealNameEnum[3] &&
                                    meal.vegMealItems.length > 0 && (
                                      <span
                                        className="font-semibold"
                                        key={mealIndex}
                                      >
                                        Veg
                                      </span>
                                    )
                                )}
                              </span>
                              <span className="mt-2 flex gap-1">
                                {day?.meals.map((meal) => {
                                  if (
                                    meal["name"] === MealNameEnum[3] &&
                                    meal.vegMealItems.length > 0
                                  ) {
                                    return meal?.vegMealItems?.map((item) => (
                                      <Badge>{item}</Badge>
                                    ));
                                  }
                                })}
                              </span>
                            </div>
                            <div>
                              <span className="block">
                                {day?.meals.map(
                                  (meal, mealIndex) =>
                                    meal["name"] === MealNameEnum[3] &&
                                    meal.nonVegMealItems.length > 0 && (
                                      <span
                                        className="font-semibold"
                                        key={mealIndex}
                                      >
                                        Non-Veg
                                      </span>
                                    )
                                )}
                              </span>
                              <span className="mt-2 flex gap-1">
                                {day?.meals.map((meal) => {
                                  if (
                                    meal["name"] === MealNameEnum[3] &&
                                    meal.nonVegMealItems.length > 0
                                  ) {
                                    return meal?.nonVegMealItems?.map(
                                      (item) => <Badge>{item}</Badge>
                                    );
                                  }
                                })}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
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
                  {images &&
                    images?.map((image, index) => (
                      <AnimatePresence key={image.label}>
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
                            src={image.url}
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
              isLoading={submitting}
              className="bg-purple-700 active:scale-95"
            >
              Add Property
            </Button>
          </div>
        </ContainerColumn>
      </Container>
      <Modal backdrop="blur" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add Manager Details
              </ModalHeader>
              <ModalBody>
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
              </ModalBody>
              <ModalFooter>
                <Button className="px-8" variant="ghost" onClick={onClose}>
                  Close
                </Button>
                <Button
                  className="px-8"
                  onClick={() => {
                    handleAddManager();
                  }}
                >
                  Add
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isDismissable={false}
        backdrop="blur"
        isOpen={isOpenFoodMenu}
        onOpenChange={onOpenChangeFoodMenu}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add Meal Details
              </ModalHeader>
              <ModalBody>
                <Select
                  label="Select Day"
                  labelPlacement="outside"
                  placeholder="Select an option"
                  color="default"
                  radius="md"
                  size="lg"
                  variant="bordered"
                  selectedKeys={day}
                  onSelectionChange={setDay}
                >
                  {DaysEnum &&
                    DaysEnum.map((Day) => (
                      <SelectItem key={Day} value={Day}>
                        {Day}
                      </SelectItem>
                    ))}
                </Select>
                <Select
                  label="Meal Name"
                  labelPlacement="outside"
                  placeholder="Select an option"
                  color="default"
                  radius="md"
                  size="lg"
                  variant="bordered"
                  selectedKeys={mealName}
                  onSelectionChange={setMealName}
                >
                  {MealNameEnum &&
                    MealNameEnum.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                </Select>
                <Input
                  autoFocus
                  type="text"
                  label="Veg Meal Items"
                  labelPlacement="outside"
                  placeholder="Enter Veg Items"
                  variant="bordered"
                  size="lg"
                  radius="md"
                  value={vegMealItems}
                  onValueChange={setVegMealItems}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (!vegMealItems) {
                        toast.error("Meal item cannot be empty");
                        return;
                      }
                      setVegMealItemsArray([
                        ...vegMealItemsArray,
                        vegMealItems,
                      ]);
                      setVegMealItems("");
                    }
                  }}
                />

                <div className="flex gap-1">
                  {vegMealItemsArray.map((item) => {
                    return (
                      <Badge key={item} className="px-3 py-1.5 ">
                        {item}
                      </Badge>
                    );
                  })}
                </div>
                <Input
                  autoFocus
                  type="text"
                  label="Non-Veg Meal Items"
                  labelPlacement="outside"
                  placeholder="Enter Non-Veg Items"
                  variant="bordered"
                  size="lg"
                  radius="md"
                  value={nonVegMealItems}
                  onValueChange={setNonVegMealItems}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (!nonVegMealItems) {
                        toast.error("Meal item cannot be empty");
                        return;
                      }
                      setNonVegMealItemsArray([
                        ...nonVegMealItemsArray,
                        nonVegMealItems,
                      ]);
                      setNonVegMealItems("");
                    }
                  }}
                />

                <div className="flex gap-1">
                  {nonVegMealItemsArray.map((item) => {
                    return (
                      <Badge key={item} className="px-3 py-1.5 ">
                        {item}
                      </Badge>
                    );
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
export default EditProperty;
