import { ArrowDownToLine, MoreVertical, Pencil, Trash } from "lucide-react";
import React, { FC } from "react";
import { Link } from "react-router-dom";
import Heading from "./heading";
import { PropertyProps } from "./types/app";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type Props = {
  children?: React.ReactNode;
  data: PropertyProps;
};

const PropertyCard: FC<Props> = ({ data }) => {
  return (
    <div className="relative w-full flex flex-col lg:flex-row items-stretch justify-start p-2.5 border rounded-xl gap-2.5">
      <div className="w-full lg:w-2/6 flex flex-col">
        <div className="w-full bg-zinc-50 rounded-md flex">
          <Avatar className="w-full h-48 rounded-xl">
            <AvatarImage
              src={data.images ? data.images[0]?.url : ""}
              className="object-cover"
            />
            <AvatarFallback className="rounded-xl border">
              <div className="w-full h-full flex items-center justify-center">
                "No Image"
              </div>
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="grid grid-cols-4 gap-2.5 mt-2">
          {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
          {Array.from({ length: 4 }).map((_, i) => {
            return (
              <Avatar className="w-full h-24 rounded-xl">
                <AvatarImage
                  src={data?.images ? data?.images[i + 1]?.url : ""}
                  className="w-full h-full object-cover"
                />
                <AvatarFallback className="rounded-xl border">
                  <div className="w-full h-full flex items-center justify-center text-center text-xs">
                    "No Image"
                  </div>
                </AvatarFallback>
              </Avatar>
            );
          })}
        </div>
      </div>
      <div className="w-full p-3 flex-1">
        <div className="w-full h-full flex flex-col justify-between items-start">
          <div className="flex flex-col justify-start items-start gap-2.5">
            <Link to={"/property/" + data._id} className="hover:underline">
              <Heading variant="subheading">
                {data.name} <Heading variant="caption">({data.type})</Heading>
              </Heading>
            </Link>

            {/* <Heading variant="body">{data.description}</Heading> */}
            <Heading variant="caption">{data.address}</Heading>
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-start items-start gap-2.5 flex-wrap"></div>
            <div className="flex justify-start items-start gap-2.5 flex-wrap">
              <Badge className="py-1.5" variant={"outline"}>
                Location: {data.location}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      <div className="ounded-lg flex items-end justify-end">
        <div className="flex flex-col justify-end items-start gap-2.5 h-full w-full">
          <div className="flex flex-col justify-end items-start gap-2.5 px-4 py-3 bg-zinc-50">
            <span className="text-sm font-semibold">Manager Details</span>

            <span className="text-xs font-semibold text-zinc-700">
              Name: {data?.manager?.name || "Manager Name"}
            </span>
            <span className="text-xs font-semibold text-zinc-700">
              Phone: {data?.manager?.phoneNumber || "1234567890"}
            </span>
            <span className="text-xs font-semibold text-zinc-700">
              {" "}
              Email: {data?.manager?.email || "Manager Email"}
            </span>
          </div>
        </div>
      </div>
      <div className="absolute right-5 top-5 flex justify-end z-[99]">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <MoreVertical className="w-5 h-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="-translate-x-20 translate-y-3">
            <DropdownMenuItem>
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Trash className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ArrowDownToLine className="w-4 h-4 mr-2" /> Download Report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default PropertyCard;
