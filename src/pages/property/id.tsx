import MapComponent from "@/components/map-component";
import { GlobalContextType } from "@/components/providers";
import RoomCard from "@/components/room-card";
import {
  ComplaintProps,
  FoodMenuProps,
  PropertyProps,
  ReviewProps,
  RoomProps,
} from "@/components/types/app";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SERVER_URL, cn, groupBy, useGlobalContext } from "@/lib/utils";
import { Card, CardBody, Spinner, Tab, Tabs } from "@nextui-org/react";
import axios, { AxiosError, AxiosResponse } from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ChevronLeft, Star } from "lucide-react";
import React, { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { MealNameEnum } from "./consts";

dayjs.extend(relativeTime);
type Props = {
  children?: React.ReactNode;
};

const PropertyById: FC<Props> = () => {
  const { id } = useParams();

  const { user } = useGlobalContext() as GlobalContextType;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [property, setProperty] = useState<PropertyProps>();
  const [reviews, setReviews] = useState<ReviewProps[]>();
  const [complaints, setComplaints] = useState<ComplaintProps[]>();
  const [rooms, setRooms] = useState<RoomProps[]>();
  // const [guestsByRoom, setGuestsByRoom] = useState<
  //   Map<number, { roomNumber: number; guest: GuestDetailsProps }[]>
  // >(new Map());
  const [coordinate, setCoordinate] = useState<{ lat: number; lng: number }>({
    lat: 0,
    lng: 0,
  });
  const [occupancy, setOccupancy] = useState<number>(0);

  const [foodMenu, setFoodMenu] = useState<FoodMenuProps[]>();
  console.log(foodMenu);
  const fetchProperty = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        SERVER_URL + "/owner/get-property-by-id/" + id
      );
      const data = (await res.data) as AxiosResponse & {
        property: PropertyProps;
        reviews: ReviewProps[];
        complaints: ComplaintProps[];
        message: string;
      };
      console.log(data);
      setProperty(data?.property);
      setReviews(data?.reviews);
      setComplaints(data?.complaints);
      setCoordinate({
        lat: data.property.coOfLocation.coordinates[0],
        lng: data.property.coOfLocation.coordinates[1],
      });
      toast.success(data.message || "property fetched successfully");
      setFoodMenu(data.property.foodMenu);
    } catch (error) {
      console.log(error);
      const err = error as AxiosError & {
        response: { data: { message: string } };
      };
      toast.error(err.response.data?.message || "failed to fetch property");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (id) fetchProperty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  useEffect(() => {
    if (rooms && rooms.length > 0) {
      let totalOccupancy = 0;
      let totalNoOfGuests = 0;
      const guestPerRoom = groupBy(rooms, (room) => room.roomType);
      console.log(guestPerRoom);
      for (const room of rooms) {
        const noOfGuest = room.maxOccupancy - room.vacancy;
        totalOccupancy += room.maxOccupancy;
        totalNoOfGuests += noOfGuest;
      }
      const p = Math.ceil((totalNoOfGuests / totalOccupancy) * 100);
      setOccupancy(p);
    }
  }, [rooms]);
  useEffect(() => {
    const fetchRoomsAndProperty = async () => {
      try {
        const res = await axios.get(
          SERVER_URL + "/manager/get-property-rooms/" + id,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );
        const data = (await res.data) as AxiosResponse & {
          rooms: RoomProps[];
          message: string;
        };
        console.log(data);
        setRooms(data.rooms);
        // const res2 = await axios.get(
        //   SERVER_URL + "/manager/getAllBookings/" + id,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${user?.token}`,
        //     },
        //   }
        // );
        // const data2 = (await res2.data) as AxiosResponse & {
        //   bookings: BookingProps[];
        //   message: string;
        // };
        // const guests = [];
        // for (const booking of data2.bookings) {
        //   if (booking.checkedIn) {
        //     guests.push(booking.checkedIn.primaryGuest);
        //     guests.push(...booking.checkedIn.additionalGuests);
        //   }
        // }
        // const groupGuests = groupBy(guests, (guest) => guest.roomNumber);
        // setGuestsByRoom(groupGuests);
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch rooms");
      }
    };
    if (user?.userId && id) fetchRoomsAndProperty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  if (isLoading) {
    return (
      <div className="flex justify-center items-center px-5 py-10">
        <Spinner size="lg" />
      </div>
    );
  }
  return (
    <div className="relative">
      {property && (
        <div className="flex flex-col justify-start items-start gap-5 first:gap-2.5 p-5 pt-2 *:w-full">
          <div className="flex justify-start">
            <Link
              to="/property"
              className="flex items-center gap-.5 px-3 py-2 -ml-3 hover:bg-zinc-100 active:scale-95 font-semibold rounded-md"
            >
              <ChevronLeft className="stroke-[3px]" size={14} />
              {"Back"}{" "}
            </Link>
          </div>
          <div className="grid grid-cols-4 grid-rows-[200px_200px] auto-rows-[12rem] gap-5 *:rounded-xl *:border">
            <div className="col-span-2 row-span-2 h-full w-full">
              <img
                className="rounded-xl h-full w-full object-cover"
                src={property?.images[0]?.url}
                alt={property.images[0]?.label}
              />
            </div>
            <div>
              <Avatar className="w-full h-full rounded-xl">
                <AvatarImage
                  src={property?.images[1]?.url ? property?.images[1].url : ""}
                  className="w-full h-full object-cover"
                />
                <AvatarFallback className="rounded-xl border">
                  <div className="w-full h-full flex items-center justify-center text-center text-xs">
                    "No Image"
                  </div>
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <Avatar className="w-full h-full rounded-xl">
                <AvatarImage
                  src={property?.images[2]?.url ? property?.images[2].url : ""}
                  className="w-full h-full object-cover"
                />
                <AvatarFallback className="rounded-xl border">
                  <div className="w-full h-full flex items-center justify-center text-center text-xs">
                    "No Image"
                  </div>
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <Avatar className="w-full h-full rounded-xl">
                <AvatarImage
                  src={property?.images[3]?.url ? property?.images[3].url : ""}
                  className="w-full h-full object-cover"
                />
                <AvatarFallback className="rounded-xl border">
                  <div className="w-full h-full flex items-center justify-center text-center text-xs">
                    "No Image"
                  </div>
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <Avatar className="w-full h-full rounded-xl">
                <AvatarImage
                  src={property?.images[4]?.url ? property?.images[4].url : ""}
                  className="w-full h-full object-cover"
                />
                <AvatarFallback className="rounded-xl border">
                  <div className="w-full h-full flex items-center justify-center text-center text-xs">
                    "No Image"
                  </div>
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <div>
            <div className="mb-3 flex justify-between items-center gap-2.5">
              <div className="flex flex-col justify-start items-start gap-2 mt-2.5">
                <h3 className="text-2xl font-sora font-semibold">
                  {property?.name}
                </h3>
                <p className="text-sm text-zinc-500">{property?.location}</p>
              </div>
              <h3 className="font-semibold text-xl">{property?.type}</h3>
            </div>
            <Tabs
              size="lg"
              classNames={{
                tabList: "-ml-2 mt-2.5",
                panel: "mt-2.5 p-2 rounded-lg pb-10 bg-zinc-100",
              }}
              disableAnimation={true}
              variant="underlined"
            >
              <Tab key={"overview"} title="Overview">
                <div className="w-full px-5 pt-5">
                  <h3 className="mb-5 text-lg font-semibold">
                    Property Overview
                  </h3>

                  <div className="mt-2.5 flex items-start justify-between gap-10 w-full">
                    <div className="grid grid-cols-2 gap-2.5 w-full">
                      <div className="px-5 py-10 bg-purple-600 rounded-lg">
                        <p className="text-xs font-semibold text-white">
                          No. of Rooms
                        </p>
                        <h3 className="mt-1.5 font-sora text-3xl font-semibold text-white">
                          {rooms?.length} Rooms
                        </h3>
                      </div>
                      <div className="px-5 py-10 bg-amber-500 rounded-lg">
                        <p className="text-xs font-semibold text-white">
                          Occupancy
                        </p>
                        <h3 className="mt-1.5 font-sora text-3xl font-semibold text-white">
                          {occupancy && occupancy} %
                        </h3>
                      </div>
                      <div className="px-5 py-10 bg-blue-500 rounded-lg">
                        <p className="text-xs font-semibold text-white">
                          Review
                        </p>
                        <h3 className="mt-1.5 font-sora text-3xl font-semibold text-white">
                          4.5
                        </h3>
                      </div>
                      <div className="px-5 py-10 bg-rose-500 rounded-lg">
                        <p className="text-xs font-semibold text-white">
                          Revenue Generated
                        </p>
                        <h3 className="mt-1.5 font-sora text-3xl font-semibold text-white">
                          ₹ 1,00,000
                        </h3>
                      </div>
                    </div>
                    <div className="w-full max-w-xl min-w-0 border rounded-md">
                      <MapComponent
                        containerStyle={{
                          height: "280px",
                          width: "100%",
                          borderRadius: "0.375rem",
                        }}
                        coordinate={coordinate}
                      />
                    </div>
                  </div>
                  <h3 className="my-5 text-lg font-semibold">Food Menu</h3>
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
                              <TableCell className="border-r">
                                {day?.day}
                              </TableCell>
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
                                          return meal?.vegMealItems?.map(
                                            (item) => <Badge>{item}</Badge>
                                          );
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
                                      {day.meals.map(
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
                                          return meal?.vegMealItems?.map(
                                            (item) => <Badge>{item}</Badge>
                                          );
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
                                    {day.meals.map((meal, mealIndex) => {
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
                                    {day.meals.length < 2 && "N/P"}
                                  </span>
                                  <span className="mt-2 flex gap-1">
                                    {day?.meals.map((meal) => {
                                      if (
                                        meal["name"] === MealNameEnum[2] &&
                                        meal.vegMealItems.length > 0
                                      ) {
                                        return meal?.vegMealItems?.map(
                                          (item) => <Badge>{item}</Badge>
                                        );
                                      }
                                    })}
                                  </span>
                                  <span className="mt-2 flex gap-1">
                                    {day?.meals.map((meal) => {
                                      if (
                                        meal["name"] === MealNameEnum[2] &&
                                        meal.nonVegMealItems.length > 0
                                      ) {
                                        return meal?.nonVegMealItems?.map(
                                          (item) => <Badge>{item}</Badge>
                                        );
                                      }
                                    })}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="p-0">
                                <div className=" flex flex-col *:flex-1 *:p-4 w-full">
                                  <div className="border-b">
                                    <span className="block">
                                      {day.meals.map(
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
                                          return meal?.vegMealItems?.map(
                                            (item) => <Badge>{item}</Badge>
                                          );
                                        }
                                      })}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="block">
                                      {day.meals.map(
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
                </div>
              </Tab>
              <Tab key={"rooms"} title="Rooms">
                <div className="flex flex-col justify-start items-start gap-2.5">
                  {rooms &&
                    rooms?.map((room, i) => {
                      return (
                        <RoomCard
                          fetchData={fetchProperty}
                          id={room._id as string}
                          key={i}
                          data={room}
                        />
                      );
                    })}
                </div>
              </Tab>
              <Tab key={"amenities"} title="Amenities">
                <div className="mt-2.5 flex flex-col justify-start items-start gap-2.5 pl-2.5">
                  {property.facilities &&
                    property.facilities.map((facility, i) => {
                      return (
                        <p
                          className="text-sm font-medium text-zinc-600"
                          key={i + facility}
                        >
                          • {facility}
                        </p>
                      );
                    })}
                  <p className="text-sm font-medium text-zinc-600">
                    • Is Couple Friendly -{" "}
                    {property.isCoupleFriendly ? "yes" : "no"}
                  </p>
                  <p className="text-sm font-medium text-zinc-600">
                    • Is Parking Space Available -{" "}
                    {property.isParkingSpaceAvailable ? "yes" : "no"}
                  </p>
                </div>
              </Tab>
              <Tab key={"property-policy"} title="Property Policies">
                <div className="mt-2.5 flex flex-col justify-start items-start gap-2.5">
                  {property.permissions &&
                    property.permissions.map((permission, i) => {
                      return (
                        <p
                          className="text-sm font-medium text-zinc-600"
                          key={i + permission}
                        >
                          • {permission}
                        </p>
                      );
                    })}
                </div>
              </Tab>
              <Tab key={"guest-reviews"} title="Guest Reviews">
                <div className="p-3">
                  <div className="flex flex-col justify-start items-start gap-5">
                    {reviews && reviews.length > 0 ? (
                      reviews.map((review, i) => {
                        return (
                          <div
                            key={i}
                            className="flex flex-col gap-1.5 w-full p-5 bg-white rounded-xl"
                          >
                            <div className="flex items-start justify-between gap-2.5">
                              <div className="flex items-center gap-2.5">
                                <Avatar className="h-10 w-10 rounded-full">
                                  <AvatarImage
                                    src={review.profilePicture as string}
                                    alt={review.userName}
                                  />
                                  <AvatarFallback>
                                    <span className="text-sm font-semibold">
                                      {review.userName[0]}
                                    </span>
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col items-start justify-center">
                                  <span className="text-md font-sora font-semibold">
                                    {review.userName}{" "}
                                    {review.createdAt && (
                                      <span className="font-inter text-xs font-normal">
                                        ({dayjs().to(dayjs(review.createdAt))})
                                      </span>
                                    )}
                                  </span>
                                  <span className="font-rubik text-sm">
                                    {review.userEmailAddress}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={cn(
                                    "flex items-center rounded-md bg-green-500 p-2 font-inter text-sm font-semibold text-white",
                                    review.rating === 1
                                      ? "bg-red-500"
                                      : review.rating === 2
                                      ? "bg-red-500"
                                      : review.rating === 3
                                      ? "bg-yellow-500"
                                      : review.rating === 4
                                      ? "bg-yellow-500"
                                      : review.rating === 5
                                      ? "bg-green-500"
                                      : "bg-green-500"
                                  )}
                                >
                                  {review.rating}{" "}
                                  <Star className="h-4 w-4 fill-white text-white" />
                                </span>
                              </div>
                            </div>
                            <p className="text-sm font-normal ml-12 rounded-lg bg-zinc-50 p-2 font-rubik">
                              {review.review}
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <p>No reviews found</p>
                    )}
                  </div>
                </div>
              </Tab>
              <Tab key={"complaints"} title="Complaints">
                <div className="p-3">
                  <div className="flex flex-col gap-5 justify-start items-start">
                    {complaints && complaints.length > 0 ? (
                      complaints.map((complaint, i) => {
                        return (
                          <div
                            key={i}
                            className="flex flex-col gap-2.5 w-full p-5 bg-white rounded-xl"
                          >
                            <div className="flex items-start justify-between gap-2.5">
                              <div className="flex items-center gap-2.5">
                                <Avatar className="h-10 w-10 rounded-full">
                                  <AvatarFallback>
                                    <span className="text-sm font-semibold">
                                      {complaint.userName[0]}
                                    </span>
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col items-start justify-center">
                                  <span className="text-md font-sora font-semibold">
                                    {complaint.userName}{" "}
                                    {complaint.createdAt && (
                                      <span className="font-inter text-xs font-normal">
                                        (
                                        {dayjs().to(dayjs(complaint.createdAt))}
                                        )
                                      </span>
                                    )}
                                  </span>
                                  <span className="font-rubik text-sm">
                                    {complaint.userEmailAddress}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={cn(
                                    "flex items-center rounded-md bg-red-500 p-2 font-inter text-sm font-semibold text-white"
                                  )}
                                >
                                  {complaint.complaintType}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm font-normal ml-12 rounded-lg bg-zinc-50 p-2 font-rubik">
                              {complaint.complaintDetails}
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <p>No complaints found</p>
                    )}
                  </div>
                </div>
              </Tab>
              <Tab key={"inhouse-guest"} title="In House Guest" className="p-5">
                {/* <div className="flex flex-col justify-start items-start gap-5 *:w-full">
                  {Array.from(guestsByRoom).map((guest) => {
                    console.log(guest, "guest of sgs");
                    return (
                      <div className="flex flex-col gap-5 *:w-full">
                        <Heading variant="subheading">Room {guest[0]}</Heading>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Guest Name</TableHead>
                              <TableHead>Guest Email</TableHead>
                              <TableHead>Guest Phone Number</TableHead>
                              <TableHead>Guest DOB</TableHead>
                              <TableHead>ID Proof</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {guest[1].map((guest, i) => {
                              return (
                                <TableRow key={i}>
                                  <TableCell>{guest.guest.name}</TableCell>
                                  <TableCell>
                                    {guest.guest.email || "N/A"}
                                  </TableCell>
                                  <TableCell>
                                    {guest.guest.phoneNumber || "N/A"}
                                  </TableCell>
                                  <TableCell>
                                    {dayjs(guest.guest.dob).format(
                                      "DD/MM/YYYY"
                                    ) || "N/A"}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex justify-start items-start gap-2.5">
                                      <img
                                        className="w-24 h-24 object-cover rounded-md"
                                        src={guest.guest.idProofFrontImage?.url}
                                        alt={
                                          guest.guest.idProofFrontImage?.label
                                        }
                                      />
                                      <img
                                        className="w-24 h-24 object-cover rounded-md"
                                        src={guest.guest.idProofBackImage?.url}
                                        alt={
                                          guest.guest.idProofBackImage?.label
                                        }
                                      />
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    );
                  })}
                  {Array.from(guestsByRoom).length === 0 && (
                    <Heading variant="subtitle">No guests found</Heading>
                  )}
                </div> */}
              </Tab>
              <Tab key={"staffs"} title="Staffs">
                <Card shadow="none" className="p-0">
                  <CardBody>
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                    Excepturi, molestias quidem! Possimus non repellendus ex
                    maxime natus libero eaque! Repellat perspiciatis sequi culpa
                    consequatur soluta, ex dolore temporibus reiciendis aliquam?
                  </CardBody>
                </Card>
              </Tab>
              <Tab key={"offers-&-discounts"} title="Offers & Discounts">
                <Card shadow="none" className="p-0">
                  <CardBody>
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                    Excepturi, molestias quidem! Possimus non repellendus ex
                    maxime natus libero eaque! Repellat perspiciatis sequi culpa
                    consequatur soluta, ex dolore temporibus reiciendis aliquam?
                  </CardBody>
                </Card>
              </Tab>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyById;
