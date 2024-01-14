import Container from "@/components/container";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { FC } from "react";
import { RoomsData } from "./data";

type Props = {
  children?: React.ReactNode;
};

const Report: FC<Props> = () => {
  return (
    <Container>
      <ContainerColumn>
        <Heading>Report</Heading>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Room Name</TableHead>
              <TableHead>Room Number</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {RoomsData &&
              RoomsData.map((_, i) => {
                return (
                  <TableRow key={i}>
                    <TableCell>
                      {
                        <Avatar>
                          <AvatarImage src={_.profile_pic} alt={_.name} />
                          <AvatarFallback>
                            {_.name.split(" ")[0][0]}
                          </AvatarFallback>
                        </Avatar>
                      }
                    </TableCell>
                    <TableCell>{_.name}</TableCell>
                    <TableCell>{_.phone}</TableCell>
                    <TableCell className="max-w-[150px] break-words">
                      {_.email}
                    </TableCell>
                    <TableCell className="max-w-[150px] break-words">
                      {_.room_name}
                    </TableCell>
                    {/* <TableCell>{_.wallet}$</TableCell> */}
                    <TableCell>${_.room_number}</TableCell>
                    <TableCell>{_.amount}</TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </ContainerColumn>
    </Container>
  );
};

export default Report;
