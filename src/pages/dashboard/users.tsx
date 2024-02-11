import Container from "@/components/container";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import { FC } from "react";

type Props = {
  children?: React.ReactNode;
};

const Users: FC<Props> = () => {
  return (
    <Container>
      <ContainerColumn>
        <Heading>Users</Heading>
      </ContainerColumn>
    </Container>
  );
};

export default Users;
