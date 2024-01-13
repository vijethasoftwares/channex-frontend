import React, { FC } from "react";
import { useParams } from "react-router-dom";

type Props = {
  children?: React.ReactNode;
};

const CheckOut: FC<Props> = (props) => {
  const { id } = useParams<{ id: string }>();
  console.log(props);
  return <div>CheckIn ID: {id}</div>;
};

export default CheckOut;
