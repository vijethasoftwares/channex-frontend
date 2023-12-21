export interface UserProps {
  role: "Admin" | "Owner" | "Manager" | "User";
  token: string;
  userId: string;
  username?: string;
  profilePicture?: string;
  phoneNumber?: string;
  email?: string;
}
