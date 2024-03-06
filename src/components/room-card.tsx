import { SERVER_URL, useGlobalContext } from "@/lib/utils";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import axios, { AxiosError } from "axios";
import { motion } from "framer-motion";
import {
  ArrowDownToLine,
  Home,
  MoreVertical,
  Pencil,
  Trash,
  User2,
} from "lucide-react";
import React, { FC } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Heading from "./heading";
import { GlobalContextType } from "./providers";
import { RoomProps } from "./types/app";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

type Props = {
  children?: React.ReactNode;
  data: RoomProps;
  id: string;
  fetchData: (propertyId: string) => void;
};

const RoomCard: FC<Props> = ({ data, id, fetchData }) => {
  const { user } = useGlobalContext() as GlobalContextType;
  const navigate = useNavigate();

  const handleDeleteRoom = async (
    e: React.MouseEvent<HTMLLIElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (!user.token) return toast.error("Error deleting room");
    try {
      toast.loading("Deleting room...");
      const res = await axios.delete(
        SERVER_URL + `/manager/delete-room/${data._id}`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      const d = await res.data;
      console.log(d);
      toast.dismiss();
      toast.success("Room deleted successfully");
      fetchData(id);
    } catch (error) {
      toast.dismiss();
      console.error(error);
      const err = error as AxiosError & {
        response: { data: { message: string } };
      };
      toast.error(err.response.data?.message || "Error deleting room");
    }
  };

  return (
    <motion.div
      layout="position"
      className="relative w-full flex flex-col lg:flex-row items-stretch justify-start p-2.5 border rounded-2xl gap-2.5 bg-white shadow-md"
    >
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
              onClick={handleDeleteRoom}
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
      <div className="w-full p-3 flex-1">
        <div className="w-full h-full flex flex-col justify-between items-start">
          <div className="flex flex-col justify-start items-start gap-2.5">
            {/* <Heading variant="body" className="text-zinc-500">
              {property?.name}
            </Heading> */}
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
              {data?.guests?.length && (
                <Badge className="py-1.5" variant={"outline"}>
                  Vacant Beds: {data?.maxOccupancy - data?.guests?.length}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className=" rounded-lg flex items-end justify-end">
        <div className="flex flex-col justify-end items-start gap-2.5 h-full w-full">
          <div className="px-4 py-3 flex flex-col justify-end items-start gap-2.5">
            <span className="text-sm font-semibold">Price:</span>
            <span className="text-xl font-semibold">
              {data?.pricePerMonth
                ? `₹${data?.pricePerMonth}/month`
                : `₹${data?.pricePerDay}/day`}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RoomCard;
