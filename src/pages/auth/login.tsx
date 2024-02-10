import { GlobalContextType } from "@/components/providers";
import { UserProps } from "@/components/types/app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SERVER_URL, useGlobalContext } from "@/lib/utils";
import axios, { AxiosResponse } from "axios";
import { FC, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

type Props = {
  children?: React.ReactNode;
};

const Login: FC<Props> = () => {
  const { setUser } = useGlobalContext() as GlobalContextType;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response: AxiosResponse<UserProps> = await axios.post(
        `${SERVER_URL}/auth/verify/phone-or-email`,
        formData
      );
      const { userId, role, token } = response.data;
      if (role !== "Owner") {
        throw new Error("You are not authorized to access this page");
      }
      setUser({ userId, role, token });
      localStorage.setItem("user", JSON.stringify({ userId, role, token }));

      navigate("/dashboard");
    } catch (error) {
      const err = error as AxiosResponse & {
        response: { data: { message: string } };
      };
      toast.error(err?.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container relative grid  h-screen max-h-[900px]  flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="bg-muted relative hidden h-full flex-col p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          ROFABS FOR OPERATIONS
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Rofabs for Manager is a dashbaord for managers to manage
              their hostels, payinng guests and bookings. &rdquo;
            </p>
            <footer className="text-sm">Rofabs</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Login to your account
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter your email below to login to your account
            </p>
            <form onSubmit={onSubmit}>
              <div className="mt-5 grid gap-3">
                <div className="">
                  <Label className="sr-only" htmlFor="email">
                    Phone Number
                  </Label>
                  <Input
                    id="emailOrPhone"
                    placeholder="Enter your email address or phone number"
                    type="text"
                    autoCorrect="off"
                    disabled={isLoading}
                    value={formData.emailOrPhone}
                    onChange={handleChange}
                  />
                </div>
                <div className="">
                  <Label className="sr-only" htmlFor="password">
                    Password
                  </Label>
                  <Input
                    id="password"
                    placeholder="Enter your password"
                    type="password"
                    autoCorrect="off"
                    disabled={isLoading}
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                <Button type="submit" isLoading={isLoading} className="px-10">
                  Login
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
