import Container from "@/components/container";
import ContainerBetween from "@/components/container-between";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import React, { FC } from "react";

type Props = {
  children?: React.ReactNode;
};

const AllProperties: FC<Props> = () => {
  return (
    <Container>
      <ContainerColumn>
        <ContainerBetween>
          <Heading>All Properties</Heading>
          <Button className="active:scale-95 bg-purple-700">
            + Add Property
          </Button>
        </ContainerBetween>
      </ContainerColumn>
    </Container>
  );
};

export default AllProperties;
