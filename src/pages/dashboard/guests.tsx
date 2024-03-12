import Container from "@/components/container";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import Loader from "@/components/loader";
import { BookingProps } from "@/components/types/app";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SERVER_URL, useGlobalContext } from "@/lib/utils";
import axios from "axios";
import dayjs from "dayjs";
import React, { FC, useEffect, useState } from "react";

type Props = {
  children?: React.ReactNode;
};

const Guests: FC<Props> = () => {
  const { selectedProperty, user } = useGlobalContext();
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const res = await axios.get(
          `${SERVER_URL}/manager/inhouse-guests/${selectedProperty}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        const data = res.data;
        setGuests(data?.data);
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    };
    if (selectedProperty && user.token) {
      fetchGuests();
    }
  }, [selectedProperty, user]);

  return (
    <Container>
      <ContainerColumn>
        <Heading>Guests</Heading>
        {loading && <Loader />}
        {!loading && guests.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest Name</TableHead>
                <TableHead>Room NUmber</TableHead>
                <TableHead>Guest Email</TableHead>
                <TableHead>Guest Phone Number</TableHead>
                <TableHead>Check Out Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guests.map((guest: BookingProps) => {
                const primaryGuest = guest.checkedIn?.find(
                  (guest) => guest.isPrimary
                );
                return (
                  <TableRow key={guest._id}>
                    <TableCell>{primaryGuest?.name}</TableCell>
                    <TableCell>{primaryGuest?.roomNumber}</TableCell>
                    <TableCell>{primaryGuest?.email}</TableCell>
                    <TableCell>{primaryGuest?.phone}</TableCell>
                    <TableCell>
                      {dayjs(guest.to).format("DD/MM/YYYY")}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </ContainerColumn>
    </Container>
  );
};

export default Guests;
