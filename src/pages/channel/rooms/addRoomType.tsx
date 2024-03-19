import Container from "@/components/container";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import { GlobalContextType } from "@/components/providers";
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

const AddRoomType: FC<Props> = () => {
    const { user, selectedProperty, isPropertyLoading } = useGlobalContext() as GlobalContextType;
    const [title, setTitle] = useState<string | undefined>("");
    const [adultOccupancy, setAdultOccupancy] = useState<string | undefined>("");
    const [childrenOccupancy, setChildrenOccupancy] = useState<string | undefined>("");
    const [cotSpaces, setCotSpaces] = useState<string | undefined>("");
    const [roomSize, setRoomSize] = useState<string | undefined>("");
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
        if (
            !roomSize ||
            !roomDescription ||
            images.roomImage.length === 0 ||
            images.washroomImage.length === 0 ||
            images.bedImage.length === 0
        ) {
            toast.error("Please fill all the fields");
            return;
        }

        const rf = Array.from(roomFacilities);
        const obj = {
            room_type: {
                "property_id": '1776e383-bdb1-488c-a748-71128ad9ae84',
                "meta": null,
                "position": 0,
                "title": title,
                "count_of_rooms": roomCount,
                "occ_adults": adultOccupancy,
                "occ_children": childrenOccupancy,
                "occ_infants": cotSpaces,
                "default_occupancy": 2,
                "facilities": [],
                "room_kind": "room",
                "capacity": null
            }
        };
        const addToast = toast.loading("Adding Room...");
        try {
            const res = await axios.post("https://rofabs.onrender.com/api/channex/" + "room_type", obj, {
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

    return (
        <Container>
            <ContainerColumn>
                <Heading>Add RoomType</Heading>
            </ContainerColumn>
            <div className="mt-5 p-5 bg-zinc-50 border rounded-md w-full">
                <Heading variant="subheading">Details</Heading>
                <div className="mt-5 grid grid-cols-3 gap-5 w-full">
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
                    <Input
                        type="number"
                        onWheel={(e) => e.currentTarget.blur()}
                        name="roomSize"
                        label="Room Size (per Sqft)"
                        labelPlacement="outside"
                        placeholder="Enter Room Size"
                        color="default"
                        isRequired={true}
                        value={roomSize}
                        onValueChange={setRoomSize}
                        radius="md"
                        size="lg"
                        variant="bordered"
                    />
                    <div className="flex items-center gap-2.5">
                        <Input
                            type="number"
                            onWheel={(e) => e.currentTarget.blur()}
                            name="adultOccupancy"
                            label="Adult Occupancy"
                            labelPlacement="outside"
                            placeholder="Maximum Occupancy"
                            color="default"
                            isRequired={true}
                            value={adultOccupancy}
                            onValueChange={setAdultOccupancy}
                            radius="md"
                            size="lg"
                            variant="bordered"
                        />
                        <Input
                            type="number"
                            onWheel={(e) => e.currentTarget.blur()}
                            name="childrenSpaces"
                            label="Children Spaces"
                            labelPlacement="outside"
                            placeholder="Children Spaces"
                            color="default"
                            isRequired={true}
                            value={childrenOccupancy}
                            onValueChange={setChildrenOccupancy}
                            radius="md"
                            size="lg"
                            variant="bordered"
                        />
                        <Input
                            type="number"
                            onWheel={(e) => e.currentTarget.blur()}
                            name="cotSpaces"
                            label="Cot Spaces"
                            labelPlacement="outside"
                            placeholder="Cot Spaces"
                            color="default"
                            isRequired={true}
                            value={cotSpaces}
                            onValueChange={setCotSpaces}
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
                    <Input
                        type="number"
                        onWheel={(e) => e.currentTarget.blur()}
                        name="roomDeposit"
                        label="Deposit"
                        labelPlacement="outside"
                        placeholder="₹000"
                        color="default"
                        isRequired={true}
                        value={roomDeposit}
                        onValueChange={setRoomDeposit}
                        radius="md"
                        size="lg"
                        variant="bordered"
                    />
                    <Input
                        type="number"
                        onWheel={(e) => e.currentTarget.blur()}
                        name="roomCount"
                        label="Room Count"
                        labelPlacement="outside"
                        placeholder="₹000"
                        color="default"
                        isRequired={true}
                        value={roomCount}
                        onValueChange={setRoomCount}
                        radius="md"
                        size="lg"
                        variant="bordered"
                    />

                    {/* <div className="flex gap-2.5 items-center justify-between mt-5 w-full">
            <div className="flex items-center justify-start gap-2">
              <Switch
                isSelected={isGuestLiving}
                onValueChange={setIsGuestLiving}
                size="sm"
              >
                Already Guest Living ?
              </Switch>
              <Tooltip
                content="if already guests are living in this room, their information should be added seperately"
                className="max-w-xs text-center"
              >
                <Info className="h-4 w-4 text-zinc-500" />
              </Tooltip>
            </div>
            <Badge variant={"outline"} className="py-1.5">
              Vacant Beds :{" "}
              {guestDetails?.length == 0
                ? parseInt(maxOccupancy || "0")
                : parseInt(maxOccupancy || "0") - guestDetails?.length}
            </Badge>
          </div> */}
                </div>
            </div>
            {/* {isGuestLiving == true && (
        <div className="mt-5 p-5 bg-zinc-50 border rounded-md w-full flex flex-col justify-start items-start gap-5">
          <Heading variant="subheading" className="">
            Guest Details
          </Heading>
          {guestDetails.length > 0 && (
            <div className="grid grid-cols-3 gap-2.5">
              {guestDetails.map((guest) => {
                return (
                  <div className="px-3 py-2.5 bg-zinc-950 text-white rounded-lg flex flex-col items-start">
                    <span className="text-sm font-semibold">{guest.name}</span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex items-center justify-start gap-2.5">
            <Input
              type="text"
              name="guestName"
              label="Guest Name"
              labelPlacement="outside"
              placeholder="Enter Guest Name"
              color="default"
              isRequired={true}
              value={guestName}
              onValueChange={setGuestName}
              radius="md"
              size="lg"
              variant="bordered"
            />

            <Input
              type="number"
              onWheel={(e) => e.currentTarget.blur()}
              name="guestName"
              label="Guest Phone Number"
              labelPlacement="outside"
              placeholder="Enter Guest Phone Number"
              color="default"
              isRequired={true}
              value={guestPhoneNumber}
              onValueChange={setGuestPhoneNumber}
              radius="md"
              size="lg"
              variant="bordered"
            />
            <Input
              type="text"
              name="guestEmail"
              label="Guest Email"
              labelPlacement="outside"
              placeholder="Enter Guest Email"
              color="default"
              value={guestEmail}
              onValueChange={setGuestEmail}
              radius="md"
              size="lg"
              variant="bordered"
            />
            <div className="flex flex-col items-start gap-2.5 w-full">
              <Label>Check out date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="bordered"
                    radius="md"
                    size="lg"
                    className={cn(
                      "w-[280px] justify-start text-left font-normal"
                      // !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {guestCheckOutDate ? (
                      format(guestCheckOutDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={guestCheckOutDate}
                    onSelect={setGuestCheckOutDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button
              onClick={(e) => {
                e.preventDefault();
                if (parseInt(maxOccupancy || "0") - guestDetails.length == 0) {
                  toast.error("No more beds available");
                  return;
                }
                if (guestName?.length == 0 || guestPhoneNumber?.length == 0) {
                  toast.error("Please fill all the fields");
                }
                if (guestName && guestPhoneNumber) {
                  setGuestDetails((prevGuestDetails) => [
                    ...prevGuestDetails,
                    {
                      name: guestName,
                      email: guestEmail || "",
                      phoneNumber: guestPhoneNumber,
                      checkOutDate: guestCheckOutDate,
                    },
                  ]);
                  setGuestName("");
                  setGuestEmail("");
                  setGuestPhoneNumber("");
                  setGuestCheckOutDate(undefined);
                }
              }}
              className="px-7 rounded-lg mt-5 active:scale-95 ml-1"
            >
              Add Guest
            </Button>
          </div>
        </div>
      )} */}
            <div className="mt-5 p-5 bg-zinc-50 border rounded-md w-full flex flex-col justify-start items-start gap-5">
                <Heading variant="subheading">Images</Heading>
                <div className="grid grid-cols-4 gap-2.5 w-full">
                    <div className="relative px-16 py-16 bg-zinc-100 rounded-md border-dashed border-2 w-full">
                        {images.roomImage.length > 0 && (
                            <img
                                src={images.roomImage[0]?.url}
                                alt="Room Image"
                                className="w-full h-full object-cover rounded-md"
                            />
                        )}
                        <input
                            type="file"
                            name="roomImage"
                            multiple={true}
                            required
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full h-full absolute top-0 right-0 bottom-0 left-0 opacity-0 cursor-pointer z-10"
                        />
                        <span className="inset-0 absolute z-[1] text-sm text-zinc-600 flex justify-center items-center">
                            + Room Image
                        </span>
                    </div>
                    <div className="relative px-16 py-16 bg-zinc-100 rounded-md border-dashed border-2 w-full">
                        {images.washroomImage.length > 0 && (
                            <img
                                src={images.washroomImage[0]?.url}
                                alt="Washroom Image"
                                className="w-full h-full object-cover rounded-md"
                            />
                        )}
                        <input
                            type="file"
                            name="washroomImage"
                            multiple={true}
                            required
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full h-full absolute top-0 right-0 bottom-0 left-0 opacity-0 cursor-pointer z-10"
                        />
                        <span className="inset-0 absolute z-[1] text-sm text-zinc-600 flex justify-center items-center">
                            + Washroom Image
                        </span>
                    </div>
                    <div className="relative px-16 py-16 bg-zinc-100 rounded-md border-dashed border-2 w-full">
                        {images.bedImage.length > 0 && (
                            <img
                                src={images.bedImage[0]?.url}
                                alt="Bed Image"
                                className="w-full h-full object-cover rounded-md"
                            />
                        )}
                        <input
                            type="file"
                            name="bedImage"
                            multiple={true}
                            required
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full h-full absolute top-0 right-0 bottom-0 left-0 opacity-0 cursor-pointer z-10"
                        />
                        <span className="inset-0 absolute z-[1] text-sm text-zinc-600 flex justify-center items-center">
                            + Bed Image
                        </span>
                    </div>
                    <div className="relative px-16 py-16 aspect-square bg-zinc-100 rounded-md border-dashed border-2 w-full">
                        <input
                            type="file"
                            name="additionalImages"
                            multiple={true}
                            required
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full h-full absolute top-0 right-0 bottom-0 left-0 opacity-0 cursor-pointer z-10"
                        />
                        <span className="inset-0 absolute z-[1] text-sm text-zinc-600 flex justify-center items-center">
                            Additional Images (upto five)
                        </span>
                    </div>
                </div>
            </div>
            <div className="mt-5 p-5 bg-zinc-50 border rounded-md w-full flex flex-col justify-start items-start gap-5">
                <Heading variant="subheading">Extra</Heading>
                <Select
                    name="roomFacilities"
                    color="default"
                    label="Room Facilities"
                    labelPlacement="outside"
                    selectionMode="multiple"
                    placeholder="Select Room Facilities"
                    selectedKeys={roomFacilities}
                    onSelectionChange={setRoomFacilities}
                    radius="md"
                    size="lg"
                    variant="bordered"
                >
                    {FacilitiesEnum.map((facility) => (
                        <SelectItem key={facility} value={facility}>
                            {facility}
                        </SelectItem>
                    ))}
                </Select>
                <Textarea
                    name="description"
                    label="Description"
                    labelPlacement="outside"
                    placeholder="Enter Room Description"
                    color="default"
                    // isRequired={true}
                    value={roomDescription}
                    onValueChange={setRoomDescription}
                    radius="md"
                    size="lg"
                    variant="bordered"
                    disableAnimation
                    disableAutosize
                    classNames={{
                        input: "resize-y min-h-[150px]",
                    }}
                />
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
                    Add Room
                </Button>
            </div>
        </Container>
    );
};

export default AddRoomType;
