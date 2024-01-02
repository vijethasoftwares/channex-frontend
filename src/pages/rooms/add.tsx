import Container from "@/components/container";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import { Input, Select, SelectItem, Textarea } from "@nextui-org/react";
import React, { FC } from "react";

type Props = {
  children?: React.ReactNode;
};

const SelectPropertyEnum = [
  "Property 1",
  "Property 2",
  "Property 3",
  "Property 4",
  "Property 5",
];

const RoomCategoryEnum = ["A/C", "Non A/C"];

const RoomTypeEnum = ["Single", "Double", "Triple", "Dormitory"];

const FacilitiesEnum = [
  "Swimming Pool",
  "Gym",
  "Sauna",
  "Playground",
  "Parking",
  "Wi-Fi",
  "Laundry",
];

const AddRoom: FC<Props> = () => {
  return (
    <Container>
      <ContainerColumn>
        <Heading>Add Room</Heading>
      </ContainerColumn>
      <div className="mt-5 p-5 bg-zinc-50 border rounded-md w-full">
        <Heading variant="subheading" className="">
          Details
        </Heading>
        <div className="mt-5 grid grid-cols-3 gap-5 w-full">
          <Input
            type="number"
            name="roomNumber"
            label="Room No"
            labelPlacement="outside"
            placeholder="Enter Room Number"
            color="default"
            isRequired={true}
            // value={}
            // onValueChange={}
            radius="md"
            size="lg"
            variant="bordered"
          />
          <Select
            name="selectProperty"
            color="default"
            label="Select Property"
            labelPlacement="outside"
            selectionMode="multiple"
            placeholder="Select Property"
            // selectedKeys={permissions}
            // onSelectionChange={setPermissions}
            radius="md"
            size="lg"
            variant="bordered"
          >
            {SelectPropertyEnum.map((property) => (
              <SelectItem key={property} value={property}>
                {property}
              </SelectItem>
            ))}
          </Select>
          <Select
            name="roomCategroy"
            color="default"
            label="Room Category"
            labelPlacement="outside"
            placeholder="Select Room Category"
            // selectedKeys={permissions}
            // onSelectionChange={setPermissions}
            radius="md"
            size="lg"
            variant="bordered"
          >
            {RoomCategoryEnum.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </Select>
          <Select
            name="roomType"
            color="default"
            label="Room Type"
            labelPlacement="outside"
            placeholder="Select Room Type"
            // selectedKeys={permissions}
            // onSelectionChange={setPermissions}
            radius="md"
            size="lg"
            variant="bordered"
          >
            {RoomTypeEnum.map((roomType) => (
              <SelectItem key={roomType} value={roomType}>
                {roomType}
              </SelectItem>
            ))}
          </Select>
          <Input
            type="number"
            name="roomSize"
            label="Room Size (per Sqft)"
            labelPlacement="outside"
            placeholder="Enter Room Size"
            color="default"
            isRequired={true}
            // value={}
            // onValueChange={}
            radius="md"
            size="lg"
            variant="bordered"
          />
          <Input
            type="number"
            name="maxOccupancy"
            label="Max Occupancy"
            labelPlacement="outside"
            placeholder="Enter Maximum Occupancy"
            color="default"
            isRequired={true}
            // value={}
            // onValueChange={}
            radius="md"
            size="lg"
            variant="bordered"
          />
          <Input
            type="number"
            name="roomPricePerMonth"
            label="Room Price (per month)"
            labelPlacement="outside"
            placeholder="₹000"
            color="default"
            isRequired={true}
            // value={}
            // onValueChange={}
            radius="md"
            size="lg"
            variant="bordered"
          />
          <Input
            type="number"
            name="roomPricePerDay"
            label="Room Price (per day)"
            labelPlacement="outside"
            placeholder="₹000"
            color="default"
            isRequired={true}
            // value={}
            // onValueChange={}
            radius="md"
            size="lg"
            variant="bordered"
          />
        </div>
      </div>
      <div className="mt-5 p-5 bg-zinc-50 border rounded-md w-full flex flex-col justify-start items-start gap-5">
        <Heading variant="subheading" className="">
          Images
        </Heading>
        <div className="grid grid-cols-4 gap-2.5 w-full">
          <div className="relative px-16 py-16 bg-zinc-100 rounded-md border-dashed border-2 w-full">
            <input
              type="file"
              name="images"
              multiple={true}
              required
              accept="image/*"
              // onChange={handleImageChange}
              className="w-full h-full absolute top-0 right-0 bottom-0 left-0 opacity-0 cursor-pointer z-10"
            />
            <span className="inset-0 absolute z-[1] text-sm text-zinc-600 flex justify-center items-center">
              + Room Image
            </span>
          </div>
          <div className="relative px-16 py-16 bg-zinc-100 rounded-md border-dashed border-2 w-full">
            <input
              type="file"
              name="images"
              multiple={true}
              required
              accept="image/*"
              // onChange={handleImageChange}
              className="w-full h-full absolute top-0 right-0 bottom-0 left-0 opacity-0 cursor-pointer z-10"
            />
            <span className="inset-0 absolute z-[1] text-sm text-zinc-600 flex justify-center items-center">
              + Washroom Image
            </span>
          </div>
          <div className="relative px-16 py-16 bg-zinc-100 rounded-md border-dashed border-2 w-full">
            <input
              type="file"
              name="images"
              multiple={true}
              required
              accept="image/*"
              // onChange={handleImageChange}
              className="w-full h-full absolute top-0 right-0 bottom-0 left-0 opacity-0 cursor-pointer z-10"
            />
            <span className="inset-0 absolute z-[1] text-sm text-zinc-600 flex justify-center items-center">
              + Bed Image
            </span>
          </div>
          <div className="relative px-16 py-16 aspect-square bg-zinc-100 rounded-md border-dashed border-2 w-full">
            <input
              type="file"
              name="images"
              multiple={true}
              required
              accept="image/*"
              // onChange={handleImageChange}
              className="w-full h-full absolute top-0 right-0 bottom-0 left-0 opacity-0 cursor-pointer z-10"
            />
            <span className="inset-0 absolute z-[1] text-sm text-zinc-600 flex justify-center items-center">
              Additional Images (upto five)
            </span>
          </div>
        </div>
      </div>
      <div className="mt-5 p-5 bg-zinc-50 border rounded-md w-full flex flex-col justify-start items-start gap-5">
        <Heading variant="subheading">Extra</Heading>
        <Select
          name="roomFacilities"
          color="default"
          label="Room Facilities"
          labelPlacement="outside"
          selectionMode="multiple"
          placeholder="Select Room Facilities"
          // selectedKeys={permissions}
          // onSelectionChange={setPermissions}
          radius="md"
          size="lg"
          variant="bordered"
        >
          {FacilitiesEnum.map((facility) => (
            <SelectItem key={facility} value={facility}>
              {facility}
            </SelectItem>
          ))}
        </Select>
        <Textarea
          name="description"
          label="Description"
          labelPlacement="outside"
          placeholder="Enter Room Description"
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
      </div>
    </Container>
  );
};

export default AddRoom;
