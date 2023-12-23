import Container from "@/components/container";
import ContainerBetween from "@/components/container-between";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import React, { FC } from "react";

type Props = {
  children?: React.ReactNode;
};

const AddBooking: FC<Props> = (props) => {
  return (
    <Container>
      <ContainerColumn>
        <Heading>Add Booking</Heading>
      </ContainerColumn>
    </Container>
  );
};

export default AddBooking;
