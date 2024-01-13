import { NextUIProvider } from "@nextui-org/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import Providers from "./components/providers.tsx";
import "./index.css";
import Login from "./pages/auth/login.tsx";
import AddBooking from "./pages/bookings/add.tsx";
import AllBooking from "./pages/bookings/all.tsx";
import CheckIn from "./pages/bookings/check-in.tsx";
import CheckOut from "./pages/bookings/check-out.tsx";
import AddComplaints from "./pages/complaints/add.tsx";
import AllComplaints from "./pages/complaints/all.tsx";
import Analytics from "./pages/dashboard/analytics.tsx";
import Billing from "./pages/dashboard/billing.tsx";
import CorporatePortal from "./pages/dashboard/corporate-portal.tsx";
import Guests from "./pages/dashboard/guests.tsx";
import Report from "./pages/dashboard/report.tsx";
import ErrorPage from "./pages/error/index.tsx";
import AddProperty from "./pages/property/add.tsx";
import AllProperties from "./pages/property/all.tsx";
import PropertyById from "./pages/property/id.tsx";
import AddReview from "./pages/reviews/add.tsx";
import AllReviews from "./pages/reviews/all.tsx";
import AddRoom from "./pages/rooms/add.tsx";
import AllRooms from "./pages/rooms/all.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "dashboard",
        children: [
          {
            path: "analytics",
            element: <Analytics />,
          },
          {
            path: "report",
            element: <Report />,
          },
          {
            path: "corporate-portal",
            element: <CorporatePortal />,
          },
          {
            path: "guests",
            element: <Guests />,
          },
          {
            path: "billing",
            element: <Billing />,
          },
        ],
      },
      {
        path: "property",
        children: [
          {
            index: true,
            element: <AllProperties />,
          },
          {
            path: "add",
            element: <AddProperty />,
          },
          {
            path: ":id",
            element: <PropertyById />,
          },
        ],
      },
      {
        path: "rooms",
        children: [
          {
            index: true,
            element: <AllRooms />,
          },
          {
            path: "add",
            element: <AddRoom />,
          },
        ],
      },
      {
        path: "bookings",
        children: [
          {
            index: true,
            element: <AllBooking />,
          },
          {
            path: "add",
            element: <AddBooking />,
          },
          {
            path: "check-in/:id",
            element: <CheckIn />,
          },
          {
            path: "check-out/:id",
            element: <CheckOut />,
          },
        ],
      },
      {
        path: "complaints",
        children: [
          {
            index: true,
            element: <AllComplaints />,
          },
          {
            path: "add",
            element: <AddComplaints />,
          },
        ],
      },
      {
        path: "reviews",
        children: [
          {
            index: true,
            element: <AllReviews />,
          },
          {
            path: "add",
            element: <AddReview />,
          },
        ],
      },
    ],
  },
  {
    path: "login",
    element: <Login />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers>
      <NextUIProvider>
        <RouterProvider router={router} />
      </NextUIProvider>
      <Toaster
        toastOptions={{
          style: {
            borderRadius: "99px",
            background: "#333",
            color: "#fff",
            maxWidth: "100%",
          },
        }}
        containerStyle={{
          bottom: "3rem",
        }}
        position="bottom-center"
      />
    </Providers>
  </React.StrictMode>
);
