import { ObjectId } from "mongodb";

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
  _id?: string;
  name: string;
  type: string;
  location: string;
  address: string;
  coOfLocation: { type: "Point"; coordinates: [number, number] };
  nearbyPlaces?: string[];
  images: { label: string; url: string }[];
  manager?: {
    name: string;
    email: string;
    phoneNumber: string;
  };
  permissions?: string[];
  facilities?: string[];
  isParkingSpaceAvailable?: boolean | "true" | "false" | string;
  isCoupleFriendly?: boolean;
  foodMenu?: FoodMenuProps[];
}

export interface FoodMenuProps {
  day: string;
  meals: MealData[];
}

export interface MealData {
  name: string;
  hasMealItems?: boolean;
  vegMealItems: string[];
  nonVegMealItems: string[];
}

export interface BookingProps {
  _id?: string;
  user?: UserProps;
  propertyId: string;
  bookingType: string;
  bookingStatus: string;
  paymentMethod: string;
  primaryGuestName: string;
  checkedIn?: {
    additionalGuests: {
      roomNumber: number;
      guest: GuestDetailsProps;
    }[];
    primaryGuest: {
      roomNumber: number;
      guest: GuestDetailsProps;
    };
  };
  guestName?: string;
  guestPhoneNumber: number;
  guestEmail?: string;
  roomCategory: string;
  roomType: string;
  from: Date;
  to: Date;
  checkIn: object;
  paymentStatus: string;
  numberOfGuests: number;
  paymentAmount: number;
  roomAssigned?: string;
  isCheckedIn?: boolean;
  isCheckedOut?: boolean;
}

export interface RoomProps {
  _id?: string;
  roomNumber: number;
  roomCategory: string;
  roomType: string;
  roomSize: number;
  pricePerMonth?: number;
  maxOccupancy: number;
  vacancy: number;
  description?: string;
  propertyId: string;
  guestDetails: GuestDetailsProps[];
  pricePerDay?: number;
  images: ImagesProps;
  facilities?: string[];
}

export interface GuestDetailsProps {
  name: string;
  email: string;
  phoneNumber: string;
  dob?: Date;
  checkOutDate?: Date;
  idProofBackImage?: { label: string; url: string };
  idProofFrontImage?: { label: string; url: string };
}

interface ImagesProps {
  roomImage: { label: string; url: string }[];
  washroomImage: { label: string; url: string }[];
  bedImage: { label: string; url: string }[];
  additionalImages: { label: string; url: string }[];
}

export interface ComplaintProps {
  _id?: ObjectId;
  owner_user_id: ObjectId;
  propertyId: ObjectId;
  propertyName: string;
  bookingId: ObjectId;
  userId: string;
  userName: string;
  userPhoneNumber: number;
  userEmailAddress?: string;
  complaintType: string;
  complaintDetails: string;
  complaintStatus: string;
  complaintRemarks?: string;
  isResolved?: boolean;
  createdAt?: Date;
}

export interface ReviewProps {
  _id?: ObjectId;
  owner_user_id: ObjectId;
  propertyId: ObjectId;
  propertyName: string;
  bookingId: ObjectId;
  userId: string;
  userName: string;
  userPhoneNumber: number;
  userEmailAddress?: string;
  profilePicture?: string;
  rating: number;
  review: string;
  createdAt?: Date;
}
