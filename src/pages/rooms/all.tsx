import Container from "@/components/container";
import ContainerBetween from "@/components/container-between";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import { GlobalContextType } from "@/components/providers";
import RoomCard from "@/components/room-card";
import { RoomProps } from "@/components/types/app";
import { Button } from "@/components/ui/button";
import { SERVER_URL, useGlobalContext } from "@/lib/utils";
import { Input, Spinner } from "@nextui-org/react";
import axios from "axios";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import React, { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

type Props = {
  children?: React.ReactNode;
};

const AllRooms: FC<Props> = () => {
  const { user, selectedProperty, isPropertyLoading } =
    useGlobalContext() as GlobalContextType;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rooms, setRooms] = useState<RoomProps[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<RoomProps[]>();

  const fetchRoomsByProperty = async (propertyId: string) => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        SERVER_URL + `/manager/get-property-rooms/${propertyId}`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      const data = await res.data;
      setRooms(data.rooms);
      setFilteredRooms(data.rooms);
      console.log(data);
      toast.success("Rooms fetched successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error fetching rooms");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && selectedProperty.length > 3) {
      fetchRoomsByProperty(selectedProperty);
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
          <Heading>All Rooms</Heading>
          <Link to={"add"}>
            <Button className="active:scale-95 bg-purple-700">
              + Add Room
            </Button>
          </Link>
        </ContainerBetween>
        <Heading variant="subtitle">Search or select a room</Heading>
        <Input
          type="text"
          onChange={(e) => {
            const value = e.target.value;
            const filtered = rooms?.filter((room) => {
              return room.roomNumber.toString().includes(value.toLowerCase());
            });
            setFilteredRooms(filtered);
          }}
          className="mb-2.5"
          placeholder="Search rooms"
          classNames={{
            inputWrapper: "rounded-xl border shadow-none pl-5",
            base: "font-medium text-black",
          }}
        />
        {isLoading && (
          <div className="flex justify-center items-center px-5 py-10 w-full">
            <Loader2 className="w-10 h-10 animate-spin text-black" />
          </div>
        )}
        {selectedProperty && !isLoading && rooms.length === 0 && (
          <div className="px-5 py-10 flex justify-center items-center">
            <Heading variant="subtitle">
              No rooms found for this property
            </Heading>
          </div>
        )}
        <motion.div className="flex flex-col *:w-full justify-start items-start gap-5">
          {filteredRooms &&
            selectedProperty &&
            filteredRooms.map((room) => {
              return (
                <RoomCard
                  id={selectedProperty}
                  fetchData={fetchRoomsByProperty}
                  data={room}
                />
              );
            })}
        </motion.div>
      </ContainerColumn>
    </Container>
  );
};

export default AllRooms;
