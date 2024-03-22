import Container from "@/components/container";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import { GlobalContextType } from "@/components/providers";
import { Label } from "@/components/ui/label";
import firebase_app from "@/lib/firebase";
import { SERVER_URL, useGlobalContext } from "@/lib/utils";
import {
  Avatar,
  Button,
  Input,
  Select,
  SelectItem,
  SelectedItems,
  Selection,
  Textarea,
} from "@nextui-org/react";
import axios, { AxiosError, AxiosResponse } from "axios";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import React, { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
// import { useNavigate } from "react-router-dom";

type Props = {
  children?: React.ReactNode;
};

interface PropertyProps {
  _id: string;
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
  propertyType?: string;
  isParkingSpaceAvailable?: boolean | "true" | "false" | string;
  isCoupleFriendly?: boolean;
  foodMenu?: FoodMenuProps[];
}

interface AnimalProps {
  description: string;
  value: string;
  label: string;
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

// interface GuestDetailsProps {
//   name: string;
//   email: string;
//   phoneNumber: string;
//   checkOutDate?: Date;
// }

interface ImagesProps {
  roomImage: { label: string; url: string }[];
  washroomImage: { label: string; url: string }[];
  bedImage: { label: string; url: string }[];
  additionalImages: { label: string; url: string }[];
}

const RoomCategoryEnum = ["A/C", "Non A/C"];

const RoomTypeEnum = ["Single", "Double", "Triple", "Dormitory"];

const FacilitiesEnum = [
  "TV",
  "GEYSER",
  "HOT WATER",
  "KETTLE",
  "AC",
  "fridge",
  "Washing machine",
];

const storage = getStorage(firebase_app);

const AddRates: FC<Props> = () => {
  const { user, selectedProperty, isPropertyLoading } = useGlobalContext() as GlobalContextType;
  const [title, setTitle] = useState<string | undefined>("");
  const [roomType, setRoomType] = useState<any>(new Set([]));
  const [meals, setMeals] = useState<any>(new Set([]));
  const [currency, setCurrency] = useState<any>(new Set([]));
  const [animals, setAnimals] = useState<AnimalProps[]>([
    { label: "Cat", value: "cat", description: "The second most popular pet in the world" },
    { label: "Dog", value: "dog", description: "The most popular pet in the world" },
    { label: "Elephant", value: "elephant", description: "The largest land animal" }])
  const [value, setValue] = React.useState<any>(new Set([]));
  const [adultOccupancy, setAdultOccupancy] = useState<string | undefined>("");
  const [childrenOccupancy, setChildrenOccupancy] = useState<string | undefined>("");
  const [cotSpaces, setCotSpaces] = useState<string | undefined>("");
  const [roomSize, setRoomSize] = useState<string | undefined>("");
  const [rateForOne, setRateForOne] = useState<string | undefined>("");
  const [rateForTwo, setRateForTwo] = useState<string | undefined>("");
  const [rateForThree, setRateForThree] = useState<string | undefined>("");
  const [rate, setRate] = useState<string | undefined>("");
  const [infantFee, setInfantFee] = useState<string | undefined>("");
  const [childrenFee, setChildrenFee] = useState<string | undefined>("");
  const [roomTypes, setRoomTypes] = useState<any[]>([]);

  // const [isGuestLiving, setIsGuestLiving] = useState<boolean>(false);
  // const [guestName, setGuestName] = useState<string | undefined>("");
  // const [guestEmail, setGuestEmail] = useState<string | undefined>("");
  // const [guestPhoneNumber, setGuestPhoneNumber] = useState<string | undefined>(
  //   ""
  // );
  // const [guestCheckOutDate, setGuestCheckOutDate] = useState<
  //   Date | undefined
  // >();
  // const [guestDetails, setGuestDetails] = useState<GuestDetailsProps[]>([]);
  const [roomPricePerDay, setRoomPricePerDay] = useState<
    string | undefined
  >("");
  const [roomDeposit, setRoomDeposit] = useState<string | undefined>("");
  const [sellMode, setSellMode] = useState<string | undefined>("per_room");
  const [rateMode, setRateMode] = useState<string | undefined>("manual");
  const [roomCount, setRoomCount] = useState<string | undefined>("");
  const [images, setImages] = useState<ImagesProps>({
    roomImage: [],
    washroomImage: [],
    bedImage: [],
    additionalImages: [],
  });
  const [roomFacilities, setRoomFacilities] = useState<Selection>(new Set([]));
  const [roomDescription, setRoomDescription] = useState<string | undefined>("");

  console.log(currency, roomType, 'selectedproperty');

  // const navigate = useNavigate();
  const fetchRoomTypes = async () => {
    try {
      const res = await axios.get("https://rofabs.onrender.com/api/channex/room_types");
      const { data } = res.data;
      setRoomTypes([...data.map((r: any) => r?.attributes)]);
      console.log(data);
    } catch (error) {
      toast.error((error as Error)?.message || "An error occurred");
    } finally {
      //setLoading(false);
    }
  };
  useEffect(() => {
    if (user?.userId) fetchRoomTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);


  const uploadImagesToFirebase = async (images: File[]) => {
    const imageUrls = [];

    try {
      for (const image of images) {
        const imageRef = ref(
          storage,
          `room_images/${Date.now()}-${image.name}`
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
    }
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, files } = event.target;
    if (!files || files?.length == 0 || !name) {
      toast.error("No images selected");
      return;
    }
    // check image size
    for (const file of Array.from(files)) {
      if (file.size > 1024 * 1024 * 1) {
        toast.error("Image size should be less than 1MB");
        return;
      }
    }
    toast.loading("Uploading Images...");
    const images = await uploadImagesToFirebase(Array.from(files!));

    setImages((prevImages) => ({
      ...prevImages,
      [name]: images,
    }));
    toast.dismiss();
    toast.success("Images Uploaded Successfully!");
  };

  const handleSubmit = async () => {
    if (!"abcd"
    ) {
      toast.error("Please fill all the fields");
      return;
    }

    const rf = Array.from(roomFacilities);
    const obj = {
      rate_plan: {
        title: title,
        property_id: "1776e383-bdb1-488c-a748-71128ad9ae84",
        room_type_id: roomType?.currentKey,
        parent_rate_plan_id: null,
        children_fee: "0.00",
        infant_fee: "0.00",
        max_stay: [0, 0, 0, 0, 0, 0, 0],
        min_stay_arrival: [1, 1, 1, 1, 1, 1, 1],
        min_stay_through: [1, 1, 1, 1, 1, 1, 1],
        closed_to_arrival: [false, false, false, false, false, false, false],
        closed_to_departure: [false, false, false, false, false, false, false],
        stop_sell: [false, false, false, false, false, false, false],
        options: [
          {
            "occupancy": 3,
            "is_primary": true,
            "rate": rate
          }
        ],
        "currency": currency?.currentKey,
        "sell_mode": sellMode,
        "rate_mode": "manual",
        "inherit_rate": false,
        "inherit_closed_to_arrival": false,
        "inherit_closed_to_departure": false,
        "inherit_stop_sell": false,
        "inherit_min_stay_arrival": false,
        "inherit_min_stay_through": false,
        "inherit_max_stay": false,
        "inherit_max_sell": false,
        "inherit_max_availability": false,
        "inherit_availability_offset": false,
        "auto_rate_settings": null
      }
    };
    const addToast = toast.loading("Adding Room...");
    try {
      const res = await axios.post("https://rofabs.onrender.com/api/channex/" + "rate_plan", obj, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const data = await res.data();
      console.log(data);

      toast.success("Room added successfully");
      // navigate("/rooms");
    } catch (error) {
      const err = error as AxiosError & { response: AxiosResponse };
      console.error(err);
      toast.error(err.response.data?.message || "Something went wrong!");
    } finally {
      toast.dismiss(addToast);
    }
  };
  console.log(roomTypes, roomType, 'roomtypeid');
  return (
    <Container className="h-[85vh] overflow-scroll">
      <Heading>Create Rate</Heading>
      <div className="mt-1 p-0 rounded-md w-full">
        <div className="mt-1 w-full">
          <div className="flex items-center flex-row justify-center gap-2.5 mb-2">
            <Label htmlFor="username" className="text-right w-[30vw]">
              Title:
            </Label>
            <Input
              type="string"
              onWheel={(e) => e.currentTarget.blur()}
              name="title"
              labelPlacement="outside"
              placeholder="title"
              color="default"
              className="w-[70vw]"
              isRequired={true}
              value={title}
              onValueChange={setTitle}
              radius="md"
              size="lg"
              variant="bordered"
            />
          </div>
          <div className="flex items-center flex-row justify-center gap-2.5 mb-2">
            <Label htmlFor="username" className="text-right w-[30vw]">
              Property:
            </Label>
            <Select
              items={roomTypes || []}
              placeholder="Select a property"
              labelPlacement="outside"
              variant="bordered"
              selectedKeys={roomType}
              onSelectionChange={setRoomType}
              classNames={{
                trigger: "h-12",
              }}
              renderValue={(items: any) => {
                return items.map((item: any) => (
                  <div key={item.data.key} className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <div className="flex items-center justify-start gap-1">
                        <span>{item.data.title}</span>
                      </div>
                    </div>
                  </div>
                ));
              }}
            >
              {(p) => (
                <SelectItem key={p?.id} value={p?.title}>
                  <div className="flex gap-2 items-center">
                    <div className="flex flex-col">
                      <span className="text-small">{p?.title}</span>
                    </div>
                  </div>
                </SelectItem>
              )}
            </Select>
          </div>
          <div className="flex items-center flex-row justify-center gap-2.5 mb-2">
            <Label htmlFor="username" className="text-right w-[30vw]">
              Room Type:
            </Label>
            <Select
              items={roomTypes || []}
              placeholder="Select Room Type"
              labelPlacement="outside"
              variant="bordered"
              selectedKeys={roomType}
              onSelectionChange={setRoomType}
              classNames={{
                trigger: "h-12",
              }}
              renderValue={(items: any) => {
                return items.map((item: any) => (
                  <div key={item.data.key} className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <div className="flex items-center justify-start gap-1">
                        <span>{item.data.title}</span>
                      </div>
                    </div>
                  </div>
                ));
              }}
            >
              {(p) => (
                <SelectItem key={p?.id} value={p?.title}>
                  <div className="flex gap-2 items-center">
                    <div className="flex flex-col">
                      <span className="text-small">{p?.title}</span>
                    </div>
                  </div>
                </SelectItem>
              )}
            </Select>
          </div>
        </div>
        <div className="mt-4">
          <div className="border-b-[1px] my-2">
            <legend>Price Settings</legend>
          </div>
          <div className="flex items-center flex-row justify-center gap-2.5 mb-2">
            <Label htmlFor="username" className="text-right w-[30vw]">
              Currency:
            </Label>
            <Select
              name="currency"
              color="default"
              labelPlacement="outside"
              placeholder="Select Currency"
              selectedKeys={currency}
              onSelectionChange={setCurrency}
              radius="md"
              size="lg"
              variant="bordered"
            >
              {['INR', 'GBP'].map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className="flex items-center flex-row justify-center gap-2.5 my-3">
            <Label htmlFor="username" className="text-right w-[30vw]">
              Sell Mode:
            </Label>
            <div className="w-[70vw]">
              <input onChange={() => setSellMode("per_room")} type="radio" checked={sellMode == "per_room"} id="html" name="sellMode" value="perRoom" className="mr-1" />
              <label htmlFor="html" className="mr-2">Per Room</label>
              <input onChange={() => setSellMode("per_person")} type="radio" checked={sellMode == "per_person"} id="css" name="sellMode" value="perPerson" className="mr-1" />
              <label htmlFor="css">Per Person</label><br />
            </div>
          </div>
          {sellMode == "per_room" ? <div className="flex items-center flex-row justify-center gap-2.5 mb-2">
            <Label htmlFor="username" className="text-right w-[30vw]">
              Rate:
            </Label>
            <Input
              type="string"
              onWheel={(e) => e.currentTarget.blur()}
              name="title"
              labelPlacement="outside"
              placeholder="rate"
              color="default"
              className="w-[70vw]"
              isRequired={true}
              value={rate}
              onValueChange={setRate}
              radius="md"
              size="lg"
              variant="bordered"
            />
          </div> : <>
            <div className="flex items-center flex-row justify-center gap-2.5 my-3">
              <Label htmlFor="username" className="text-right w-[30vw]">
                Rate Mode:
              </Label>
              <div className="w-[70vw]">
                <input onChange={() => setRateMode("manual")} type="radio" checked={rateMode == "manual"} id="html" name="rateMode" value="manual" className="mr-1" />
                <label htmlFor="html" className="mr-2">Manual</label>
                <input onChange={() => setRateMode("derived")} type="radio" checked={rateMode == "derived"} id="html" name="rateMode" value="derived" className="mr-1" />
                <label htmlFor="html" className="mr-2">Derived</label>
                <input onChange={() => setRateMode("auto")} type="radio" checked={rateMode == "auto"} id="css" name="rateMode" value="auto" className="mr-1" />
                <label htmlFor="css">Auto</label><br />
              </div>
            </div>
            <div className="flex items-center flex-row justify-center gap-2.5 mb-2">
              <Label htmlFor="username" className="text-right w-[30vw]">
                Rate for 1 Person:
              </Label>
              <Input
                type="string"
                onWheel={(e) => e.currentTarget.blur()}
                name="title"
                labelPlacement="outside"
                placeholder="rate"
                color="default"
                className="w-[70vw]"
                isRequired={true}
                value={rate}
                onValueChange={setRate}
                radius="md"
                size="lg"
                variant="bordered"
              />
            </div>
            <div className="flex items-center flex-row justify-center gap-2.5 mb-2">
              <Label htmlFor="username" className="text-right w-[30vw]">
                Rate for 2 Person:
              </Label>
              <Input
                type="string"
                onWheel={(e) => e.currentTarget.blur()}
                name="title"
                labelPlacement="outside"
                placeholder="rate"
                color="default"
                className="w-[70vw]"
                isRequired={true}
                value={rate}
                onValueChange={setRate}
                radius="md"
                size="lg"
                variant="bordered"
              />
            </div>
            <div className="flex items-center flex-row justify-center gap-2.5 mb-2">
              <Label htmlFor="username" className="text-right w-[30vw]">
                Rate for 3 Person:
              </Label>
              <Input
                type="string"
                onWheel={(e) => e.currentTarget.blur()}
                name="title"
                labelPlacement="outside"
                placeholder="rate"
                color="default"
                className="w-[70vw]"
                isRequired={true}
                value={rate}
                onValueChange={setRate}
                radius="md"
                size="lg"
                variant="bordered"
              />
            </div>
            <div className="flex items-center flex-row justify-center gap-2.5 mb-2">
              <Label htmlFor="username" className="text-right w-[30vw]">
                Children Fee:
              </Label>
              <Input
                type="string"
                onWheel={(e) => e.currentTarget.blur()}
                name="title"
                labelPlacement="outside"
                placeholder="rate"
                color="default"
                className="w-[70vw]"
                isRequired={true}
                value={childrenFee}
                onValueChange={setChildrenFee}
                radius="md"
                size="lg"
                variant="bordered"
              />
            </div>
            <div className="flex items-center flex-row justify-center gap-2.5 mb-2">
              <Label htmlFor="username" className="text-right w-[30vw]">
                Infant Fee:
              </Label>
              <Input
                type="string"
                onWheel={(e) => e.currentTarget.blur()}
                name="title"
                labelPlacement="outside"
                placeholder="rate"
                color="default"
                className="w-[70vw]"
                isRequired={true}
                value={infantFee}
                onValueChange={setInfantFee}
                radius="md"
                size="lg"
                variant="bordered"
              />
            </div>
          </>}
        </div>
        <div className="mt-4">
          <div className="border-b-[1px] my-2">
            <legend>Additional Information</legend>
          </div>
          <div className="flex items-center flex-row justify-center gap-2.5 mb-2">
            <Label htmlFor="username" className="text-right w-[30vw]">
              Meal Type:
            </Label>
            <Select
              name="currency"
              color="default"
              labelPlacement="outside"
              placeholder="Select Meals"
              selectedKeys={meals}
              onSelectionChange={setMeals}
              radius="md"
              size="lg"
              variant="bordered"
            >
              {['INR', 'GBP'].map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className="flex items-center flex-row justify-center gap-2.5 mb-2">
            <Label htmlFor="username" className="text-right w-[30vw]">
              Cancellation Policy:
            </Label>
            <Input
              type="string"
              onWheel={(e) => e.currentTarget.blur()}
              name="title"
              labelPlacement="outside"
              placeholder="rate"
              color="default"
              className="w-[65vw]"
              isRequired={true}
              value={rate}
              onValueChange={setRate}
              radius="md"
              size="lg"
              variant="bordered"
            />
            +
          </div>
          <div className="flex items-center flex-row justify-center gap-2.5 mb-2">
            <Label htmlFor="username" className="text-right w-[30vw]">
              Tax set:
            </Label>
            <Input
              type="string"
              onWheel={(e) => e.currentTarget.blur()}
              name="title"
              labelPlacement="outside"
              placeholder="rate"
              color="default"
              className="w-[65vw]"
              isRequired={true}
              value={rate}
              onValueChange={setRate}
              radius="md"
              size="lg"
              variant="bordered"
            />
            +</div>
          <div className="flex items-center flex-row justify-center gap-2.5">
            <Label htmlFor="username" className="text-right w-[30vw]">
              Last editing UI:
            </Label>
            <Input
              type="string"
              onWheel={(e) => e.currentTarget.blur()}
              name="title"
              labelPlacement="outside"
              placeholder="rate"
              color="default"
              className="w-[70vw]"
              isRequired={true}
              value={rate}
              onValueChange={setRate}
              radius="md"
              size="lg"
              variant="bordered"
            /></div>
        </div>
        <div className="w-full flex justify-end items-center gap-2.5 mt-5">
          <Button variant="ghost" className=" active:scale-95">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            // isLoading={submitting}
            className="bg-purple-700 text-white active:scale-95"
          >
            Create Rate
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default AddRates;
