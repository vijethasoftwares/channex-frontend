import Container from "@/components/container";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import React, { FC } from "react";

type Props = {
  children?: React.ReactNode;
};

const Analytics: FC<Props> = () => {
  return (
    <Container>
      <ContainerColumn>
        <Heading>Analytics</Heading>
      </ContainerColumn>
    </Container>
  );
};

export default Analytics;
