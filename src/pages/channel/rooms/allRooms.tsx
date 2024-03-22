import Container from "@/components/container";
import ContainerBetween from "@/components/container-between";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import { GlobalContextType } from "@/components/providers";
import { RoomProps } from "@/components/types/app";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useGlobalContext } from "@/lib/utils";
import { Badge, Card, CardBody, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Select, SelectItem, Spinner, Tab, Tabs } from "@nextui-org/react";
import axios from "axios";
import { ChevronDown, Loader2, MoreHorizontal, SidebarCloseIcon } from "lucide-react";
import React, { FC, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import AddRates from "./addRates";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
type Props = {
    children?: React.ReactNode;
};

const AllChannelRooms: FC<Props> = () => {
    const { user, selectedProperty, isPropertyLoading } =
        useGlobalContext() as GlobalContextType;
    const [open, setOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [rooms, setRooms] = useState<RoomProps[]>([]);
    const [filteredRooms, setFilteredRooms] = useState<RoomProps[]>();
    const abcd = useRef<HTMLButtonElement | null>(null)
    const navigate = useNavigate();

    const fetchRoomsByProperty = async (propertyId: string) => {
        try {
            setIsLoading(true);
            const res = await axios.get(
                `https://rofabs.onrender.com/api/channex/room_types`,
                {
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                }
            );
            const { data } = await res.data;
            console.log(data.map((r: any) => r.attributes), 'dataroomse')
            setRooms([...data.map((r: any) => r.attributes)]);
            setFilteredRooms([...data.map((r: any) => r.attributes)]);
            console.log(data);
            toast.success("Rooms fetched successfully");
        } catch (error) {
            console.error(error);
            toast.error("Error fetching rooms");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user && selectedProperty.length > 3) {
            fetchRoomsByProperty(selectedProperty);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, selectedProperty]);
    const openDrawer = () => {
        setOpen(true)
    }

    if (isPropertyLoading) {
        return (
            <div className="flex justify-center items-center px-5 py-10 w-full">
                <Spinner size="lg" />
            </div>
        );
    }
    const handleSubmit = () => {

    }

    return (
        <Container>
            <ContainerColumn>
                <ContainerBetween>
                    <Heading>All Rooms</Heading>
                    <Link to={"add"}>
                        <Button className="active:scale-95 bg-purple-700">
                            + Add Room
                        </Button>
                    </Link>
                </ContainerBetween>
                <Heading variant="subtitle">Search or select a room</Heading>
                {isLoading && (
                    <div className="flex justify-center items-center px-5 py-10 w-full">
                        <Loader2 className="w-10 h-10 animate-spin text-black" />
                    </div>
                )}
                <Card className="p-2">
                    <CardBody className="gap-3">
                        <Input
                            type="text"
                            placeholder="Search  room types"
                            radius="lg"
                            size="md"
                            variant="bordered"
                            classNames={{
                                input: "pl-2.5",
                            }}
                            onChange={() => console.log()}
                        />
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Number of Rooms</TableHead>
                                    <TableHead>Occupancy</TableHead>
                                    <TableHead>Property</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRooms?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8}>
                                            <Heading
                                                variant="subtitle"
                                                className="w-full flex justify-center py-5"
                                            >
                                                No bookings history found
                                            </Heading>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {filteredRooms &&
                                    filteredRooms.map((roomType: any) => {
                                        return (
                                            <TableRow key={roomType?.id}>
                                                <TableCell>{roomType?.title}</TableCell>
                                                <TableCell>
                                                    <Badge>{roomType?.count_of_rooms}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    A:{roomType?.occ_adults}{" "}
                                                    C:{roomType?.occ_children}{" "}
                                                    I:{roomType?.occ_infants}
                                                </TableCell>
                                                <TableCell>
                                                    yellow bells
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Sheet>
                                                        <SheetTrigger>Create Rate</SheetTrigger>
                                                        <SheetContent className="max-w-[80vw] w-[800px] min-w-[800px]">
                                                            <AddRates />
                                                            <SheetFooter>
                                                                <SheetClose asChild>
                                                                    <div className="w-full flex justify-end items-center gap-2.5 mt-5">
                                                                        <Button variant="ghost" className=" active:scale-95">
                                                                            Cancel
                                                                        </Button>
                                                                        <Button
                                                                            onClick={handleSubmit}
                                                                            // isLoading={submitting}
                                                                            className="bg-purple-700 text-white active:scale-95"
                                                                        >
                                                                            Create Rate
                                                                        </Button>
                                                                    </div>
                                                                </SheetClose>
                                                            </SheetFooter>
                                                        </SheetContent>
                                                    </Sheet>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>
            </ContainerColumn >
        </Container >
    );
};

export default AllChannelRooms;
