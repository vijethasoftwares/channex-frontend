import { FC } from "react";
import { useParams } from "react-router-dom";

const EditBooking: FC = () => {
  const { id } = useParams<{ id: string }>();
  return <div>EditBooking id {id}</div>;
};

export default EditBooking;
