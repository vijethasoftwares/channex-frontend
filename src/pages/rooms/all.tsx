import Container from "@/components/container";
import ContainerBetween from "@/components/container-between";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import { GlobalContextType } from "@/components/providers";
import RoomCard from "@/components/room-card";
import { PropertyProps, RoomProps } from "@/components/types/app";
import { Button } from "@/components/ui/button";
import { SERVER_URL, cn, useGlobalContext } from "@/lib/utils";
import { Spinner } from "@nextui-org/react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import React, { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Props = {
  children?: React.ReactNode;
};

const AllRooms: FC<Props> = () => {
  const { user } = useGlobalContext() as GlobalContextType;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPropertyLoading, setIsPropertyLoading] = useState<boolean>(false);
  const [rooms, setRooms] = useState<RoomProps[]>();
  const [userProperties, setUserProperties] = useState<PropertyProps[]>();
  const [selectedProperty, setSelectedProperty] = useState<PropertyProps>();

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
      console.log(data);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
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
      console.log(data.properties);
      setUserProperties(data.properties);
      setSelectedProperty(data.properties[0]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsPropertyLoading(false);
    }
  };

  useEffect(() => {
    if (user && selectedProperty?._id) {
      fetchRoomsByProperty(selectedProperty._id);
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
          <Link to={"add"}>
            <Button className="active:scale-95 bg-purple-700">
              + Add Room
            </Button>
          </Link>
        </ContainerBetween>
        <Heading variant="subtitle">Select a property to view bookings</Heading>
        <div className="rounded-lg grid grid-cols-4 gap-2.5">
          {userProperties?.map((property) => {
            return (
              <div
                onClick={() => setSelectedProperty(property)}
                className={cn(
                  "py-4 px-5 bg-zinc-100 rounded-md duration-150 ring-zinc-100 hover:ring-2 hover:bg-white cursor-pointer",
                  selectedProperty?._id === property._id && "ring-4 bg-white"
                )}
              >
                <h3 className="text-base font-semibold">{property.name}</h3>
                <p className="text-xs text-zinc-600">{property.location}</p>
              </div>
            );
          })}
        </div>
        {isLoading && (
          <div className="flex justify-center items-center px-5 py-10 w-full">
            <Loader2 className="w-10 h-10 animate-spin text-black" />
          </div>
        )}
        {rooms &&
          selectedProperty &&
          rooms.map((room) => {
            return <RoomCard data={room} property={selectedProperty} />;
          })}
      </ContainerColumn>
    </Container>
  );
};

export default AllRooms;
