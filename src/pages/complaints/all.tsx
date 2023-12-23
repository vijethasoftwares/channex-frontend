import Container from "@/components/container";
import ContainerBetween from "@/components/container-between";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import React, { FC } from "react";

type Props = {
  children?: React.ReactNode;
};

const AllComplaints: FC<Props> = () => {
  return (
    <Container>
      <ContainerColumn>
        <ContainerBetween>
          <Heading>All Complaints</Heading>
          <Button className="active:scale-95 bg-purple-700">
            + Add Compalint
          </Button>
        </ContainerBetween>
      </ContainerColumn>
    </Container>
  );
};

export default AllComplaints;
