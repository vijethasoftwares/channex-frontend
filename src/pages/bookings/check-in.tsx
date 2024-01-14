import Container from "@/components/container";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import { GlobalContextType } from "@/components/providers";
import { BookingProps, RoomProps } from "@/components/types/app";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import firebase_app from "@/lib/firebase";
import { SERVER_URL, cn, groupBy, useGlobalContext } from "@/lib/utils";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  Chip,
  Input,
  Select,
  SelectItem,
  SelectedItems,
  Selection,
  Spinner,
  Tab,
  Tabs,
} from "@nextui-org/react";
import axios, { AxiosResponse } from "axios";
import { format } from "date-fns";
import dayjs from "dayjs";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { CalendarIcon } from "lucide-react";
import React, { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { RoomCategoryEnum, RoomTypeEnum } from "./CONSTS";

// const IDProofEnum = ["Aadhar Card", "Pan Card", "Voter ID Card"];
const storage = getStorage(firebase_app);

type Props = {
  children?: React.ReactNode;
};

interface GuestProps {
  name?: string;
  dob?: Date | string | null;
  email?: string;
  phone?: string;
  idProofType?: Selection;
  idProofNumber?: string;
  idProofFrontImage?: { label: string; url: string } | null;
  idProofBackImage?: { label: string; url: string } | null;
}

const CheckIn: FC<Props> = () => {
  const { user } = useGlobalContext() as GlobalContextType;
  const { id } = useParams<{ id: string }>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState<boolean>(false);
  const [, setUpdatingBooking] = useState<boolean>(false);
  const [booking, setBooking] = useState<BookingProps>();
  const [rooms, setRooms] = useState<RoomProps[]>();
  const [checkInDate, setCheckInDate] = React.useState<Date | undefined>();
  const [checkOutDate, setCheckOutDate] = React.useState<Date | undefined>();
  const [noOfGuests, setNoOfGuests] = React.useState<string | undefined>();
  const [roomCategory, setRoomCategory] = useState<Selection>(new Set([]));
  const [roomType, setRoomType] = useState<Selection>(new Set([]));
  const [assignRoom, setAssignRoom] = useState<Selection>(new Set([]));

  const [primaryGuest, setPrimaryGuest] = useState<{
    roomNumber?: number;
    guest: GuestProps;
  }>({
    guest: {
      name: "",
      email: "",
      phone: "",
      dob: "",
      idProofFrontImage: { label: "", url: "" },
      idProofBackImage: { label: "", url: "" },
    },
  });
  const [additionalGuests, setAdditionalGuests] = useState<
    { roomNumber: number; guest: GuestProps }[]
  >([]);

  const handleUpdateBooking = async () => {
    setUpdatingBooking(true);
    if (!checkInDate || !checkOutDate) {
      toast.error("Please select check in and check out dates");
      return;
    }
    if (!noOfGuests) {
      toast.error("Please enter number of guests");
      return;
    }
    if (Array.from(roomCategory).toString() === "") {
      toast.error("Please select room category");
      return;
    }
    if (Array.from(roomType).toString() === "") {
      toast.error("Please select room type");
      return;
    }
    if (Array.from(assignRoom).length === 0) {
      toast.error("Please assign a room");
      return;
    }
    if (
      !primaryGuest.guest.name ||
      !primaryGuest.guest.email ||
      !primaryGuest.guest.phone ||
      !primaryGuest.guest.dob ||
      !primaryGuest.guest.idProofFrontImage?.url ||
      !primaryGuest.guest.idProofBackImage?.url
    ) {
      toast.error("Please fill primary guest details");
      return;
    }

    if (additionalGuests.length + 1 < parseInt(noOfGuests || "0")) {
      toast.error("Please add all guests");
      return;
    }

    const data = {
      numberOfGuest: Number(noOfGuests),
      from: checkInDate,
      to: checkOutDate,
      roomCategory: Array.from(roomCategory).toString(),
      roomType: Array.from(roomType).toString(),
      checkedIn: {
        primaryGuest,
        additionalGuests,
      },
    };
    try {
      const res = await axios.patch(
        SERVER_URL + `/manager/update-booking/check-in/${id}`,
        data,
        {
          headers: {
            Authorization: "Bearer " + user.token,
          },
        }
      );
      const resData = (await res.data) as AxiosResponse & {
        message: string;
      };
      toast.success(resData.message);
      console.log(data);
    } catch (error) {
      console.log(error);
      const err = error as AxiosResponse & {
        response: { data: { message: string } };
      };
      toast.error(err.response.data?.message || "Error updating booking");
    } finally {
      setUpdatingBooking(false);
    }
  };

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await axios.get(SERVER_URL + `/manager/get-booking/${id}`, {
          headers: {
            Authorization: "Bearer " + user.token,
          },
        });
        const data = (await res.data) as AxiosResponse & {
          booking: BookingProps;
          message: string;
          rooms: RoomProps[];
        };
        setBooking(data.booking);
        setRooms(data.rooms);
        setCheckInDate(new Date(data.booking.from));
        setCheckOutDate(new Date(data.booking.to));
        setNoOfGuests(data.booking.numberOfGuest.toString());
        setRoomCategory(new Set([data.booking.roomCategory]));
        setRoomType(new Set([data.booking.roomType]));
        setPrimaryGuest({
          guest: {
            name: data.booking.guestName,
            email: data.booking.guestEmail,
            phone: data.booking.guestPhoneNumber.toString(),
          },
        });
        console.log(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.userId && id) {
      setLoading(true);
      fetchBooking();
    }
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-14 px-5">
        <Spinner size="lg" label="loading booking data..." />
      </div>
    );
  }

  return (
    <>
      <Container>
        <ContainerColumn>
          <Heading>Check in</Heading>
          <div className="flex gap-2 *:p-3 *:bg-zinc-100 *:rounded-lg *: *:text-sm *:font-semibold">
            <div>Booking Name: Arsallan Shahab</div>
          </div>
          <Heading variant="subheading">Booking Details</Heading>
          <div className="grid grid-cols-3 gap-3 w-full p-3 bg-zinc-50 rounded-lg">
            <div className={"grid gap-2.5"}>
              <div className="w-full flex justify-between items-center">
                <Label className="font-normal">Check In</Label>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="bordered"
                    size="lg"
                    radius="md"
                    className={cn(
                      "justify-start text-left font-normal",
                      !checkInDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkInDate ? (
                      format(checkInDate, "PPP")
                    ) : (
                      <span>Check In</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={checkInDate}
                    onSelect={setCheckInDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className={"grid gap-2.5"}>
              <div className="w-full flex justify-between items-center">
                <Label className="font-normal">Check Out</Label>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="bordered"
                    size="lg"
                    radius="md"
                    className={cn(
                      "justify-start text-left font-normal",
                      !checkOutDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOutDate ? (
                      format(checkOutDate, "PPP")
                    ) : (
                      <span>Check Out</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={checkOutDate}
                    onSelect={setCheckOutDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Input
              type="number"
              name="noOfGuests"
              label="No of Guests"
              labelPlacement="outside"
              placeholder="Enter Number of Guests"
              color="default"
              isRequired={true}
              value={noOfGuests}
              onValueChange={setNoOfGuests}
              radius="md"
              size="lg"
              variant="bordered"
            />
            <Select
              color="default"
              label="Room Category"
              labelPlacement="outside"
              placeholder="Select Room Category"
              selectedKeys={roomCategory}
              onSelectionChange={setRoomCategory}
              radius="md"
              size="lg"
              variant="bordered"
            >
              {RoomCategoryEnum.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </Select>
            <Select
              color="default"
              label="Room Type"
              labelPlacement="outside"
              placeholder="Select Room Type"
              selectedKeys={roomType}
              onSelectionChange={setRoomType}
              radius="md"
              size="lg"
              variant="bordered"
            >
              {RoomTypeEnum.map((roomType) => (
                <SelectItem key={roomType} value={roomType}>
                  {roomType}
                </SelectItem>
              ))}
            </Select>
            <Select
              items={rooms || []}
              label="Assign a Room"
              placeholder="Select a Room"
              labelPlacement="outside"
              variant="bordered"
              selectionMode="multiple"
              selectedKeys={assignRoom}
              onSelectionChange={setAssignRoom}
              classNames={{
                trigger: "h-12",
              }}
              renderValue={(items: SelectedItems<RoomProps>) => {
                return (
                  <div className="flex flex-wrap gap-2">
                    {items.map((item) => (
                      <Chip className="rounded-md" key={item.key}>
                        Room {item.data?.roomNumber}
                      </Chip>
                    ))}
                  </div>
                );
              }}
            >
              {(p) => (
                <SelectItem key={p?.roomNumber} textValue={p?._id}>
                  <div className="flex gap-2 items-center">
                    <Avatar
                      alt={p?.images?.roomImage[0]?.url}
                      className="flex-shrink-0"
                      size="sm"
                      src={p?.images.roomImage[0]?.url}
                    />
                    <div className="flex flex-col">
                      <span className="text-small">
                        {p?.roomNumber} - (vacancy: {p?.vacancy})
                      </span>
                      <span className="text-tiny text-default-400">
                        {p?.description}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              )}
            </Select>
          </div>

          <div className="flex flex-col justify-start items-start w-full gap-5">
            {Array.from(assignRoom).length === 0 ? (
              <></>
            ) : (
              <div className="flex flex-col justify-start items-start gap-2.5 w-full">
                <Heading variant="subheading">Guest Details</Heading>
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {primaryGuest?.guest?.email &&
                  primaryGuest?.guest?.phone &&
                  primaryGuest?.guest?.dob ? (
                    <div className="p-5 rounded-lg bg-zinc-50 grid grid-cols-2 gap-y-3">
                      <div className="col-span-2 flex flex-col justify-start items-start">
                        <span className="text-xs font-semibold text-zinc-500">
                          Room Assigned
                        </span>
                        <span className="text-sm font-semibold">
                          {primaryGuest.roomNumber}
                        </span>
                      </div>
                      <div className="flex flex-col justify-start items-start">
                        <span className="text-xs font-semibold text-zinc-500">
                          Primary Guest Name:
                        </span>
                        <span className="text-sm font-semibold">
                          {primaryGuest.guest?.name}
                        </span>
                      </div>
                      <div className="flex flex-col justify-start items-start">
                        <span className="text-xs font-semibold text-zinc-500">
                          Primary Guest Email:
                        </span>
                        <span className="text-sm font-semibold">
                          {primaryGuest.guest?.email}
                        </span>
                      </div>
                      <div className="flex flex-col justify-start items-start">
                        <span className="text-xs font-semibold text-zinc-500">
                          Primary Guest Phone:
                        </span>
                        <span className="text-sm font-semibold">
                          {primaryGuest.guest?.phone}
                        </span>
                      </div>
                      <div className="flex flex-col justify-start items-start">
                        <span className="text-xs font-semibold text-zinc-500">
                          Primary Guest DOB:
                        </span>
                        <span className="text-sm font-semibold">
                          {dayjs(primaryGuest.guest?.dob).format("DD/MM/YYYY")}{" "}
                          : Age -{" "}
                          {dayjs().diff(primaryGuest.guest?.dob, "year")}
                        </span>
                      </div>
                    </div>
                  ) : null}
                  {additionalGuests.length > 0 &&
                    additionalGuests.map((guest, index) => {
                      return (
                        <div
                          className="p-5 rounded-lg bg-zinc-50 grid grid-cols-2 gap-y-3"
                          key={index + (guest.roomNumber || 0)}
                        >
                          <div className="col-span-2 flex flex-col justify-start items-start">
                            <span className="text-xs font-semibold text-zinc-500">
                              Room Assigned
                            </span>
                            <span className="text-sm font-semibold">
                              {guest.roomNumber}
                            </span>
                          </div>
                          <div className="flex flex-col justify-start items-start">
                            <span className="text-xs font-semibold text-zinc-500">
                              Guest Name:
                            </span>
                            <span className="text-sm font-semibold">
                              {guest.guest?.name}
                            </span>
                          </div>
                          <div className="flex flex-col justify-start items-start">
                            <span className="text-xs font-semibold text-zinc-500">
                              Guest Email:
                            </span>
                            <span className="text-sm font-semibold">
                              {guest.guest?.email}
                            </span>
                          </div>
                          <div className="flex flex-col justify-start items-start">
                            <span className="text-xs font-semibold text-zinc-500">
                              Guest Phone:
                            </span>
                            <span className="text-sm font-semibold">
                              {guest.guest?.phone}
                            </span>
                          </div>
                          <div className="flex flex-col justify-start items-start">
                            <span className="text-xs font-semibold text-zinc-500">
                              Guest DOB:
                            </span>
                            <span className="text-sm font-semibold">
                              {dayjs(guest.guest?.dob).format("DD/MM/YYYY")} :
                              Age - {dayjs().diff(guest.guest?.dob, "year")}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {Array.from(assignRoom).length > 0 && (
              <Tabs aria-label="Dynamic tabs" classNames={{ tab: "px-10" }}>
                {Array.from(assignRoom).map((item) => {
                  const room = rooms?.find((room) => room.roomNumber == item);
                  return room ? (
                    <Tab
                      key={item}
                      title={`Room ${room.roomNumber} (vacancy: ${room.vacancy})`}
                      className="w-full"
                    >
                      <Card className="p-2.5">
                        <CardBody>
                          {room?.vacancy > 1 ? (
                            <div className="flex flex-col gap-2 w-full">
                              {primaryGuest?.guest?.email &&
                              primaryGuest?.guest?.phone &&
                              primaryGuest?.guest?.dob ? null : ( //   ?.url // primaryGuest?.guest?.idProofBackImage // primaryGuest?.guest?.idProofFrontImage?.url && // &&
                                <>
                                  <Heading variant="subheading">
                                    Primary Guest
                                  </Heading>
                                  <PrimaryGuestForm
                                    primaryGuest={primaryGuest}
                                    setPrimaryGuest={setPrimaryGuest}
                                    roomNumber={room.roomNumber}
                                    vacancy={room.vacancy}
                                    noOfGuests={parseInt(noOfGuests || "0")}
                                    propertyId={booking?.propertyId}
                                  />
                                </>
                              )}
                              <Heading variant="subheading">
                                Additional Guests
                              </Heading>
                              <GuestForm
                                additionalGuests={additionalGuests}
                                setAdditionalGuests={setAdditionalGuests}
                                roomNumber={room.roomNumber}
                                vacancy={room.vacancy}
                                noOfGuests={parseInt(noOfGuests || "0")}
                                propertyId={booking?.propertyId}
                                primaryGuest={primaryGuest}
                              />
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2">
                              <Heading variant="subheading">
                                Primary Guest
                              </Heading>
                              <PrimaryGuestForm
                                primaryGuest={primaryGuest}
                                setPrimaryGuest={setPrimaryGuest}
                                roomNumber={room.roomNumber}
                                vacancy={room.vacancy}
                                noOfGuests={parseInt(noOfGuests || "0")}
                                propertyId={booking?.propertyId}
                              />
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    </Tab>
                  ) : null;
                })}
              </Tabs>
            )}
          </div>
          <div className="w-full py-5 px-2.5 flex items-center justify-end">
            <Button
              onClick={handleUpdateBooking}
              className="px-8 font-semibold bg-black text-white"
            >
              update check in <span className="ml-2">→</span>
            </Button>
          </div>
        </ContainerColumn>
      </Container>
    </>
  );
};

interface PrimaryGuestFormProps {
  primaryGuest: {
    roomNumber?: number | undefined;
    guest: GuestProps;
  };
  setPrimaryGuest: React.Dispatch<
    React.SetStateAction<{
      roomNumber?: number | undefined;
      guest: GuestProps;
    }>
  >;
  roomNumber: number;
  vacancy: number;
  noOfGuests: number;
  propertyId: string | undefined;
}
interface GuestFormProps {
  primaryGuest: {
    roomNumber?: number | undefined;
    guest: GuestProps;
  };
  additionalGuests: {
    roomNumber: number;
    guest: GuestProps;
  }[];
  setAdditionalGuests: React.Dispatch<
    React.SetStateAction<
      {
        roomNumber: number;
        guest: GuestProps;
      }[]
    >
  >;
  roomNumber: number;
  vacancy: number;
  noOfGuests: number;
  propertyId: string | undefined;
}

const PrimaryGuestForm: React.FC<PrimaryGuestFormProps> = ({
  primaryGuest,
  setPrimaryGuest,
  roomNumber,
  propertyId,
}) => {
  const [guest, setGuest] = useState<GuestProps>({
    name: primaryGuest.guest?.name || "",
    email: primaryGuest.guest?.email || "",
    phone: primaryGuest.guest?.phone || "",
    dob: primaryGuest.guest?.dob || "",
    idProofFrontImage: { label: "", url: "" },
    idProofBackImage: { label: "", url: "" },
  });
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setGuest({ ...guest, [name]: value });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (
      guest.name === "" ||
      guest.email === "" ||
      guest.phone === "" ||
      guest.dob === "" ||
      guest.idProofFrontImage?.url === "" ||
      guest.idProofBackImage?.url === ""
    ) {
      toast.error("Please fill all the fields");
      return;
    }
    setPrimaryGuest({
      roomNumber: roomNumber,
      guest: guest,
    });
  };

  const handleUploadImage = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    const { name, files } = event.target;
    if (files?.length === 0 || !files) {
      console.log("No files");
      toast.error("No files selected");
      return;
    }
    console.log(files, "files");
    try {
      const upload = await uploadImagesToFirebase(Array.from(files || []));
      toast.success("Image uploaded successfully");
      setGuest({
        ...guest,
        [name]: upload[0],
      });
      console.log(upload);
      // toast.success("Image uploaded successfully");
    } catch (error) {
      console.log(error);
      toast.error("Error uploading image");
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const { name, value } = e.target;
    const d = new Date(value);
    console.log(d);
    setGuest({ ...guest, [name]: d });
  };

  const uploadImagesToFirebase = async (images: File[]) => {
    const imageUrls = [];

    try {
      for (const image of images) {
        const imageRef = ref(
          storage,
          `${propertyId}/guest-documents/${roomNumber}/${
            image.name
          }-${Date.now()}`
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
      toast.error("Error uploading image");
      return [];
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-3 p-1">
      <div className="col-span-2 grid grid-cols-2 gap-3">
        <Input
          name="name"
          type="text"
          label="Primary Guest Name"
          labelPlacement="outside"
          value={guest.name}
          onChange={handleInputChange}
          placeholder="Name"
          variant="bordered"
        />
        <Input
          name="email"
          type="email"
          label="Primary Guest Email"
          labelPlacement="outside"
          value={guest.email}
          onChange={handleInputChange}
          placeholder="Email"
          variant="bordered"
        />
        <Input
          name="phone"
          type="number"
          label="Primary Guest Phone"
          labelPlacement="outside"
          value={guest.phone}
          onChange={handleInputChange}
          placeholder="Phone"
          variant="bordered"
        />
        <Input
          name="dob"
          type="date"
          label="Primary Guest DOB"
          labelPlacement="outside"
          value={dayjs(guest.dob).format("YYYY-MM-DD")}
          onChange={handleDateChange}
          placeholder="DOB"
          variant="bordered"
        />
      </div>
      <div className="grid gap-2.5 pt-5">
        <div className="relative flex-1 flex justify-center items-center bg-zinc-100 rounded-md border-dashed border-2 w-full">
          {guest.idProofFrontImage?.url && (
            <img
              src={guest.idProofFrontImage?.url}
              alt="Room Image"
              className="w-full h-6 object-cover rounded-md"
            />
          )}
          <input
            type="file"
            name="idProofFrontImage"
            required
            accept="image/*"
            onChange={handleUploadImage}
            className="w-full h-full absolute top-0 right-0 bottom-0 left-0 opacity-0 cursor-pointer z-10"
          />
          <span className="inset-0 absolute z-[1] text-sm text-zinc-600 flex justify-center items-center">
            + ID Proof Front Image
          </span>
        </div>
        <div className="relative flex-1  flex justify-center items-center bg-zinc-100 rounded-md border-dashed border-2 w-full">
          {guest.idProofBackImage?.url && (
            <img
              src={guest.idProofBackImage?.url}
              alt="Room Image"
              className="w-full h-6 object-cover rounded-md"
            />
          )}
          <input
            type="file"
            name="idProofBackImage"
            required
            accept="image/*"
            onChange={handleUploadImage}
            className="w-full h-full absolute top-0 right-0 bottom-0 left-0 opacity-0 cursor-pointer z-10"
          />
          <span className="inset-0 absolute z-[1] text-sm text-zinc-600 flex justify-center items-center">
            + ID Proof Back Image
          </span>
        </div>
      </div>

      {/* Add other fields similarly */}
      <Button
        type="submit"
        variant="light"
        className="mb-2 w-full col-span-3 py-6 font-semibold"
      >
        Add Primary Guest
      </Button>
    </form>
  );
};

const GuestForm: React.FC<GuestFormProps> = ({
  additionalGuests,
  setAdditionalGuests,
  roomNumber,
  vacancy,
  noOfGuests,
  propertyId,
  primaryGuest,
}) => {
  const [guest, setGuest] = useState<GuestProps>({
    name: "",
    email: "",
    phone: "",
    dob: "",
    idProofFrontImage: { label: "", url: "" },
    idProofBackImage: { label: "", url: "" },
  });
  const isPrimaryGuestInRoom = primaryGuest.roomNumber === roomNumber;
  const guestByRoom = groupBy(additionalGuests, (guest) => guest.roomNumber);
  const noOfGuestsInRoom = isPrimaryGuestInRoom
    ? (guestByRoom.get(roomNumber)?.length || 0) + 1
    : guestByRoom.get(roomNumber)?.length || 0;
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setGuest({ ...guest, [name]: value });
    console.log(name, value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (noOfGuestsInRoom >= vacancy) {
      toast.error("No vacancy in this room");
      return;
    }
    if (
      guest.name === "" ||
      guest.email === "" ||
      guest.phone === "" ||
      guest.dob === "" ||
      guest.idProofFrontImage?.url === "" ||
      guest.idProofBackImage?.url === ""
    ) {
      toast.error("Please fill all the fields");
      return;
    }
    // console.log(additionalGuests.length, "adicionalGuests.length");
    // console.log(noOfGuests, "noOfGuests");
    if (additionalGuests.length + 2 > noOfGuests) {
      toast.error("All guests are added");
      return;
    }
    setAdditionalGuests([
      ...additionalGuests,
      {
        roomNumber: roomNumber,
        guest: guest,
      },
    ]);
    toast.success(`Guest ${guest.name} added to room ${roomNumber}`);
    setGuest({
      name: "",
      email: "",
      phone: "",
      dob: "",
      idProofFrontImage: { label: "", url: "" },
      idProofBackImage: { label: "", url: "" },
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const { name, value } = e.target;
    const d = new Date(value);
    console.log(d);
    setGuest({ ...guest, [name]: d });
  };

  const handleUploadImage = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    const { name, files } = event.target;
    console.log(event.target);
    if (files?.length === 0 || !files) {
      console.log("No files");
      toast.error("No files selected");
      return;
    }
    try {
      const upload = await uploadImagesToFirebase(Array.from(files || []));
      toast.success("Image uploaded successfully");
      setGuest({
        ...guest,
        [name]: upload[0],
      });
      console.log(upload);
      // toast.success("Image uploaded successfully");
    } catch (error) {
      console.log(error);
      toast.error("Error uploading image");
    }
  };

  const uploadImagesToFirebase = async (images: File[]) => {
    const imageUrls = [];

    try {
      for (const image of images) {
        const imageRef = ref(
          storage,
          `${propertyId}/guest-documents/${roomNumber}/${
            image.name
          }-${Date.now()}`
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

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-3 p-1">
      <div className="col-span-2 grid grid-cols-2 gap-3">
        <Input
          name="name"
          type="text"
          label="Guest Name"
          labelPlacement="outside"
          value={guest.name}
          onChange={handleInputChange}
          placeholder="Name"
          variant="bordered"
        />
        <Input
          name="email"
          type="email"
          label="Guest Email"
          labelPlacement="outside"
          value={guest.email}
          onChange={handleInputChange}
          placeholder="Email"
          variant="bordered"
        />
        <Input
          name="phone"
          type="number"
          label="Guest Phone"
          labelPlacement="outside"
          value={guest.phone}
          onChange={handleInputChange}
          placeholder="Phone"
          variant="bordered"
        />
        <Input
          name="dob"
          type="date"
          label="Guest DOB"
          labelPlacement="outside"
          value={dayjs(guest.dob).format("YYYY-MM-DD")}
          onChange={handleDateChange}
          placeholder="DOB"
          variant="bordered"
        />
      </div>
      <div className="grid gap-2.5 pt-5">
        <div className="relative flex-1 flex justify-center items-center bg-zinc-100 rounded-md border-dashed border-2 w-full">
          {guest.idProofFrontImage?.url && (
            <img
              src={guest.idProofFrontImage?.url}
              alt="Room Image"
              className="relative w-full h-6 object-cover rounded-md"
            />
          )}
          <input
            type="file"
            name="idProofFrontImage"
            required
            accept="image/*"
            onChange={handleUploadImage}
            className="w-full h-full absolute top-0 right-0 bottom-0 left-0 opacity-0 cursor-pointer z-10"
          />
          <span className="inset-0 absolute z-[1] text-sm text-zinc-600 flex justify-center items-center">
            + ID Proof Front Image
          </span>
        </div>
        <div className="relative flex-1  flex justify-center items-center bg-zinc-100 rounded-md border-dashed border-2 w-full">
          {guest.idProofBackImage?.url && (
            <img
              src={guest.idProofBackImage?.url}
              alt="Room Image"
              className="w-full h-6 object-cover rounded-md"
            />
          )}
          <input
            type="file"
            name="idProofBackImage"
            required
            accept="image/*"
            onChange={handleUploadImage}
            className="w-full h-full absolute top-0 right-0 bottom-0 left-0 opacity-0 cursor-pointer z-10"
          />
          <span className="inset-0 absolute z-[1] text-sm text-zinc-600 flex justify-center items-center">
            + ID Proof Back Image
          </span>
        </div>
      </div>

      {/* Add other fields similarly */}
      <Button
        type="submit"
        variant="light"
        className="mb-2 w-full col-span-3 py-6 font-semibold"
      >
        Add Guest to Room {roomNumber}
      </Button>
    </form>
  );
};

export default CheckIn;
