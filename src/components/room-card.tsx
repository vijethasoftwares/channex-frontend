import { Home, User2 } from "lucide-react";
import React, { FC } from "react";
import Heading from "./heading";
import { PropertyProps, RoomProps } from "./types/app";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

type Props = {
  children?: React.ReactNode;
  data: RoomProps;
  property?: PropertyProps;
  hideManager?: boolean;
};

const RoomCard: FC<Props> = ({ data, property, hideManager }) => {
  return (
    <div className="w-full flex flex-col lg:flex-row items-stretch justify-start p-2.5 border rounded-xl gap-2.5 bg-white">
      <div className="w-full lg:w-2/6 flex flex-col gap-2.5">
        <div className="w-full bg-zinc-50 rounded-md flex">
          <Avatar className="w-full h-48 rounded-xl">
            <AvatarImage
              src={data.images.roomImage ? data.images?.roomImage[0]?.url : ""}
              className="object-cover"
            />
            <AvatarFallback className="rounded-xl border">
              <div className="w-full h-full flex items-center justify-center">
                "No Image"
              </div>
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="grid grid-cols-2 gap-2.5 p-1">
          <div className="px-3 py-3 rounded-lg bg-zinc-100 flex items-center justify-center text-xs font-semibold">
            <User2 className="mr-1 w-4 h-4" /> Max {data?.maxOccupancy} guests
          </div>
          <div className="px-3 py-3 rounded-lg bg-zinc-100 flex items-center justify-center text-xs font-semibold">
            <Home className="mr-1 w-4 h-4" /> {data?.roomSize} sq.ft
          </div>
          <div className="px-3 py-3 col-span-2 rounded-lg bg-zinc-100 flex items-center justify-center text-xs font-semibold">
            <User2 className="mr-1 w-4 h-4" /> {data?.roomType}
          </div>
        </div>
      </div>
      <div className="w-full p-3 flex-1">
        <div className="w-full h-full flex flex-col justify-between items-start">
          <div className="flex flex-col justify-start items-start gap-2.5">
            <Heading variant="body" className="text-zinc-500">
              {property?.name}
            </Heading>
            <Heading variant="subheading">
              {data?.roomNumber} ({data?.roomCategory} - {data?.roomType})
            </Heading>
            <p className="relative text-xs font-semibold block line-clamp-3 text-left">
              {data.description && (
                <p className="relative text-xs font-semibold block line-clamp-3 text-left leading-relaxed">
                  {data.description}
                </p>
              )}
            </p>
            {/* <Heading variant="body">{data.description}</Heading> */}
            <Heading variant="caption">{data?.roomSize} sq feet</Heading>
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-start items-start gap-2.5 flex-wrap"></div>
            <div className="flex justify-start items-start gap-2.5 flex-wrap">
              <Badge className="py-1.5" variant={"outline"}>
                Max Occupancy: {data?.maxOccupancy}
              </Badge>
              {data?.vacancy && (
                <Badge className="py-1.5" variant={"outline"}>
                  Vacant Beds: {data?.vacancy}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 bg-zinc-50 rounded-lg flex items-end justify-end">
        <div className="flex flex-col justify-between items-start gap-2.5 h-full w-full">
          <div className="flex flex-col justify-end items-start gap-2.5">
            {!hideManager && (
              <span className="text-xs font-semibold">Manager Details:</span>
            )}
          </div>
          <div className="flex flex-col justify-end items-start gap-2.5">
            <span className="text-xs font-semibold">Price:</span>
            <span className="text-lg font-semibold">
              {data?.pricePerMonth
                ? `₹${data?.pricePerMonth}/month`
                : `₹${data?.pricePerDay}/day`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
