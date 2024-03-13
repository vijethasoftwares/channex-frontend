import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const CreateBill = () => {
  const [data, setData] = useState({
    bookingId: "",
    guestId: "",
  });
  const [searchParams] = useSearchParams();

  useEffect(() => {
    for (const [key, value] of searchParams.entries()) {
      console.log(key, value);
      setData((prev) => ({ ...prev, [key]: value }));
    }
  }, []);

  console.log(data);

  return (
    <div>
      CreateBill Booking ID: {data?.bookingId}
      Guest ID: {data?.guestId}
    </div>
  );
};

export default CreateBill;
