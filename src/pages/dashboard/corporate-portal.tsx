import Container from "@/components/container";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import React, { FC } from "react";

type Props = {
  children?: React.ReactNode;
};

const CorporatePortal: FC<Props> = () => {
  return (
    <Container>
      <ContainerColumn>
        <Heading>Corporate Portal</Heading>
      </ContainerColumn>
    </Container>
  );
};

export default CorporatePortal;
