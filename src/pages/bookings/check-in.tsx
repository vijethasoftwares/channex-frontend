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
import { SERVER_URL, cn, useGlobalContext } from "@/lib/utils";
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
  Tab,
  Tabs,
} from "@nextui-org/react";
import axios, { AxiosResponse } from "axios";
import { format } from "date-fns";
import dayjs from "dayjs";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { CalendarIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { RoomCategoryEnum, RoomTypeEnum } from "./CONSTS";

interface GuestProps {
  _id: string | undefined;
  isPrimary: boolean;
  name?: string;
  dob?: Date | string | null;
  email?: string;
  phone?: string;
  idProofType?: Selection;
  idProofNumber?: string;
  idProofFrontImage?: { label: string; url: string } | null;
  idProofBackImage?: { label: string; url: string } | null;
  roomNumber?: number;
}

const CheckIn = () => {
  const { user, selectedProperty } = useGlobalContext() as GlobalContextType;
  const { id } = useParams<{ id: string }>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [, setLoading] = useState<boolean>(false);
  const [updatingBooking, setUpdatingBooking] = useState<boolean>(false);
  const [booking, setBooking] = useState<BookingProps>();
  const [rooms, setRooms] = useState<RoomProps[]>();
  const [checkInDate, setCheckInDate] = React.useState<Date | undefined>();
  const [checkOutDate, setCheckOutDate] = React.useState<Date | undefined>();
  const [noOfGuests, setNoOfGuests] = React.useState<string | undefined>();
  const [roomCategory, setRoomCategory] = useState<Selection>(new Set([]));
  const [roomType, setRoomType] = useState<Selection>(new Set([]));
  const [assignRoom, setAssignRoom] = useState<Selection>(new Set([]));

  const [guests, setGuests] = useState<GuestProps[]>([]);

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
        setNoOfGuests(data.booking.numberOfGuests.toString());
        setRoomCategory(new Set([data.booking.roomCategory]));
        setRoomType(new Set([data.booking.roomType]));
        setGuests([
          {
            _id: uuid(),
            isPrimary: true,
            name: data.booking.guestName,
            email: data.booking.guestEmail,
            phone: data.booking.guestPhoneNumber.toString(),
            dob: "",
            idProofBackImage: { label: "", url: "" },
            idProofFrontImage: { label: "", url: "" },
          },
        ]);
        // console.log(data);
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
  console.log(guests, "guests");

  const handleUpdateBooking = async () => {
    setUpdatingBooking(true);
    if (!checkInDate || !checkOutDate) {
      toast.error("Please select check in and check out dates");
      setUpdatingBooking(false);
      return;
    }
    if (!noOfGuests) {
      toast.error("Please enter number of guests");
      setUpdatingBooking(false);
      return;
    }
    if (Array.from(roomCategory).toString() === "") {
      toast.error("Please select room category");
      setUpdatingBooking(false);
      return;
    }
    if (Array.from(roomType).toString() === "") {
      toast.error("Please select room type");
      setUpdatingBooking(false);
      return;
    }
    if (Array.from(assignRoom).length === 0) {
      toast.error("Please assign a room");
      setUpdatingBooking(false);
      return;
    }

    if (guests.length < parseInt(noOfGuests || "0")) {
      toast.error("Please fill guest details");
      setUpdatingBooking(false);
      return;
    }
    const data = {
      numberOfGuest: Number(noOfGuests),
      from: checkInDate,
      to: checkOutDate,
      checkedIn: guests,
      folioId: booking?.folioId,
      selectedProperty,
      roomType: booking?.roomType,
      roomCategory: booking?.roomCategory,
    };
    console.log(data, "data");
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
  return (
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
                  <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
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
                  <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
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

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {guests &&
            guests?.map((g, index) => {
              if (!g.roomNumber) return;
              return (
                <div
                  key={index + (g.roomNumber || 0)}
                  className="p-5 rounded-lg border grid grid-cols-2 gap-y-3 shadow-md"
                >
                  <div className="col-span-2 flex flex-col justify-start items-start">
                    <span className="text-xs font-semibold text-zinc-500">
                      Room Assigned
                    </span>
                    <span className="text-sm font-semibold">
                      {g?.roomNumber}
                    </span>
                  </div>
                  <div className="flex flex-col justify-start items-start">
                    <span className="text-xs font-semibold text-zinc-500">
                      Guest Name:
                    </span>
                    <span className="text-sm font-semibold">{g?.name}</span>
                  </div>
                  <div className="flex flex-col justify-start items-start">
                    <span className="text-xs font-semibold text-zinc-500">
                      Guest Email:
                    </span>
                    <span className="text-sm font-semibold">{g?.email}</span>
                  </div>
                  <div className="flex flex-col justify-start items-start">
                    <span className="text-xs font-semibold text-zinc-500">
                      Guest Phone:
                    </span>
                    <span className="text-sm font-semibold">{g?.phone}</span>
                  </div>
                  <div className="flex flex-col justify-start items-start">
                    <span className="text-xs font-semibold text-zinc-500">
                      Guest DOB:
                    </span>
                    <span className="text-sm font-semibold">
                      {dayjs(g?.dob).format("DD/MM/YYYY")} : Age -{" "}
                      {dayjs().diff(g?.dob, "year")}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>

        <div className="flex flex-col justify-start items-start w-full gap-5">
          {Array.from(assignRoom).length > 0 && (
            <Tabs aria-label="Dynamic tabs" classNames={{ tab: "px-10" }}>
              {Array.from(assignRoom).map((item, i) => {
                const room = rooms?.find((room) => room.roomNumber == item);
                return room ? (
                  <Tab
                    key={item}
                    title={`Room ${room.roomNumber} (Max Occupancy: ${room.vacancy})`}
                    className="w-full"
                  >
                    <Card className="p-2.5">
                      <CardBody>
                        {i === 0 &&
                          guests
                            .filter((g) => g.isPrimary)
                            .map((g) => {
                              return (
                                <div>
                                  <Heading variant="subheading">
                                    Primary Guest
                                  </Heading>
                                  <PrimaryGuestForm
                                    primaryGuest={g}
                                    guests={guests}
                                    setGuests={setGuests}
                                    roomNumber={room.roomNumber}
                                    vacancy={room.vacancy}
                                    noOfGuests={parseInt(noOfGuests || "0")}
                                    propertyId={booking?.propertyId}
                                    maxOccupancy={room.maxOccupancy}
                                  />
                                </div>
                              );
                            })}
                        {i === 0 && (
                          <div className="flex flex-col gap-2 w-full mt-5">
                            <Heading variant="subheading">
                              Additional Guests
                            </Heading>
                            <GuestForm
                              guests={guests}
                              setGuests={setGuests}
                              roomNumber={room.roomNumber}
                              vacancy={room.vacancy}
                              noOfGuests={parseInt(noOfGuests || "0")}
                              propertyId={booking?.propertyId}
                              maxOccupancy={room.maxOccupancy}
                            />
                          </div>
                        )}
                        {i > 0 && (
                          <div className="flex flex-col gap-2 w-full">
                            <Heading variant="subheading">
                              Additional Guests
                            </Heading>
                            <GuestForm
                              guests={guests}
                              setGuests={setGuests}
                              roomNumber={room.roomNumber}
                              vacancy={room.vacancy}
                              noOfGuests={parseInt(noOfGuests || "0")}
                              propertyId={booking?.propertyId}
                              maxOccupancy={room.maxOccupancy}
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
            isLoading={updatingBooking}
            onClick={handleUpdateBooking}
            className="px-8 font-semibold bg-black text-white"
          >
            update check in <span className="ml-2">→</span>
          </Button>
        </div>
      </ContainerColumn>
    </Container>
  );
};

interface GuestFormProps {
  primaryGuest?: GuestProps;
  guests: GuestProps[];
  setGuests: React.Dispatch<React.SetStateAction<GuestProps[]>>;
  roomNumber: number;
  vacancy: number;
  noOfGuests: number;
  propertyId: string | undefined;
  maxOccupancy: number;
}

const PrimaryGuestForm: React.FC<GuestFormProps> = ({
  primaryGuest,
  guests,
  setGuests,
  roomNumber,
  // noOfGuests,
  // propertyId,
}) => {
  const [tempGuest, setTempGuest] = useState<GuestProps>({
    isPrimary: primaryGuest?.isPrimary || false,
    name: primaryGuest?.name || "",
    email: primaryGuest?.email || "",
    phone: primaryGuest?.phone || "",
    dob: primaryGuest?.dob || "",
    idProofFrontImage: { label: "", url: "" },
    idProofBackImage: { label: "", url: "" },
    // idProofType: guest?.idProofType || new Set([]),
    idProofNumber: primaryGuest?.idProofNumber || "",
    roomNumber: roomNumber,
    _id: primaryGuest?._id,
  });
  // const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = event.target;
  //   setTempGuest({ ...tempGuest, [name]: value });
  // };
  // const handleDateChange = (date: Date) => {
  //   setTempGuest({ ...tempGuest, dob: date });
  // };
  const handleIdProofFrontImage = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const storage = getStorage(firebase_app);
      const storageRef = ref(storage, `idProofs/${file.name}`);
      // const snapshot = await uploadBytes(storageRef, file);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setTempGuest({
        ...tempGuest,
        idProofFrontImage: { label: file.name, url },
      });
    }
  };
  const handleIdProofBackImage = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const storage = getStorage(firebase_app);
      const storageRef = ref(storage, `idProofs/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setTempGuest({
        ...tempGuest,
        idProofBackImage: { label: file.name, url },
      });
    }
  };

  const handleUpdatePrimaryGuest = () => {
    if (!tempGuest.name) {
      toast.error("Name is required");
      return;
    }
    if (!tempGuest.email) {
      toast.error("Email is required");
      return;
    }
    if (!tempGuest.phone) {
      toast.error("Phone is required");
      return;
    }
    if (!tempGuest.dob) {
      toast.error("Date of Birth is required");
      return;
    }
    // if(!tempGuest.idProofFrontImage?.url){
    //   toast.error("Id Proof Front Image is required");
    //   return;
    // }
    // if(!tempGuest.idProofBackImage?.url){
    //   toast.error("Id Proof Back Image is required");
    //   return;
    // }
    const obj = { ...tempGuest };
    const tempGuests = guests;
    const index = tempGuests.findIndex((g) => g.isPrimary);
    if (index > -1) {
      tempGuests[index] = obj;
      setGuests(
        [...tempGuests] //.sort((a, b) => (a.isPrimary ? -1 : 1)) as GuestProps[]
      );
      console.log("updated");
    } else {
      tempGuests.push(obj);
      setGuests(tempGuests);
      console.log("added");
    }
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2.5">
      <Input
        type="text"
        name="name"
        label="Name"
        labelPlacement="outside"
        placeholder="Enter Name"
        color="default"
        isRequired={true}
        value={tempGuest.name}
        onValueChange={(name) => setTempGuest({ ...tempGuest, name })}
        radius="md"
        size="lg"
        variant="bordered"
      />
      <Input
        type="email"
        name="email"
        label="Email"
        labelPlacement="outside"
        placeholder="Enter Email"
        color="default"
        isRequired={true}
        value={tempGuest.email}
        // onValueChange={(email) => setTempGuest({ ...tempGuest, email })}
        isDisabled={true}
        radius="md"
        size="lg"
        variant="bordered"
      />
      <Input
        type="tel"
        name="phone"
        label="Phone"
        labelPlacement="outside"
        placeholder="Enter Phone"
        color="default"
        isRequired={true}
        value={tempGuest.phone}
        radius="md"
        size="lg"
        variant="bordered"
        isDisabled={true}
      />
      <Input
        type="date"
        name="dob"
        label="Date of Birth"
        labelPlacement="outside"
        placeholder="Enter Date of Birth"
        color="default"
        isRequired={true}
        value={tempGuest.dob as string}
        onValueChange={(dob) => setTempGuest({ ...tempGuest, dob })}
        radius="md"
        size="lg"
        variant="bordered"
      />
      <div className="col-span-2 gap-2.5 grid grid-cols-2">
        {tempGuest.idProofFrontImage?.url && (
          <img
            src={tempGuest.idProofFrontImage?.url}
            alt="Room Image"
            className="w-full h-20 object-cover rounded-md"
          />
        )}
        {tempGuest.idProofBackImage?.url && (
          <img
            src={tempGuest.idProofBackImage?.url}
            alt="Room Image"
            className="w-full h-20 object-cover rounded-md"
          />
        )}
      </div>
      <div className="relative flex-1 flex justify-center px-5 py-6 items-center bg-zinc-100 rounded-md border-dashed border-2 w-full">
        <input
          type="file"
          name="idProofBackImage"
          // required
          accept="image/*"
          onChange={handleIdProofFrontImage}
          className="w-full h-full absolute top-0 right-0 bottom-0 left-0 opacity-0 cursor-pointer z-10"
        />
        <span className="inset-0 absolute z-[1] text-sm text-zinc-600 flex justify-center items-center">
          + Id Proof Front Image
        </span>
      </div>

      <div className="relative flex-1 flex justify-center px-5 py-6 items-center bg-zinc-100 rounded-md border-dashed border-2 w-full">
        <input
          type="file"
          name="idProofBackImage"
          // required
          accept="image/*"
          onChange={handleIdProofBackImage}
          className="w-full h-full absolute top-0 right-0 bottom-0 left-0 opacity-0 cursor-pointer z-10"
        />
        <span className="inset-0 absolute z-[1] text-sm text-zinc-600 flex justify-center items-center">
          + ID Proof Back Image
        </span>
      </div>
      <div className="flex w-full col-span-2 justify-end items-center py-3">
        <Button
          onClick={handleUpdatePrimaryGuest}
          className="px-8 font-semibold bg-black text-white"
        >
          Assign Primary Guest to {roomNumber}
        </Button>
      </div>
    </div>
  );
};
const GuestForm: React.FC<GuestFormProps> = ({
  guests,
  setGuests,
  roomNumber,
  noOfGuests,
  maxOccupancy,
  // propertyId,
}) => {
  const [tempGuest, setTempGuest] = useState<GuestProps>({
    _id: uuid(),
    isPrimary: false,
    name: "",
    email: "",
    phone: "",
    dob: "",
    idProofFrontImage: { label: "", url: "" },
    idProofBackImage: { label: "", url: "" },
    // idProofType: guest?.idProofType || new Set([]),
    idProofNumber: "",
    roomNumber: roomNumber,
  });
  // const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = event.target;
  //   setTempGuest({ ...tempGuest, [name]: value });
  // };
  // const handleDateChange = (date: Date) => {
  //   setTempGuest({ ...tempGuest, dob: date });
  // };
  const handleIdProofFrontImage = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const storage = getStorage(firebase_app);
      const storageRef = ref(storage, `idProofs/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setTempGuest({
        ...tempGuest,
        idProofFrontImage: { label: file.name, url },
      });
    }
  };
  const handleIdProofBackImage = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const storage = getStorage(firebase_app);
      const storageRef = ref(storage, `idProofs/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setTempGuest({
        ...tempGuest,
        idProofBackImage: { label: file.name, url },
      });
    }
  };

  const handleAssignGuest = () => {
    if (guests.length < noOfGuests) {
      if (!tempGuest.name) {
        toast.error("Name is required");
        return;
      }
      if (!tempGuest.email) {
        toast.error("Email is required");
        return;
      }
      if (!tempGuest.phone) {
        toast.error("Phone is required");
        return;
      }
      if (!tempGuest.dob) {
        toast.error("Date of Birth is required");
        return;
      }
      const findPrimaryGuest = guests.find((g) => g.isPrimary);
      if (!findPrimaryGuest?.roomNumber) {
        toast.error("Please assign primary guest first");
        return;
      }
      const guestByRooms = guests.filter((g) => g.roomNumber === roomNumber);
      if (guestByRooms.length >= maxOccupancy) {
        toast.error("Room is already full");
        return;
      }
      // if(!tempGuest.idProofFrontImage?.url){
      //   toast.error("Id Proof Front Image is required");
      //   return;
      // }
      // if(!tempGuest.idProofBackImage?.url){
      //   toast.error("Id Proof Back Image is required");
      //   return;
      // }

      setGuests([...guests, tempGuest]);
      setTempGuest({
        _id: "",
        isPrimary: false,
        name: "",
        email: "",
        phone: "",
        dob: "",
        idProofFrontImage: { label: "", url: "" },
        idProofBackImage: { label: "", url: "" },
        // idProofType: guest?.idProofType || new Set([]),
        idProofNumber: "",
        roomNumber: roomNumber,
      });
    } else {
      toast.error("No of guests limit reached");
    }
  };
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2.5">
      <Input
        type="text"
        name="name"
        label="Name"
        labelPlacement="outside"
        placeholder="Enter Name"
        color="default"
        isRequired={true}
        value={tempGuest.name}
        onValueChange={(name) => setTempGuest({ ...tempGuest, name })}
        radius="md"
        size="lg"
        variant="bordered"
      />
      <Input
        type="email"
        name="email"
        label="Email"
        labelPlacement="outside"
        placeholder="Enter Email"
        color="default"
        isRequired={true}
        value={tempGuest.email}
        onValueChange={(email) => setTempGuest({ ...tempGuest, email })}
        radius="md"
        size="lg"
        variant="bordered"
      />
      <Input
        type="tel"
        name="phone"
        label="Phone"
        labelPlacement="outside"
        placeholder="Enter Phone"
        color="default"
        isRequired={true}
        value={tempGuest.phone}
        onValueChange={(phone) => setTempGuest({ ...tempGuest, phone })}
        radius="md"
        size="lg"
        variant="bordered"
      />
      <Input
        type="date"
        name="dob"
        label="Date of Birth"
        labelPlacement="outside"
        placeholder="Enter Date of Birth"
        color="default"
        isRequired={true}
        value={tempGuest.dob as string}
        onValueChange={(dob) => setTempGuest({ ...tempGuest, dob })}
        radius="md"
        size="lg"
        variant="bordered"
      />
      <div className="col-span-2 grid grid-cols-2 gap-2.5">
        {tempGuest.idProofBackImage?.url && (
          <img
            src={tempGuest.idProofBackImage?.url}
            alt="Room Image"
            className="w-full h-20 object-cover rounded-md"
          />
        )}
        {tempGuest.idProofBackImage?.url && (
          <img
            src={tempGuest.idProofBackImage?.url}
            alt="Room Image"
            className="w-full h-20 object-cover rounded-md"
          />
        )}
      </div>
      <div className="relative flex-1 flex justify-center px-5 py-6 items-center bg-zinc-100 rounded-md border-dashed border-2 w-full">
        <input
          type="file"
          name="idProofBackImage"
          // required
          accept="image/*"
          onChange={handleIdProofFrontImage}
          className="w-full h-full absolute top-0 right-0 bottom-0 left-0 opacity-0 cursor-pointer z-10"
        />
        <span className="inset-0 absolute z-[1] text-sm text-zinc-600 flex justify-center items-center">
          + ID Proof Back Image
        </span>
      </div>
      <div className="relative flex-1 flex px-5 py-6 justify-center items-center bg-zinc-100 rounded-md border-dashed border-2 w-full">
        <input
          type="file"
          name="idProofBackImage"
          // required
          accept="image/*"
          onChange={handleIdProofBackImage}
          className="w-full h-full absolute top-0 right-0 bottom-0 left-0 opacity-0 cursor-pointer z-10"
        />
        <span className="inset-0 absolute z-[1] text-sm text-zinc-600 flex justify-center items-center">
          + ID Proof Back Image
        </span>
      </div>
      <div className="flex w-full col-span-2 justify-end items-center py-3">
        <Button
          onClick={handleAssignGuest}
          className="px-8 font-semibold bg-black text-white"
        >
          Assign Guest to {roomNumber}
        </Button>
      </div>
    </div>
  );
};

export default CheckIn;
