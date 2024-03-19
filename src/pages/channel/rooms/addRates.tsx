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
  const [roomTypeId, setRoomTypeId] = useState<any>("");
  const [currency, setCurrency] = useState<any>("");
  const [adultOccupancy, setAdultOccupancy] = useState<string | undefined>("");
  const [childrenOccupancy, setChildrenOccupancy] = useState<string | undefined>("");
  const [cotSpaces, setCotSpaces] = useState<string | undefined>("");
  const [roomSize, setRoomSize] = useState<string | undefined>("");
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
  const [roomCount, setRoomCount] = useState<string | undefined>("");
  const [images, setImages] = useState<ImagesProps>({
    roomImage: [],
    washroomImage: [],
    bedImage: [],
    additionalImages: [],
  });
  const [roomFacilities, setRoomFacilities] = useState<Selection>(new Set([]));
  const [roomDescription, setRoomDescription] = useState<string | undefined>("");

  console.log(selectedProperty, 'selectedproperty');

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
        room_type_id: roomTypeId,
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
            "rate": 0
          }
        ],
        "currency": "GBP",
        "sell_mode": "per_room",
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
  console.log(roomTypeId, 'roomtypeid');
  return (
    <Container>
      <ContainerColumn>
        <Heading>Add RoomRate</Heading>
      </ContainerColumn>
      <div className="mt-5 p-5 bg-zinc-50 border rounded-md w-full">
        <Heading variant="subheading">Details</Heading>
        <div className="mt-5 grid grid-cols-3 gap-5 w-full">

          <div className="flex items-center gap-2.5">
            <Input
              type="string"
              onWheel={(e) => e.currentTarget.blur()}
              name="title"
              label="Title"
              labelPlacement="outside"
              placeholder="title"
              color="default"
              isRequired={true}
              value={title}
              onValueChange={setTitle}
              radius="md"
              size="lg"
              variant="bordered"
            />
            {/* <div className="flex items-center gap-2 mt-5">
              <button
                // onClick={() => {
                //   if (quantity > 1) {
                //     setQuantity(quantity - 1);
                //   }
                // }}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 font-sora font-semibold text-black duration-150 hover:bg-gray-200 active:scale-90 active:bg-gray-300"
              >
                -
              </button>
              <p className="font-sora text-xl font-semibold text-gray-900">
                {maxOccupancy || 0}
              </p>
              <button
                onClick={() => {}}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 font-sora font-semibold text-black duration-150 hover:bg-gray-200 active:scale-90 active:bg-gray-300"
              >
                +
              </button>
            </div> */}
          </div>
          <Input
            type="number"
            onWheel={(e) => e.currentTarget.blur()}
            name="roomPricePerDay"
            label="Room Price (per day)"
            labelPlacement="outside"
            placeholder="₹000"
            color="default"
            isRequired={true}
            value={roomPricePerDay}
            onValueChange={setRoomPricePerDay}
            radius="md"
            size="lg"
            variant="bordered"
          />
          <Select
            color="default"
            label="Room Type"
            labelPlacement="outside"
            placeholder="Select Room Type"
            selectedKeys={roomTypeId}
            onSelectionChange={setRoomTypeId}
            radius="md"
            size="lg"
            variant="bordered"
          >
            {roomTypes.map((category: any) => (
              <SelectItem key={category.id} value={category.id}>
                {category?.title}
              </SelectItem>
            ))}
          </Select>
        </div>
        <div className="mt-4">
          <div className="border-b-[1px]">
            <legend>Price Settings</legend>
          </div>
          <div className="flex items-center grid grid-cols-4 gap-2.5 mb-2">
            <Label htmlFor="username" className="text-right">
              Currency:
            </Label>
            <Select
              color="default"
              label=""
              labelPlacement="outside"
              placeholder="Select Currency"
              selectedKeys={currency}
              onSelectionChange={setCurrency}
              radius="md"
              size="lg"
              variant="bordered"
            >
              {roomTypes.map((category: any) => (
                <SelectItem key={category.id} value={category.id}>
                  {category?.title}
                </SelectItem>
              ))}
            </Select></div>
          <div className="flex items-center grid gap-2.5 grid-cols-4 mb-2">
            <Label htmlFor="username" className="text-right">
              Sell Mode:
            </Label>
            <Select
              color="default"
              label=""
              labelPlacement="outside"
              placeholder="Select Currency"
              selectedKeys={currency}
              onSelectionChange={setCurrency}
              radius="md"
              size="lg"
              variant="bordered"
            >
              {roomTypes.map((category: any) => (
                <SelectItem key={category.id} value={category.id}>
                  {category?.title}
                </SelectItem>
              ))}
            </Select></div>
          <div className="flex items-center grid grid-cols-4 gap-2.5">
          <Label htmlFor="username" className="text-right">
              Rate:
            </Label><Select
            color="default"
            label=""
            labelPlacement="outside"
            placeholder="Select Currency"
            selectedKeys={currency}
            onSelectionChange={setCurrency}
            radius="md"
            size="lg"
            variant="bordered"
          >
            {roomTypes.map((category: any) => (
              <SelectItem key={category.id} value={category.id}>
                {category?.title}
              </SelectItem>
            ))}
          </Select></div>
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
            Add Room Rate
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default AddRates;
