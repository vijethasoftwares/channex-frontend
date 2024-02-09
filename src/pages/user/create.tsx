import Container from "@/components/container";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { SERVER_URL, useGlobalContext } from "@/lib/utils";
import { Input, Select, SelectItem } from "@nextui-org/react";
import axios, { AxiosError } from "axios";
import React, { FC, useState } from "react";
import toast from "react-hot-toast";
import { UserRoles } from "../property/consts";

type Props = {
  children?: React.ReactNode;
};

const UserRoleEnum = [UserRoles.MANAGER, UserRoles.CHEF, UserRoles.ACCOUNTANT]; // Defined user roles

const CreateUser: FC<Props> = () => {
  const { user } = useGlobalContext();

  const [userRole, setUserRole] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("submitting form", e.target);

    if (!user?.userId) {
      toast.error("please login first to proceed");
      return;
    }

    if (userRole.length === 0) {
      toast.error("Please select a user role first");
      return;
    }

    if (username.length <= 3) {
      toast.error("Please provide a valid username");
      return;
    }
    if (name.length <= 3) {
      toast.error("Please provide a valid name for the role: " + userRole);
      return;
    }
    if (phoneNumber.length !== 10) {
      toast.error("phone number should not be less than 10");
      return;
    }
    if (password.length <= 8) {
      toast.error("Password must consists of 8 letters");
      return;
    }

    const resObject = {
      username,
      email,
      name,
      phoneNumber,
      password,
    };
    console.log(resObject);

    try {
      if (userRole === UserRoleEnum[1]) {
        const res = await axios.post(
          SERVER_URL + "/owner/create-manager",
          resObject,
          {
            headers: {
              Authorization: "Bearer " + user.token,
            },
          }
        );
        const data = res.data;
        toast.success(data?.message || "user created successfully");
        console.log(data);
      }
    } catch (error) {
      const err = error as AxiosError & {
        response: { data: { message: string } };
      };
      toast.error(err?.response?.data?.message);
      console.log(err?.response?.data?.message || "failed to create a user");
    }
  };

  return (
    <Container>
      <ContainerColumn>
        <Heading>Create User</Heading>
      </ContainerColumn>
      <div className="mt-5 p-5 bg-zinc-50 border rounded-md w-full">
        <Heading variant="subheading">User Details</Heading>
        <div className="mt-5 grid grid-cols-2 gap-5 w-full">
          <Select
            name="userRole"
            color="default"
            label="User Role"
            labelPlacement="outside"
            placeholder="Select User Role"
            radius="md"
            size="lg"
            variant="bordered"
            value={[userRole]}
            onChange={(e) => setUserRole(e.target.value)}
            fullWidth
          >
            {UserRoleEnum.map((userRole) => (
              <SelectItem key={userRole} value={userRole}>
                {userRole}
              </SelectItem>
            ))}
          </Select>

          <Input
            name="username"
            label="Username"
            labelPlacement="outside"
            placeholder="Enter Username"
            color="default"
            radius="md"
            size="lg"
            variant="bordered"
            value={username}
            onValueChange={setUsername}
            fullWidth
          />
          <Input
            isClearable
            name="fullName"
            color="default"
            label="Full Name"
            labelPlacement="outside"
            placeholder="Enter Full Name"
            radius="md"
            size="lg"
            variant="bordered"
            value={name}
            onValueChange={setName}
            fullWidth
          />
          <Input
            name="email"
            label="Email"
            labelPlacement="outside"
            placeholder="Enter Email"
            type="email"
            color="default"
            radius="md"
            size="lg"
            variant="bordered"
            value={email}
            onValueChange={setEmail}
            fullWidth
          />

          <Input
            name="phoneNumber"
            label="Phone Number"
            labelPlacement="outside"
            placeholder="Enter Phone Number"
            color="default"
            radius="md"
            size="lg"
            variant="bordered"
            value={phoneNumber}
            onValueChange={setPhoneNumber}
            fullWidth
          />

          <Input
            name="password"
            label="Password"
            labelPlacement="outside"
            placeholder="Enter Password"
            type="password"
            color="default"
            radius="md"
            size="lg"
            variant="bordered"
            value={password}
            onValueChange={setPassword}
            fullWidth
          />

          <div className="col-span-2">
            <div className="flex justify-end items-center py-5">
              <Button onClick={handleSubmit} className="px-7 active:scale-95">
                Create User
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default CreateUser;
