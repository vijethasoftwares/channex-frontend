import { SERVER_URL, useGlobalContext } from "@/lib/utils";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Spinner,
} from "@nextui-org/react";
import axios from "axios";
import { PanelRightClose } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GlobalContextType } from "./providers";
import { UserProps } from "./types/app";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

type Props = {
  children?: React.ReactNode;
};

const NavbarComp: FC<Props> = () => {
  const { user, setUser } = useGlobalContext() as GlobalContextType;
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        axios
          .get(`${SERVER_URL}/user/load-user`, {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          })
          .then((response) => {
            const { data } = response;
            setUser({ ...user, ...data.user });
            // navigate("/dashboard/analytics");
          })
          .catch((error) => {
            navigate("/login");
            console.error("Error fetching user data:", error);
          })
          .finally(() => {
            setIsLoading(false);
          });
      } catch (error) {
        console.log(error);
      }
    };
    if (user?.userId) fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token]);
  console.log(user);

  const userInitials = user?.role ? user?.role.split(" ").map((n) => n[0]) : "";

  const handleSignOut = () => {
    setUser(null as unknown as UserProps);
    localStorage.removeItem("_rfou");
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 w-full h-full flex justify-center items-center z-[999] bg-white">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Navbar maxWidth="2xl" height={"auto"} position="static" className="py-4">
      <NavbarBrand className="gap-1">
        <PanelRightClose size={35} />
        <p className="font-semibold text-inherit font-sora text-sm leading-4">
          Rofabs <span className="block">For Operations</span>
        </p>
      </NavbarBrand>
      <NavbarContent justify="end">
        {user ? (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button
                variant={"ghost"}
                className="relative rounded-full pl-7 pr-1 h-auto active:scale-100 bg-gray-50 transform"
              >
                <div className="flex flex-col justify-center items-end font-semibold">
                  {user?.role}
                  <span className="text-xs font-semibold text-gray-500">
                    {user?.username}
                  </span>
                </div>
                <Avatar className="w-12 h-12 ml-2">
                  <AvatarImage src={user?.profilePicture} />
                  <AvatarFallback className="text-xs font-semibold bg-gradient-to-l from-indigo-600 to-purple-600 text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">{user?.email}</p>
              </DropdownItem>
              <DropdownItem key="settings">My Settings</DropdownItem>
              <DropdownItem onClick={handleSignOut} key="logout" color="danger">
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <NavbarItem>
            <Link to={"/login"}>
              <Button variant="default">Login</Button>
            </Link>
          </NavbarItem>
        )}
      </NavbarContent>
    </Navbar>
  );
};

export default NavbarComp;
