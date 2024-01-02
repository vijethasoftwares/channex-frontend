import Container from "@/components/container";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import { Button as ShadcnButton } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Selection,
} from "@nextui-org/react";
import { differenceInCalendarDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React, { FC, useState } from "react";
import { DateRange } from "react-day-picker";
import {
  BookingStatusEnum,
  BookingTypeEnum,
  PaymentMethodEnum,
  PaymentStatusEnum,
  RoomCategoryEnum,
  RoomTypeEnum,
} from "./CONSTS";

type Props = {
  children?: React.ReactNode;
};

const AddBooking: FC<Props> = () => {
  const [date, setDate] = React.useState<DateRange | undefined>();
  const [paymentStatus, setPaymentStatus] = useState<Selection>(new Set([]));
  console.log(date);

  const getDifferenceInMonthsAndDays = (from: Date, to: Date) => {
    let diffInDays = differenceInCalendarDays(to, from);
    const diffInMonths = Math.floor(diffInDays / 30);
    diffInDays = diffInDays % 30;

    let result = "";

    if (diffInMonths > 0) {
      result += `${diffInMonths} month${diffInMonths > 1 ? "s" : ""}`;
    }

    if (diffInDays > 0) {
      result += `${result ? " and " : ""}${diffInDays} day${
        diffInDays > 1 ? "s" : ""
      } stay`;
    }

    return result || "Same day stay";
  };

  return (
    <Container>
      <ContainerColumn>
        <Heading>Add Booking</Heading>
      </ContainerColumn>
      <div className="mt-5 p-5 bg-zinc-50 border rounded-md w-full">
        <Heading variant="subheading">Booking Details</Heading>
        <div className="mt-5 grid grid-cols-3 gap-5 w-full">
          <Select
            name="bookingType"
            color="default"
            label="Booking Type"
            labelPlacement="outside"
            placeholder="Select Booking Type"
            // selectedKeys={}
            // onSelectionChange={}
            radius="md"
            size="lg"
            variant="bordered"
          >
            {BookingTypeEnum.map((bookingType) => (
              <SelectItem key={bookingType} value={bookingType}>
                {bookingType}
              </SelectItem>
            ))}
          </Select>
          <Input
            type="number"
            name="noOfGuests"
            label="No of Guests"
            labelPlacement="outside"
            placeholder="Enter Number of Guests"
            color="default"
            isRequired={true}
            // value={}
            // onValueChange={}
            radius="md"
            size="lg"
            variant="bordered"
          />
          <Select
            name="roomCategroy"
            color="default"
            label="Room Category"
            labelPlacement="outside"
            placeholder="Select Room Category"
            // selectedKeys={}
            // onSelectionChange={}
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
            name="roomType"
            color="default"
            label="Room Type"
            labelPlacement="outside"
            placeholder="Select Room Type"
            // selectedKeys={}
            // onSelectionChange={}
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
            name="bookingStatus"
            color="default"
            label="Booking Status"
            labelPlacement="outside"
            placeholder="Select Booking Status"
            // selectedKeys={}
            // onSelectionChange={}
            radius="md"
            size="lg"
            variant="bordered"
          >
            {BookingStatusEnum.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </Select>
          <div className={"grid gap-2.5"}>
            <div className="w-full flex justify-between items-center">
              <Label className="font-normal">Check In and Check Out</Label>
              <span className="text-sm">
                {date?.from &&
                  date.to &&
                  getDifferenceInMonthsAndDays(date.from, date.to)}
              </span>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  radius="md"
                  size="lg"
                  variant="bordered"
                  className="justify-start"
                  // variant={"outline"}
                  // className={cn(
                  //   "w-[300px] justify-start text-left font-normal",
                  //   !date && "text-muted-foreground"
                  // )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Select
            name="paymentStatus"
            color="default"
            label="Payment Status"
            labelPlacement="outside"
            placeholder="Select Payment Status"
            selectedKeys={paymentStatus}
            onSelectionChange={setPaymentStatus}
            radius="md"
            size="lg"
            variant="bordered"
          >
            {PaymentStatusEnum.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>
      {Array.from(paymentStatus).join("") === PaymentStatusEnum[0] && (
        <div className="relative">
          <div className="mt-5 p-5 bg-zinc-50 border rounded-md w-full">
            <Heading variant="subheading">Payment Details</Heading>
            <div className="mt-5 grid grid-cols-3 gap-5 w-full">
              <Select
                name="paymentMethod"
                color="default"
                label="Payment Method"
                labelPlacement="outside"
                placeholder="Select Payment Method"
                // selectedKeys={}
                // onSelectionChange={}
                radius="md"
                size="lg"
                variant="bordered"
              >
                {PaymentMethodEnum.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </Select>
              <Input
                type="number"
                name="paymentAmount"
                label="Payment Amount"
                labelPlacement="outside"
                placeholder="₹ 0.00"
                color="default"
                isRequired={true}
                // value={}
                // onValueChange={}
                radius="md"
                size="lg"
                variant="bordered"
              />
            </div>
          </div>
        </div>
      )}
      <div className="mt-5 p-5 bg-zinc-50 border rounded-md w-full">
        <Heading variant="subheading">Guest Details</Heading>
        <div className="mt-5 grid grid-cols-3 gap-5 w-full">
          <Input
            type="text"
            name="primaryGuestName"
            label="Primary Guest Name"
            labelPlacement="outside"
            placeholder="Enter Primary Guest Name"
            color="default"
            isRequired={true}
            // value={}
            // onValueChange={}
            radius="md"
            size="lg"
            variant="bordered"
          />
          <Input
            type="number"
            name="guestPhoneNumber"
            label="Guest Phone Number"
            labelPlacement="outside"
            placeholder="Enter Guest Phone Number"
            color="default"
            isRequired={true}
            // value={}
            // onValueChange={}
            radius="md"
            size="lg"
            variant="bordered"
          />
          <Input
            type="email"
            name="guestEmail"
            label="Guest Email"
            labelPlacement="outside"
            placeholder="Enter Guest Email"
            color="default"
            isRequired={true}
            // value={}
            // onValueChange={}
            radius="md"
            size="lg"
            variant="bordered"
          />
          <div className="col-span-3 flex justify-end items-center py-5">
            <ShadcnButton>Add Booking</ShadcnButton>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default AddBooking;
