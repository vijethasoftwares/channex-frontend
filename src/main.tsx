import { NextUIProvider } from "@nextui-org/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import Providers from "./components/providers.tsx";
import "./index.css";
import Login from "./pages/auth/login.tsx";
import AllProperties from "./pages/property/all.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <div>Not Found</div>,
    children: [
      {
        path: "property",
        children: [
          {
            index: true,
            element: <AllProperties />,
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
            width: "auto",
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
