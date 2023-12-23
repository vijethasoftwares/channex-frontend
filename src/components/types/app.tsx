export interface UserProps {
  role: "Admin" | "Owner" | "Manager" | "User";
  token: string;
  userId: string;
  username?: string;
  profilePicture?: string;
  phoneNumber?: string;
  email?: string;
}

export interface PropertyProps {
  address?: string;
  coOfLocation?: { type: "Point"; coordinates: [number, number] };
  complaints?: string[];
  contactInfo?: { phone: string; email: string };
  description?: string;
  extraFacilities?: ["Swimming Pool", "Gym", "Parking"];
  facilitiesInProperty?: [
    | "Parking space"
    | "Swimming Pool"
    | "Gym"
    | "Common Room with TV"
    | "Indoor Play games"
    | "Laundry"
    | "Common Washing machine"
    | "Washing machine per floor"
    | "Food served to room"
    | "Dining hall"
    | "Food on order (payable)"
  ];
  images?: string[];
  isFeatured?: boolean;
  location?: string;
  name?: string;
  owner_user_id?: string;
  size?: number;
  status?: "Available" | "Not Available";
}
