import Container from "@/components/container";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import React, { FC } from "react";

type Props = {
  children?: React.ReactNode;
};

const Report: FC<Props> = () => {
  return (
    <Container>
      <ContainerColumn>
        <Heading>Report</Heading>
      </ContainerColumn>
    </Container>
  );
};

export default Report;
