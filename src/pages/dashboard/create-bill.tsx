import { useLocation } from "react-router-dom";

const CreateBill = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const bookingId = params.get("bookingId");
  const guestId = params.get("guestId");

  return (
    <div>
      CreateBill Booking ID: {bookingId}
      Guest ID: {guestId}
    </div>
  );
};

export default CreateBill;
