import Container from "@/components/container";
import ContainerBetween from "@/components/container-between";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import { GlobalContextType } from "@/components/providers";
import { BookingProps } from "@/components/types/app";
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
import { SERVER_URL, useGlobalContext } from "@/lib/utils";
import { Card, CardBody, Input, Spinner, Tab, Tabs } from "@nextui-org/react";
import axios, { AxiosError } from "axios";
import dayjs from "dayjs";
import { CheckSquare2, Eye, Loader2, Trash } from "lucide-react";
import React, { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { BookingStatusEnum } from "./CONSTS";

type Props = {
  chidlren?: React.ReactNode;
};

const BookingTabsEnum = Object.freeze({
  UPCOMING: "Upcoming Bookings",
  CURRENT: "Current Bookings",
  HISTROY: "Booking History",
});

const AllBooking: FC<Props> = () => {
  const { user, selectedProperty, isPropertyLoading } =
    useGlobalContext() as GlobalContextType;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selected, setSelected] = useState<number | string>(
    BookingTabsEnum.CURRENT.replace(" ", "-").toLowerCase()
  );
  // const [selectedProperty, setSelectedProperty] = useState<PropertyProps>();
  const [booking, setBooking] = useState<BookingProps[]>([]);
  const [filteredBooking, setFilteredBooking] = useState<BookingProps[]>([]);
  const [currentBooking, setCurrentBooking] = useState<BookingProps[]>([]);
  const [upcomingBooking, setUpcomingBooking] = useState<BookingProps[]>([]);
  const [bookingHistory, setBookingHistory] = useState<BookingProps[]>([]);
  const [filteredUpcomingBooking, setFilteredUpcomingBooking] = useState<
    BookingProps[]
  >([]);
  const [filteredBookingHistory, setFilteredBookingHistory] = useState<
    BookingProps[]
  >([]);

  const fetchBookingsByProperty = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await axios.get(SERVER_URL + "/manager/get-bookings/" + id, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const data = (await res.data) as {
        bookings: BookingProps[];
        message: string;
      };
      const current = data.bookings.filter(
        (booking: BookingProps) =>
          booking.isCheckedIn === true && booking.isCheckedOut === false
      );
      const upcoming = data.bookings.filter(
        (booking: BookingProps) =>
          booking.isCheckedIn === false && booking.isCheckedOut === false
      );
      const history = data.bookings.filter(
        (booking: BookingProps) =>
          booking.isCheckedIn === true && booking.isCheckedOut === true
      );
      setBooking(data.bookings);
      setCurrentBooking(current);
      setUpcomingBooking(upcoming);
      setBookingHistory(history);
      setFilteredBooking(current);
      setFilteredUpcomingBooking(upcoming);
      setFilteredBookingHistory(history);
      toast.success(data?.message);
      console.log(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurrentBookings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filtered = currentBooking.filter((booking) =>
      booking?.guestName?.toLowerCase().includes(e.target.value)
    );
    setFilteredBooking(filtered);
  };

  const handleFilterUpcoming = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filtered = upcomingBooking.filter((booking) =>
      booking?.guestName?.toLowerCase().includes(e.target.value)
    );
    setFilteredUpcomingBooking(filtered);
  };

  const handleFilterHistory = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filtered = bookingHistory.filter((booking) =>
      booking?.guestName?.toLowerCase().includes(e.target.value)
    );
    setFilteredBookingHistory(filtered);
  };

  useEffect(() => {
    console.log(selected);
  }, [selected]);

  useEffect(() => {
    if (user && selectedProperty.length > 3) {
      fetchBookingsByProperty(selectedProperty);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedProperty]);

  if (isPropertyLoading) {
    return (
      <div className="flex justify-center items-center px-5 py-10 w-full">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Container>
      <ContainerColumn>
        <ContainerBetween>
          <Heading>All Booking</Heading>
          <Link to={"add"}>
            <Button className="active:scale-95 bg-purple-700">
              + add booking
            </Button>
          </Link>
        </ContainerBetween>

        {/* </div> */}
      </ContainerColumn>

      {isLoading && (
        <div className="px-5 py-10 flex justify-center items-center">
          <Loader2 className="animate-spin h-10 w-10" />
        </div>
      )}
      {selectedProperty && !isLoading && booking.length === 0 && (
        <div className="px-5 py-10 flex justify-center items-center">
          <Heading variant="subtitle">
            No bookings found for this property
          </Heading>
        </div>
      )}
      {!isLoading && booking.length > 0 && (
        <div className="mt-5 w-full flex flex-col">
          <Tabs
            fullWidth
            radius="lg"
            size="lg"
            aria-label={"Options"}
            selectedKey={selected}
            onSelectionChange={setSelected}
            classNames={{
              tab: "py-5",
            }}
          >
            <Tab
              key={BookingTabsEnum.CURRENT.replace(" ", "-").toLowerCase()}
              title={BookingTabsEnum.CURRENT}
            >
              <Card className="p-2">
                <CardBody className="gap-3">
                  <Input
                    type="text"
                    placeholder="Search current bookings"
                    radius="lg"
                    size="md"
                    variant="bordered"
                    classNames={{
                      input: "pl-2.5",
                    }}
                    onChange={handleCurrentBookings}
                  />
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Guest</TableHead>
                        <TableHead>Pax</TableHead>
                        <TableHead>Booking Type</TableHead>
                        <TableHead>Check In</TableHead>
                        <TableHead>Check Out</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBooking.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8}>
                            <Heading
                              variant="subtitle"
                              className="w-full flex justify-center py-5"
                            >
                              No current bookings found
                            </Heading>
                          </TableCell>
                        </TableRow>
                      )}
                      {filteredBooking &&
                        filteredBooking.map((booking) => {
                          return (
                            <TableRow key={booking?._id}>
                              <TableCell>{booking?.folioId}</TableCell>
                              <TableCell>{booking?.guestName}</TableCell>
                              <TableCell>{booking?.numberOfGuests}</TableCell>
                              <TableCell>{booking?.bookingType}</TableCell>
                              <TableCell>
                                {dayjs(booking?.from).format("DD/MM/YYYY")}
                              </TableCell>
                              <TableCell>
                                {dayjs(booking?.to).format("DD/MM/YYYY")}
                              </TableCell>
                              <TableCell>
                                <Badge>{booking?.paymentAmount}</Badge>
                              </TableCell>
                              <TableCell>
                                {booking?.bookingStatus ===
                                  BookingStatusEnum[0] && (
                                  <Badge
                                    variant={"default"}
                                    className="bg-green-500 hover:bg-green-600"
                                  >
                                    {booking?.bookingStatus}
                                  </Badge>
                                )}
                                {booking?.bookingStatus ===
                                  BookingStatusEnum[1] && (
                                  <Badge variant={"destructive"}>
                                    {booking?.bookingStatus}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right flex gap-2.5 justify-end">
                                <BookingActionCurrent
                                  {...booking}
                                  refetch={fetchBookingsByProperty}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>
            </Tab>
            <Tab
              key={BookingTabsEnum.UPCOMING.replace(" ", "-").toLowerCase()}
              title={BookingTabsEnum.UPCOMING}
            >
              <Card className="p-2">
                <CardBody className="gap-3">
                  <Input
                    type="text"
                    placeholder="Search upcoming bookings"
                    radius="lg"
                    size="md"
                    variant="bordered"
                    classNames={{
                      input: "pl-2.5",
                    }}
                    onChange={handleFilterUpcoming}
                  />
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Guest</TableHead>
                        <TableHead>Pax</TableHead>
                        <TableHead>Booking Type</TableHead>
                        <TableHead>Check In</TableHead>
                        <TableHead>Check Out</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUpcomingBooking.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8}>
                            <Heading
                              variant="subtitle"
                              className="w-full flex justify-center py-5"
                            >
                              No upcoming bookings found
                            </Heading>
                          </TableCell>
                        </TableRow>
                      )}
                      {filteredUpcomingBooking &&
                        filteredUpcomingBooking.map((booking) => {
                          return (
                            <TableRow key={booking?._id}>
                              <TableCell>{booking?.folioId}</TableCell>
                              <TableCell>{booking?.guestName}</TableCell>
                              <TableCell>{booking?.numberOfGuests}</TableCell>
                              <TableCell>{booking?.bookingType}</TableCell>
                              <TableCell>
                                {dayjs(booking?.from).format("DD/MM/YYYY")}
                              </TableCell>
                              <TableCell>
                                {dayjs(booking?.to).format("DD/MM/YYYY")}
                              </TableCell>
                              <TableCell>
                                <Badge>{booking?.paymentAmount}</Badge>
                              </TableCell>
                              <TableCell>
                                {booking?.bookingStatus ===
                                  BookingStatusEnum[0] && (
                                  <Badge
                                    variant={"default"}
                                    className="bg-green-500 hover:bg-green-600"
                                  >
                                    {booking?.bookingStatus}
                                  </Badge>
                                )}
                                {booking?.bookingStatus ===
                                  BookingStatusEnum[1] && (
                                  <Badge variant={"destructive"}>
                                    {booking?.bookingStatus}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right flex gap-2.5 justify-end">
                                <BookingActionUpcoming
                                  {...booking}
                                  refetch={fetchBookingsByProperty}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>
            </Tab>
            <Tab
              key={BookingTabsEnum.HISTROY.replace(" ", "-").toLowerCase()}
              title={BookingTabsEnum.HISTROY}
            >
              <Card className="p-2">
                <CardBody className="gap-3">
                  <Input
                    type="text"
                    placeholder="Search booking history"
                    radius="lg"
                    size="md"
                    variant="bordered"
                    classNames={{
                      input: "pl-2.5",
                    }}
                    onChange={handleFilterHistory}
                  />
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Guest</TableHead>
                        <TableHead>Pax</TableHead>
                        <TableHead>Check In</TableHead>
                        <TableHead>Check Out</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookingHistory.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8}>
                            <Heading
                              variant="subtitle"
                              className="w-full flex justify-center py-5"
                            >
                              No bookings history found
                            </Heading>
                          </TableCell>
                        </TableRow>
                      )}
                      {filteredBookingHistory &&
                        filteredBookingHistory.map((booking) => {
                          return (
                            <TableRow key={booking?._id}>
                              <TableCell>{booking?.guestName}</TableCell>
                              <TableCell>{booking?.numberOfGuests}</TableCell>
                              <TableCell>
                                {dayjs(booking?.from).format("DD/MM/YYYY")}
                              </TableCell>
                              <TableCell>
                                {dayjs(booking?.to).format("DD/MM/YYYY")}
                              </TableCell>
                              <TableCell>
                                <Badge>{booking?.paymentAmount}</Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <BookingActionHistory
                                  {...booking}
                                  refetch={fetchBookingsByProperty}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </div>
      )}
    </Container>
  );
};

interface BookingActionProps extends BookingProps {
  refetch: (id: string) => void;
}

const BookingActionUpcoming: FC<BookingActionProps> = (booking) => {
  const { user } = useGlobalContext() as GlobalContextType;
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleCheckIn = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigate("/bookings/check-in/" + booking._id);
  };

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDeleting(true);
    try {
      const res = await axios.delete(
        SERVER_URL + "/user/delete-booking/" + booking._id,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      const data = await res.data;
      toast.success(data.message);
      booking.refetch(booking.propertyId);
    } catch (error) {
      const err = error as AxiosError & {
        response: { data: { message: string } };
      };
      toast.error(err.response.data.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-2.5 justify-end">
      <Button
        onClick={handleCheckIn}
        className="text-xs rounded-2xl active:scale-95 gap-1.5"
      >
        <CheckSquare2 className="w-4 h-4" />
        Check In
      </Button>
      <Button
        className="px-4 rounded-2xl hover:bg-zinc-300 active:scale-95 gap-1.5"
        variant={"secondary"}
        onClick={() => navigate("edit/" + booking._id)}
      >
        <Eye className="w-4 h-4" /> Edit
      </Button>
      <Button
        className="px-4 rounded-2xl hover:bg-red-600 active:scale-95 gap-1.5"
        variant={"destructive"}
        onClick={handleDelete}
        isLoading={isDeleting}
      >
        <Trash className="w-4 h-4" /> Delete
      </Button>
    </div>
  );
};
const BookingActionCurrent: FC<BookingActionProps> = (booking) => {
  const { user } = useGlobalContext() as GlobalContextType;
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleCheckOut = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // navigate("/bookings/check-out/" + booking._id);
    const res = await axios.patch(
      SERVER_URL + "/manager/update-booking/check-out/" + booking._id,
      {},
      {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      }
    );
    const data = await res.data;
    toast.success(data.message);
    booking.refetch(booking.propertyId);
  };

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDeleting(true);
    try {
      const res = await axios.delete(
        SERVER_URL + "/user/delete-booking/" + booking._id,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      const data = await res.data;
      toast.success(data.message);
      booking.refetch(booking.propertyId);
    } catch (error) {
      const err = error as AxiosError & {
        response: { data: { message: string } };
      };
      toast.error(err.response.data.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-2.5 justify-end">
      <Button
        onClick={handleCheckOut}
        className="text-xs rounded-2xl active:scale-95 gap-1.5"
      >
        <CheckSquare2 className="w-4 h-4" />
        Check Out
      </Button>
      <Button
        className="px-4 rounded-2xl hover:bg-zinc-300 active:scale-95 gap-1.5"
        variant={"secondary"}
      >
        <Eye className="w-4 h-4" /> Edit
      </Button>
      <Button
        className="px-4 rounded-2xl hover:bg-red-600 active:scale-95 gap-1.5"
        variant={"destructive"}
        onClick={handleDelete}
        isLoading={isDeleting}
      >
        <Trash className="w-4 h-4" /> Delete
      </Button>
    </div>
  );
};
const BookingActionHistory: FC<BookingActionProps> = (booking) => {
  const { user } = useGlobalContext() as GlobalContextType;
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // const navigate = useNavigate();

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDeleting(true);
    try {
      const res = await axios.delete(
        SERVER_URL + "/user/delete-booking/" + booking._id,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      const data = await res.data;
      toast.success(data.message);
      booking.refetch(booking.propertyId);
    } catch (error) {
      const err = error as AxiosError & {
        response: { data: { message: string } };
      };
      toast.error(err.response.data.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-2.5 justify-end">
      <Button
        className="px-4 rounded-2xl hover:bg-zinc-300 active:scale-95 gap-1.5"
        variant={"secondary"}
      >
        <Eye className="w-4 h-4" /> Edit
      </Button>
      <Button
        className="px-4 rounded-2xl hover:bg-red-600 active:scale-95 gap-1.5"
        variant={"destructive"}
        onClick={handleDelete}
        isLoading={isDeleting}
      >
        <Trash className="w-4 h-4" /> Delete
      </Button>
    </div>
  );
};

export default AllBooking;
