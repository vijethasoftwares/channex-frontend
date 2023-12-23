import Container from "@/components/container";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import React, { FC } from "react";

type Props = {
  children?: React.ReactNode;
};

const AddReview: FC<Props> = () => {
  return (
    <Container>
      <ContainerColumn>
        <Heading>Add Review</Heading>
      </ContainerColumn>
    </Container>
  );
};

export default AddReview;
