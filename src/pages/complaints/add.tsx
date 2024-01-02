import Container from "@/components/container";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Select, SelectItem, Textarea } from "@nextui-org/react";
import React, { FC } from "react";

type Props = {
  children?: React.ReactNode;
};

const ComplaintTypeEnum = [
  "General",
  "Electrical",
  "Plumbing",
  "Food",
  "Guest",
  "Staff",
];

const ActionByEnum = ["Owner", "Admin", "Manager", "Chef", "Guest"];
// const ActionTaken = ["raised", "in progress", "closed", "completed"];

const AddComplaints: FC<Props> = () => {
  return (
    <Container>
      <ContainerColumn>
        <Heading>Add Complaints</Heading>
      </ContainerColumn>
      <div className="mt-5 p-5 bg-zinc-50 border rounded-md w-full">
        <Heading variant="subheading">Details</Heading>
        <div className="mt-5 grid grid-cols-2 gap-5 w-full">
          <Select
            name="complaintType"
            color="default"
            label="Complaint Type"
            labelPlacement="outside"
            placeholder="Select Complaint Type"
            // selectedKeys={}
            // onSelectionChange={}
            radius="md"
            size="lg"
            variant="bordered"
          >
            {ComplaintTypeEnum.map((complaintType) => (
              <SelectItem key={complaintType} value={complaintType}>
                {complaintType}
              </SelectItem>
            ))}
          </Select>
          <Select
            name="actionBy"
            color="default"
            label="Action By"
            labelPlacement="outside"
            placeholder="Select Action By"
            // selectedKeys={}
            // onSelectionChange={}
            radius="md"
            size="lg"
            variant="bordered"
          >
            {ActionByEnum.map((actionBy) => (
              <SelectItem key={actionBy} value={actionBy}>
                {actionBy}
              </SelectItem>
            ))}
          </Select>
          {/* <Select
            name="actionTaken"
            color="default"
            label="Action Taken"
            labelPlacement="outside"
            placeholder="Select Action Taken"
            // selectedKeys={}
            // onSelectionChange={}
            radius="md"
            size="lg"
            variant="bordered"
          >
            {ActionTaken.map((actionTaken) => (
              <SelectItem key={actionTaken} value={actionTaken}>
                {actionTaken}
              </SelectItem>
            ))}
          </Select> */}
          <div className="col-span-3">
            <Textarea
              name="description"
              label="Complaint Description"
              labelPlacement="outside"
              placeholder="Enter Complaint Description"
              color="default"
              // isRequired={true}
              // value={}
              // onValueChange={}
              radius="md"
              size="lg"
              variant="bordered"
              disableAnimation
              disableAutosize
              classNames={{
                input: "resize-y min-h-[150px]",
              }}
            />
            <div className="flex justify-end items-center py-5">
              <Button className="px-7 active:scale-95">Add Complaint</Button>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default AddComplaints;
