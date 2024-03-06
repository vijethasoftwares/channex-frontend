import { SERVER_URL, useGlobalContext } from "@/lib/utils";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import axios, { AxiosError } from "axios";
import { ArrowDownToLine, MoreVertical, Pencil, Trash } from "lucide-react";
import React, { FC } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import Heading from "./heading";
import { GlobalContextType } from "./providers";
import { PropertyProps } from "./types/app";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

type Props = {
  children?: React.ReactNode;
  data: PropertyProps;
  fetchData: () => void;
};

const PropertyCard: FC<Props> = ({ data, fetchData }) => {
  const { user } = useGlobalContext() as GlobalContextType;
  const navigate = useNavigate();

  const handleDeleteProperty = async (
    e: React.MouseEvent<HTMLLIElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (!user.token) return toast.error("Error deleting room");
    try {
      toast.loading("Deleting room...");
      const res = await axios.delete(
        SERVER_URL + `/owner/delete-property/${data._id}`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      const d = await res.data;
      console.log(d);
      toast.dismiss();
      toast.success("Property deleted successfully");
      fetchData();
    } catch (error) {
      toast.dismiss();
      console.error(error);
      const err = error as AxiosError & {
        response: { data: { message: string } };
      };
      toast.error(err.response.data?.message || "Error deleting property");
    }
  };

  return (
    <div className="relative w-full flex flex-col lg:flex-row items-stretch justify-start p-2.5 border rounded-2xl gap-2.5 shadow-md">
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
            <Heading variant="caption" className="gap-2.5 flex items-center">
              {data.isCoupleFriendly ? (
                <Badge
                  variant="default"
                  className="bg-green-500 hover:bg-green-600"
                >
                  Couple Friendly
                </Badge>
              ) : (
                <Badge variant="destructive">Not Couple Friendly</Badge>
              )}
              {data.isParkingSpaceAvailable ? (
                <Badge
                  variant="default"
                  className="bg-green-500 hover:bg-green-600"
                >
                  Parking Space Available
                </Badge>
              ) : (
                <Badge variant="destructive">Parking Space Not Available</Badge>
              )}
            </Heading>
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-start items-start gap-2.5 flex-wrap"></div>
            <div className="flex justify-start flex-col items-start gap-2.5 flex-wrap text-sm font-medium max-w-md">
              <span className="font-semibold">Location:</span>{" "}
              <span className="text-zinc-500">{data.location}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="ounded-lg flex items-end justify-end">
        <div className="flex flex-col justify-end items-start gap-2.5 h-full w-full">
          <div className="flex flex-col justify-end items-start gap-2.5 px-4 py-3">
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
        <Dropdown classNames={{ base: "mr-10" }}>
          <DropdownTrigger>
            <Button
              variant={"ghost"}
              className="w-auto h-auto px-2 rounded-3xl"
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Static Actions">
            <DropdownItem
              onClick={() => navigate("edit/" + data._id?.toString() || "")}
              key="edit"
            >
              <Pencil className="inline-block w-4 h-4 mr-2" />
              Edit
            </DropdownItem>
            <DropdownItem
              onClick={handleDeleteProperty}
              key="delete"
              className="text-danger"
              color="danger"
            >
              <Trash className="inline-block w-4 h-4 mr-2" />
              Delete file
            </DropdownItem>
            <DropdownItem key="download">
              <ArrowDownToLine className="inline-block w-4 h-4 mr-1" /> Download
              Report
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
};

export default PropertyCard;
