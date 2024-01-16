import Container from "@/components/container";
import ContainerBetween from "@/components/container-between";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import { GlobalContextType } from "@/components/providers";
import RoomCard from "@/components/room-card";
import { PropertyProps, RoomProps } from "@/components/types/app";
import { Button } from "@/components/ui/button";
import { SERVER_URL, useGlobalContext } from "@/lib/utils";
import { Input, Select, SelectItem, Spinner } from "@nextui-org/react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import React, { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

type Props = {
  children?: React.ReactNode;
};

const AllRooms: FC<Props> = () => {
  const { user } = useGlobalContext() as GlobalContextType;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPropertyLoading, setIsPropertyLoading] = useState<boolean>(false);
  const [rooms, setRooms] = useState<RoomProps[]>();
  const [filteredRooms, setFilteredRooms] = useState<RoomProps[]>();
  const [userProperties, setUserProperties] = useState<PropertyProps[]>();
  const [selectedProperty, setSelectedProperty] = useState<string>("");

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

  const fetchUserProperties = async () => {
    try {
      setIsPropertyLoading(true);
      const res = await axios.get(SERVER_URL + "/owner/get-all-properties", {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const data = await res.data;
      setUserProperties(data.properties);
      setSelectedProperty(data.properties[0]._id);
    } catch (error) {
      console.error(error);
    } finally {
      setIsPropertyLoading(false);
    }
  };

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // e.preventDefault();
    setSelectedProperty(e.target.value);
  };

  useEffect(() => {
    if (user && selectedProperty.length > 3) {
      fetchRoomsByProperty(selectedProperty);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedProperty]);

  useEffect(() => {
    if (user) {
      fetchUserProperties();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
          <div className="flex justify-end flex-1 items-end gap-5">
            <Select
              items={userProperties || []}
              label="Select Property to view rooms"
              labelPlacement="outside"
              placeholder="Select Property"
              variant="bordered"
              selectedKeys={[selectedProperty]}
              onChange={handleSelectionChange}
              className="max-w-[15rem]"
            >
              {(property) => (
                <SelectItem key={property._id?.toString() || ""}>
                  {property.name}
                </SelectItem>
              )}
            </Select>
            <Link to={"add"}>
              <Button className="active:scale-95 bg-purple-700">
                + Add Room
              </Button>
            </Link>
          </div>
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
          className="mb-5"
          classNames={{
            inputWrapper: "shadow-none border-1",
          }}
          variant="bordered"
          size="sm"
          radius="md"
          placeholder="Search rooms"
        />
        {isLoading && (
          <div className="flex justify-center items-center px-5 py-10 w-full">
            <Loader2 className="w-10 h-10 animate-spin text-black" />
          </div>
        )}
        <AnimatePresence>
          {" "}
          <motion.div
            layout
            className="flex flex-col *:w-full justify-start items-start gap-5"
          >
            {filteredRooms &&
              selectedProperty &&
              filteredRooms.map((room) => {
                return <RoomCard data={room} />;
              })}
          </motion.div>
        </AnimatePresence>
      </ContainerColumn>
    </Container>
  );
};

export default AllRooms;
