import Container from "@/components/container";
import ContainerBetween from "@/components/container-between";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardBody, Input, Tab, Tabs } from "@nextui-org/react";
import React, { FC, useState } from "react";

type Props = {
  chidlren?: React.ReactNode;
};

const BookingTabsEnum = Object.freeze({
  UPCOMING: "Upcoming Bookings",
  CURRENT: "Current Bookings",
  HISTROY: "Booking History",
});

const AllBooking: FC<Props> = () => {
  const [selected, setSelected] = useState<number | string>(
    BookingTabsEnum.CURRENT.replace(" ", "-").toLowerCase()
  );
  return (
    <Container>
      <ContainerColumn>
        <ContainerBetween>
          <Heading>All Booking</Heading>
          <Button className="active:scale-95 bg-purple-700">
            + add booking
          </Button>
        </ContainerBetween>
      </ContainerColumn>
      <div className="mt-5 w-full flex flex-col">
        <Tabs
          fullWidth
          radius="lg"
          size="lg"
          aria-label={"Options"}
          selectedKey={selected}
          onSelectionChange={setSelected}
          classNames={{
            tab: "py-5",
          }}
        >
          <Tab
            key={BookingTabsEnum.CURRENT.replace(" ", "-").toLowerCase()}
            title={BookingTabsEnum.CURRENT}
          >
            <Card className="p-2">
              <CardBody className="gap-3">
                <Input
                  type="text"
                  placeholder="Search current bookings"
                  radius="lg"
                  size="lg"
                  variant="bordered"
                  classNames={{
                    input: "pl-2.5",
                  }}
                />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">User ID</TableHead>
                      <TableHead>Room Type</TableHead>
                      <TableHead>Pax</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>32421</TableCell>
                      <TableCell>Single Room</TableCell>
                      <TableCell>3</TableCell>
                      <TableCell className="text-right">$ 200</TableCell>
                      <TableCell className="text-right">
                        <Badge>Active</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant={"secondary"}>Delete</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>32421</TableCell>
                      <TableCell>Single Room</TableCell>
                      <TableCell>3</TableCell>
                      <TableCell className="text-right">$ 200</TableCell>
                      <TableCell className="text-right">
                        <Badge>Active</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant={"secondary"}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </Tab>
          <Tab
            key={BookingTabsEnum.UPCOMING.replace(" ", "-").toLowerCase()}
            title={BookingTabsEnum.UPCOMING}
          >
            <Card className="p-2">
              <CardBody className="gap-3">
                <Input
                  type="text"
                  placeholder="Search upcoming bookings"
                  radius="lg"
                  size="lg"
                  variant="bordered"
                  classNames={{
                    input: "pl-2.5",
                  }}
                />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">User ID</TableHead>
                      <TableHead>Room Type</TableHead>
                      <TableHead>Pax</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>32421</TableCell>
                      <TableCell>Single Room</TableCell>
                      <TableCell>3</TableCell>
                      <TableCell className="text-right">$ 200</TableCell>
                      <TableCell className="text-right">
                        <Badge>Active</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant={"secondary"}>Delete</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>32421</TableCell>
                      <TableCell>Single Room</TableCell>
                      <TableCell>3</TableCell>
                      <TableCell className="text-right">$ 200</TableCell>
                      <TableCell className="text-right">
                        <Badge>Active</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant={"secondary"}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </Tab>
          <Tab
            key={BookingTabsEnum.HISTROY.replace(" ", "-").toLowerCase()}
            title={BookingTabsEnum.HISTROY}
          >
            <Card className="p-2">
              <CardBody className="gap-3">
                <Input
                  type="text"
                  placeholder="Search booking history"
                  radius="lg"
                  size="lg"
                  variant="bordered"
                  classNames={{
                    input: "pl-2.5",
                  }}
                />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">User ID</TableHead>
                      <TableHead>Room Type</TableHead>
                      <TableHead>Pax</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>32421</TableCell>
                      <TableCell>Single Room</TableCell>
                      <TableCell>3</TableCell>
                      <TableCell className="text-right">$ 200</TableCell>
                      <TableCell className="text-right">
                        <Badge>Active</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant={"secondary"}>Delete</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>32421</TableCell>
                      <TableCell>Single Room</TableCell>
                      <TableCell>3</TableCell>
                      <TableCell className="text-right">$ 200</TableCell>
                      <TableCell className="text-right">
                        <Badge>Active</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant={"secondary"}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>
    </Container>
  );
};

export default AllBooking;
