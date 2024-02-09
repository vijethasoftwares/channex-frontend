import { GlobalContextType } from "@/components/providers";
import { UserProps } from "@/components/types/app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SERVER_URL, useGlobalContext } from "@/lib/utils";
import axios, { AxiosResponse } from "axios";
import { FC, useState } from "react";
import toast from "react-hot-toast";
import OTPInput from "react-otp-input";
import { useNavigate } from "react-router-dom";

type Props = {
  children?: React.ReactNode;
};

const Login: FC<Props> = () => {
  const { user, setUser } = useGlobalContext() as GlobalContextType;

  const [activeStep, setActiveStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    phone: "",
    otp: "",
  });

  const navigate = useNavigate();

  const handleChangeOtp = (otp: string) => {
    setFormData({ ...formData, otp });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleGetOtp = async () => {
    return axios
      .post(`${SERVER_URL}/auth/login`, {
        phoneNumber: formData.phone,
      })
      .then((res) => {
        console.log(res.data);
        setActiveStep(1);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleVerifyOtp = async () => {
    return axios
      .post(`${SERVER_URL}/auth/verifyOtp`, {
        otp: formData.otp,
        phoneNumber: formData.phone,
      })
      .then((res: AxiosResponse) => {
        const { data } = res;
        const { userId, token, role } = data as UserProps;
        if (role === "Owner") {
          toast.success("Login successful");
          localStorage.setItem(
            "_rfou",
            JSON.stringify({ userId, token, role })
          );
          setUser({ ...user, userId, token, role });
          navigate("/");
        } else {
          toast.error("You are not authorized to access this page");
          Promise.reject("You are not authorized to access this page");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    if (activeStep === 0) {
      if (formData.phone.length !== 10) {
        toast.error("Please enter a valid phone number");
        setIsLoading(false);
        return;
      }
      toast.promise(handleGetOtp(), {
        loading: "Sending OTP",
        success: "OTP sent successfully",
        error: "Error while sending OTP",
      });
      setIsLoading(false);
    } else {
      if (formData.otp.length !== 6) {
        toast.error("Please enter a valid OTP");
        setIsLoading(false);
        return;
      }
      toast.promise(handleVerifyOtp(), {
        loading: "Verifying OTP",
        success: "OTP verified successfully",
        error: "Error while verifying OTP",
      });
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
                {activeStep === 0 && (
                  <div className="">
                    <Label className="sr-only" htmlFor="email">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      placeholder="Phone Number"
                      type="number"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={isLoading}
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                )}
                {activeStep === 1 && (
                  <div className="relative flex w-full justify-center">
                    <OTPInput
                      value={formData.otp}
                      placeholder="000000"
                      onChange={handleChangeOtp}
                      numInputs={6}
                      renderSeparator={<span className="text-zinc-300">-</span>}
                      renderInput={(props) => (
                        <input
                          {...props}
                          style={{ width: "3rem", height: "3rem" }}
                          className="rounded-md border p-4 text-center text-base"
                        />
                      )}
                    />
                  </div>
                )}
                <Button type="submit" isLoading={isLoading}>
                  {activeStep === 0 ? "Send OTP" : "Verify OTP"}
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
