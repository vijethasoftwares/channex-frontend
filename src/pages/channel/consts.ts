export const DaysEnum = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const facilitiesEnum = [
  "Parking space",
  "Gym",
  "Common Room with TV",
  "Indoor Play games",
  "Laundry",
  "Common Washing machine",
  "Washing machine per floor",
  "Food served to room",
  "Dining hall",
  "Food on order (payable)",
];

export const Permissions = [
  { key: "entry", value: "27/7 entry" },
  { key: "smoking", value: "allow smoking" },
  { key: "pets", value: "allow pets" },
  { key: "drinking", value: "allow drinking" },
  { key: "guests", value: "allow guests" },
];

export const PropertyTypeEnum = ["Hostel/PG", "Hotel", "Family Apartment"];
export const MealNameEnum = ["Breakfast", "Lunch", "Snack", "Dinner"];

export const UserRoles = Object.freeze({
  ADMIN: "Admin",
  OWNER: "Owner",
  MANAGER: "Manager",
  USER: "User",
  ACCOUNTANT: "Accountant",
  SALESMANAGER: "SalesManager",
  SUPERVISOR: "Supervisor",
  CHEF: "Chef",
});
