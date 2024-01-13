import React, { FC } from "react";
import { Link } from "react-router-dom";
import Heading from "./heading";
import { PropertyProps } from "./types/app";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

type Props = {
  children?: React.ReactNode;
  data: PropertyProps;
};

const PropertyCard: FC<Props> = ({ data }) => {
  return (
    <Link
      to={"/property/" + data._id}
      className="w-full flex flex-col lg:flex-row items-stretch justify-start p-2.5 border rounded-xl gap-2.5"
    >
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
            <Heading variant="subheading">
              {data.name} <Heading variant="caption">({data.type})</Heading>
            </Heading>
            {/* <Heading variant="body">{data.description}</Heading> */}
            <Heading variant="caption">{data.address}</Heading>
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-start items-start gap-2.5 flex-wrap">
              {/* {data.facilities?.map((facility, i) => {
                return (
                  <Badge key={i} variant={"outline"} className="text-xs">
                    {facility}
                  </Badge>
                );
              })} */}
            </div>
            <div className="flex justify-start items-start gap-2.5 flex-wrap">
              {/* <Badge className="py-1.5" variant={"outline"}>
                Status: {data.status}
              </Badge> */}
              <Badge className="py-1.5" variant={"outline"}>
                Location: {data.location}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 bg-zinc-50 rounded-lg flex items-end justify-end">
        <div className="flex flex-col justify-between items-start gap-2.5 h-full w-full">
          <div className="flex flex-col justify-end items-start gap-2.5">
            <span className="text-xs font-semibold">Manager Details:</span>
            <Badge variant={"outline"}>
              {data?.manager?.name || "Manager Name"}
            </Badge>
          </div>
          <div className="flex flex-col justify-end items-start gap-2.5">
            <span className="text-xs font-semibold">Manager Contact:</span>
            <Badge variant={"outline"}>
              {data?.manager?.phoneNumber || "Manager Phone Number"}
            </Badge>
            <Badge variant={"outline"}>
              {data?.manager?.email || "Manager Email"}
            </Badge>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
