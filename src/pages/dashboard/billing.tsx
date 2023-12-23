import Container from "@/components/container";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import React, { FC } from "react";

type Props = {
  children?: React.ReactNode;
};

const Billing: FC<Props> = () => {
  return (
    <Container>
      <ContainerColumn>
        <Heading>Billing</Heading>
      </ContainerColumn>
    </Container>
  );
};

export default Billing;
