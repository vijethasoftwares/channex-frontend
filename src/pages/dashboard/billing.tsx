import Container from "@/components/container";
import ContainerBetween from "@/components/container-between";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import { RoomProps } from "@/components/types/app";
import { SERVER_URL, cn, useGlobalContext } from "@/lib/utils";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Selection,
  useDisclosure,
} from "@nextui-org/react";
import axios from "axios";
import React, { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createSearchParams, useNavigate } from "react-router-dom";

type Props = {
  children?: React.ReactNode;
};

const Billing: FC<Props> = () => {
  const { selectedProperty, user } = useGlobalContext();
  const { isOpen, onOpenChange } = useDisclosure();
  const [rooms, setRooms] = useState<RoomProps[]>([]);
  const [guests, setGuests] = useState<RoomProps>();
  // const [selectedGuestBooking, setSelectedGuestBooking] =
  //   useState<BookingProps>();
  const [selectedRoom, setSelectedRoom] = useState<Selection>(new Set([]));
  const [selectedGuest, setSelectedGuest] = useState<Selection>(new Set([]));
  const [, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const res = await axios.get(
          `${SERVER_URL}/manager/billings/rooms/${selectedProperty}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        const data = res.data;
        setRooms(data?.data);
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    };
    if (selectedProperty && user?.token) {
      fetchGuests();
    }
  }, [selectedProperty, user]);

  useEffect(() => {
    setGuests(
      rooms?.find(
        (room) =>
          room.roomNumber.toString() === Array.from(selectedRoom).toString()
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoom]);

  // useEffect(() => {
  //   const fetchBooking = async () => {
  //     const guest = guests?.guests.find(
  //       (guest) =>
  //         guest.folioId.toString() === Array.from(selectedGuest).toString()
  //     );
  //     if (!guest) {
  //       toast.error("Guest not found");
  //     }
  //     try {
  //       const res = await axios.get(
  //         `${SERVER_URL}/manager/bookings/${guest?.bookingId}`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${user.token}`,
  //           },
  //         }
  //       );
  //       setSelectedGuestBooking(res.data);
  //       setLoading(false);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };
  //   if (!loading && selectedGuest && user?.token) {
  //     fetchBooking();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [selectedGuest, user]);

  return (
    <>
      <Container>
        <ContainerColumn>
          <ContainerBetween>
            <Heading>Billing</Heading>
          </ContainerBetween>
          <div className="grid grid-cols-4 gap-2.5 *:p-5 *:font-semibold">
            {rooms?.map((room) => {
              return (
                <div
                  key={room.roomNumber}
                  onClick={() => {
                    if (room.guests.length === 0) {
                      toast.error("No guests in the room");
                      return;
                    }
                    setSelectedRoom(new Set([room.roomNumber]));
                    onOpenChange();
                  }}
                  className={cn(
                    "p-5 rounded-lg shadow-sm border-2 bg-zinc-50",
                    Array.from(selectedRoom).toString() ===
                      room.roomNumber.toString()
                      ? "border-zinc-700"
                      : "border-zinc-50"
                  )}
                >
                  <h3>Room {room.roomNumber}</h3>
                  <p>
                    Guests:{" "}
                    {room?.guests
                      .map((guest) => {
                        return guest.name;
                      })
                      .join(", ")}
                    {room?.guests.length === 0 && "No guests"}
                  </p>
                </div>
              );
            })}
          </div>
        </ContainerColumn>
      </Container>
      <Modal
        size={"2xl"}
        backdrop="blur"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-5">
                <h3 className="font-semibold">Create Bill</h3>
                <div className="grid grid-cols-3 gap-2.5">
                  {guests?.guests.map((guest) => {
                    return (
                      <div
                        key={guest.folioId}
                        onClick={() => {
                          setSelectedGuest(new Set([guest.folioId]));
                        }}
                        className={cn(
                          "p-5 rounded-lg shadow-sm border-2 bg-zinc-50",
                          Array.from(selectedGuest).toString() ===
                            guest.folioId.toString()
                            ? "border-zinc-700"
                            : "border-zinc-100"
                        )}
                      >
                        <h3>{guest.name}</h3>
                        <p className="text-sm font-medium">{guest.email}</p>
                        <p className="text-sm font-medium">{guest.phone}</p>
                      </div>
                    );
                  })}
                </div>
                <Button
                  onPress={() => {
                    if (Array.from(selectedGuest)?.length === 0) {
                      toast.error("Select a guest to create bill");
                      return;
                    }
                    if (!guests?._id) {
                      toast.error("No booking found for the guest");
                      return;
                    }
                    navigate({
                      pathname: "/dashboard/billing/create",
                      search: createSearchParams({
                        guestId: Array.from(selectedGuest).toString(),
                        bookingId: guests._id,
                      }).toString(),
                    });
                  }}
                  className="bg-zinc-900 text-white font-medium ml-auto"
                >
                  Create Bill
                </Button>
              </ModalHeader>
              <ModalBody className="pb-5"> </ModalBody>
              {/* <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  className="bg-zinc-900 text-white"
                  onPress={handleAddCategory}
                >
                  Save
                </Button>
              </ModalFooter> */}
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default Billing;
