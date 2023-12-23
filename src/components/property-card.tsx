import React, { FC } from "react";
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
    <div className="w-full flex items-stretch justify-start p-2.5 border rounded-xl">
      <div className="w-2/6 flex flex-col">
        <div className="w-full bg-zinc-50 rounded-md flex">
          <Avatar className="w-full h-48 rounded-xl">
            <AvatarImage src={data.images[0]} className="object-cover" />
            <AvatarFallback className="rounded-xl border">
              <div className="w-full h-full flex items-center justify-center">
                "No Image"
              </div>
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-2">
          {Array.from({ length: 4 }).map((_, i) => {
            return (
              <Avatar className="w-full h-24 rounded-xl">
                <AvatarImage src={""} className="w-full h-full object-cover" />
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
            <Heading variant="subheading">{data.name}</Heading>
            <Heading variant="body">{data.description}</Heading>
            <Heading variant="caption">{data.address}</Heading>
          </div>
          <div className="flex justify-start items-start gap-2.5">
            <Badge className="py-2">Size: {data.size}</Badge>
            <Badge className="py-2">Status: {data.status}</Badge>
            <Badge className="py-2">Location: {data.location}</Badge>
          </div>
        </div>
      </div>
      <div className="p-3 pl-5 border-l flex items-end justify-end">
        <div className="flex flex-col justify-end items-end gap-2.5">
          <Heading variant="caption">{data.contactInfo.email}</Heading>
          <Heading variant="caption">{data.contactInfo.phone}</Heading>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
