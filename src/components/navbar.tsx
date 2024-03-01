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
  Select,
  SelectItem,
  Spinner,
} from "@nextui-org/react";
import axios from "axios";
import { PanelRightClose } from "lucide-react";
import { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { PropertyProps, UserProps } from "./types/app";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

type Props = {
  children?: React.ReactNode;
};

const NavbarComp: FC<Props> = () => {
  const {
    user,
    setUser,
    loading,
    // isPropertyLoading,
    selectedProperty,
    setSelectedProperty,
    setIsPropertyLoading,
  } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);
  const [userProperties, setUserProperties] = useState<PropertyProps[]>();
  const navigate = useNavigate();

  const fetchuser = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${SERVER_URL}/user/load-user`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = res.data;
      setUser({ ...user, ...data.user });
    } catch (error) {
      navigate("/login");
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProperties = async () => {
    try {
      setIsPropertyLoading(true);
      const res = await axios.get(SERVER_URL + "/owner/get-my-properties", {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const data = await res.data;
      setUserProperties(data.properties);
      setSelectedProperty(data.properties[0]._id);
    } catch (error) {
      console.error(error);
    } finally {
      setIsPropertyLoading(false);
    }
  };

  console.log(user);

  useEffect(() => {
    if (user) {
      fetchUserProperties();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedProperty]);
  useEffect(() => {
    if (!user?.token && !loading) {
      navigate("/login");
    }
    if (user?.token) {
      fetchuser();
    } else {
      setIsLoading(false);
      toast.error("Please login to continue");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token]);

  const userInitials = user?.role ? user?.role.split(" ").map((n) => n[0]) : "";

  const handleSignOut = () => {
    setUser(null as unknown as UserProps);
    localStorage.removeItem("user");
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
        <Select
          items={userProperties || []}
          label="Select Property to view rooms"
          labelPlacement="outside"
          placeholder="Select Property"
          variant="bordered"
          selectedKeys={[selectedProperty]}
          onChange={(e) => setSelectedProperty(e.target.value)}
          className="max-w-[15rem]"
        >
          {(property) => (
            <SelectItem key={property._id?.toString() || ""}>
              {property.name}
            </SelectItem>
          )}
        </Select>
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
