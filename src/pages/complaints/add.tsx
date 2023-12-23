import Container from "@/components/container";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import React, { FC } from "react";

type Props = {
  children?: React.ReactNode;
};

const AddComplaints: FC<Props> = () => {
  return (
    <Container>
      <ContainerColumn>
        <Heading>Add Complaints</Heading>
      </ContainerColumn>
    </Container>
  );
};

export default AddComplaints;
