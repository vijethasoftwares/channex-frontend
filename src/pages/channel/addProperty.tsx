import Container from "@/components/container";
import ContainerBetween from "@/components/container-between";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import MemoizedMapComponent from "@/components/map-component";
import { GlobalContextType } from "@/components/providers";
// import { PropertyProps } from "@/components/types/app";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import firebase_app from "@/lib/firebase";
import {
    FormDescription
} from "@/components/ui/form"
import {
    SERVER_URL,
    // convertImagesToBase64,
    useGlobalContext,
} from "@/lib/utils";
import {
    Checkbox,
    Input,
    Select,
    SelectItem,
    Selection
} from "@nextui-org/react";
import axios, { AxiosError, AxiosResponse } from "axios";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import React, { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
    Permissions,
    facilitiesEnum,
} from "./consts"

type Props = {
    children?: React.ReactNode;
};

type Permission = {
    key: string;
    value: string;
};

interface PropertyProps {
    title: string;
    type: string;
    currency: string;
    // location: string;
    address: string;
    longitude: number,
    latitude: number;
    city?: string;
    state?: string;
    country: string;
    nearbyPlaces?: string[];
    images: { label: string; url: string }[];
    manager?: {
        name: string;
        email: string;
        phoneNumber: string;
    };
    permissions?: string[];
    facilities?: string[];
    isParkingSpaceAvailable?: boolean | "true" | "false" | string;
    isCoupleFriendly?: boolean;
    foodMenu?: FoodMenuProps[];
    managerId?: string;
    document?: {
        propertyOwnStatus: string;
        documentType: string;
        documentNumber: string;
        pdfUrl: string;
    };
}

interface FoodMenuProps {
    day: string;
    meals: MealData[];
}

interface MealData {
    name: string;
    hasMealItems?: boolean;
    vegMealItems: string[];
    nonVegMealItems: string[];
}

interface PlacesData {
    name: string;
    types: string[];
    rating: number;
}

type UserProps = {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
    profilePicture: string;
};

const PropertyOwnStatus = ["Owned", "Rented", "Leased"];
const DocumentTypeOwned = [
    "Aadhar Card",
    "PAN Card",
    "Voter ID",
    "Driving License",
];
const DocumentTypeRentedOrLeased = ["NOC / Rent Agreement / Lease Agreement"];

const GOOGLE_API_KEY = import.meta.env.VITE_MAP_API_KEY as string;

const storage = getStorage(firebase_app);

const AddChannelProperty: FC<Props> = () => {
    const { user } = useGlobalContext() as GlobalContextType;
    const [location, setLocation] = useState<string>("");
    const [coordinate, setCoordinate] = useState({
        lat: 0,
        lng: 0,
    });
    const [, setLandmark] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");

    const [nearbyPlacesData, setNearbyPlacesData] = useState([]);
    const [nearbyPlaces, setNearbyPlaces] = useState<Selection>(new Set([]));
    const [fetchingNearbyPlaces, setFetchingNearbyPlaces] =
        useState<boolean>(false);
    const [name, setName] = useState<string>("");
    const [propertyType, setPropertyType] = useState<Selection>(
        new Set(['Hotel'])
    );
    const [coupleFriendly, setCoupleFriendly] = useState<boolean>(false);
    const [images, setImages] = useState<{ label: string; url: string }[]>([]);
    const [settings, setSettings] = useState<any>({
        minPrice: "",
        maxPrice: ""
    });
    const [permissions, setPermissions] = useState<Selection>(new Set([]));
    const [isParkingSpaceAvailable, setIsParkingSpaceAvailable] =
        useState<Selection>(new Set(["false"]));
    const [facilities, setFacilities] = useState<Selection>(new Set([]));
    /*
     ** loading state
     */
    const [fetchingLocation, setFetchingLocation] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);

    /*
     ** Manager States
     */
    const [allManagers, setAllManagers] = useState<UserProps[]>([]);
    const [managerId, setManagerId] = useState<Selection>(new Set([]));

    /*
     ** Food Menu States
     */
    //documents states
    const [documentPdfUrl, setDocumentPdfUrl] = useState<string>("");

    const navigate = useNavigate();

    const handleLocationInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLocation(event.target.value);
    };

    const fetchLocation = async () => {
        setFetchingLocation(true);
        try {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address: location }, (results, status) => {
                console.log(results, status, "results", "status");

                if (status === "OK") {
                    if (results) {
                        if (results[0].geometry.location) {
                            setCoordinate({
                                lat: results[0].geometry.location.lat(),
                                lng: results[0].geometry.location.lng(),
                            });
                        }
                        setLocation(results[0].formatted_address);
                        results[0].address_components.forEach((component) => {
                            switch (component.types[0]) {
                                case "locality": // city
                                    setCity(component.long_name);
                                    break;
                                case "administrative_area_level_1": // state
                                    setState(component.long_name);
                                    break;
                                case "point_of_interest": // landmark
                                case "establishment":
                                case "natural_feature":
                                    setLandmark(component.long_name);
                                    break;
                            }
                        });
                    }
                } else {
                    toast.error("Geocode was not successful for the following reason: ");
                }
            });
        } catch (error) {
            console.log(error);
            toast.error("An error occurred while fetching location");
        } finally {
            setFetchingLocation(false);
        }
    };

    const handleGetLiveLocation = () => {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            setCoordinate({ lat: latitude, lng: longitude });
            setFetchingLocation(true);
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
            );

            if (!response.ok) {
                toast.error(
                    `Geolocation API request failed with status ${response.status}`
                );
                setFetchingLocation(false);
                return;
            }

            const data = await response.json();
            if (data.results && data.results.length > 0) {
                setLocation(data.results[0].formatted_address);

                data.results[0].address_components.forEach(
                    (component: {
                        types: unknown[];
                        long_name: React.SetStateAction<string>;
                    }) => {
                        switch (component.types[0]) {
                            case "locality": // city
                                setCity(component.long_name);
                                break;
                            case "administrative_area_level_1": // state
                                setState(component.long_name);
                                break;
                            case "point_of_interest": // landmark
                            case "establishment":
                            case "natural_feature":
                                setLandmark(component.long_name);
                                break;
                        }
                    }
                );
            }
            setFetchingLocation(false);
        });
    };

    const handleGetNearbyPlaces = async () => {
        if (!coordinate || !coordinate.lat || !coordinate.lng) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                setCoordinate({ lat: latitude, lng: longitude });
            });
            return;
        }
        setFetchingNearbyPlaces(true);
        try {
            const response = await axios.get(
                `${SERVER_URL}/map/nearby-places?lat=${coordinate.lat}&lng=${coordinate.lng}`
            );

            const data = await response.data;
            console.log(data);
            const slicedData = data.results.slice(0, 5);
            const np = slicedData.map((place: PlacesData) => {
                return `${place.name} - Type: ${place.types[0].split("_").join(" ") || "NA"
                    } - Rating: ${place.rating || "NA"}`;
            });
            setNearbyPlacesData(np);
            setNearbyPlaces(new Set(np));
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while fetching nearby places");
        } finally {
            setFetchingNearbyPlaces(false);
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length + images.length <= 5) {
            const imagesLinks = await uploadImagesToFirebase(
                Array.from(e.target.files) as File[]
            );
            setImages([...images, ...imagesLinks]);
            // setImages([...images, ...Array.from(e.target.files)]);
        } else {
            toast.error("You can only upload 5 images");
        }
    };

    const handleImageDelete = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const handleSubmit: () => Promise<void> = async () => {
        // const img = await convertImagesToBase64(images);
        setSubmitting(true);
        const mId = Array.from(managerId).toString();
        if (!mId) {
            toast.error("Please add a manager first");
            setSubmitting(false);
            return;
        }
        if (!coordinate.lat || !coordinate.lng) {
            toast.error("Please provide a valid location");
            setSubmitting(false);
            return;
        }
        if (documentPdfUrl.length == 0) {
            toast.error("Please upload the document pdf");
            setSubmitting(false);
            return;
        }
        // console.log(coordinate);
        // const imagesLinks = await uploadImagesToFirebase(images);
        const property: any = {
            title: name,
            type: Array.from(propertyType).toString(),
            currency: "INR",
            longitude: coordinate.lng,
            latitude: coordinate.lat,
            property_type: "Hotel",
            zip_code: "561210",
            address: location,
            state: state,
            country: "IN",
            city: city,
            content: {
                "description": "Some Property Description Text",
                photos: [{
                    url: "https://firebasestorage.googleapis.com/v0/b/rofabs-4a4de.appspot.com/o/property%2F1709089260932-img1.jpg?alt=media&token=7de22a32-34c5-47ec-a285-76fafa6285a8",
                    "position": 1,
                    "author": "Author Name",
                    "kind": "photo",
                    "description": "Room Vier"
                }, {
                    url: images[1].url,
                    "position": 2,
                    "author": "Author Name",
                    "kind": "photo",
                    "description": "Room View"
                }
                ],
                "important_information": "Some important notes about property"
            }
        };
        console.log(property);

        try {
            const res: AxiosResponse = await axios.post(
                "https://rofabs.onrender.com/api/channex/property",
                {
                    "property": {
                        ...property
                    }
                }
            );
            const data = await res.data;
            console.log(data, "da");
            toast.success(data.message || "Property added successfully");
            navigate("/property");
        } catch (error) {
            const err = error as AxiosError & { response: AxiosResponse };
            console.log(err.response);
            toast.error(err.response.data?.message || "An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    const uploadImagesToFirebase = async (images: File[]) => {
        const imageUrls = [];

        const t = toast.loading("Uploading images...");
        try {
            for (const image of images) {
                const imageRef = ref(storage, `property/${Date.now()}-${image.name}`);
                await uploadBytes(imageRef, image);
                const imageUrl = await getDownloadURL(imageRef);
                imageUrls.push({
                    label: image.name,
                    url: imageUrl,
                });
            }
            toast.success("Images uploaded successfully");
            return imageUrls;
        } catch (error) {
            const err = error as Error & { message: string };
            console.error("Error uploading images:", error);
            toast.error(err?.message || "An error occurred while uploading images");
            return [];
        } finally {
            toast.dismiss(t);
        }
    };

    useEffect(() => {
        if (user?.token) {
            (async () => {
                try {
                    const res = await axios.get(SERVER_URL + "/owner/managers/me", {
                        headers: {
                            Authorization: "Bearer " + user.token,
                        },
                    });
                    const data = await res.data;
                    setAllManagers(data.managers);
                } catch (error) {
                    console.error(error);
                }
            })();
        } else {
            toast.error("Login first to add property");
        }
    }, [user]);

    const handleChange = (e: any) => {
        setSettings({ ...settings, [e.target.name]: e.target.value })
    }

    return (
        <>
            <Container>
                <ContainerColumn>
                    <Heading>Add Property</Heading>
                    <div className="p-5 bg-zinc-50 border rounded-md w-full">
                        <Heading variant="subheading">Details</Heading>
                        <div className="mt-5 grid grid-cols-3 gap-5 w-full">
                            <Input
                                type="text"
                                name="name"
                                label="Property Name"
                                labelPlacement="outside"
                                placeholder="Enter property name"
                                color="default"
                                isRequired={true}
                                value={name}
                                onValueChange={setName}
                                radius="md"
                                size="lg"
                                variant="bordered"
                            />
                            <Select
                                name=""
                                color="default"
                                label="Property Type"
                                labelPlacement="outside"
                                placeholder="Select property type"
                                selectedKeys={propertyType}
                                onSelectionChange={setPropertyType}
                                isDisabled={true}
                                radius="md"
                                size="lg"
                                variant="bordered"
                            >
                                {['Hotel'].map((type: any) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </Select>
                            <Select
                                name=""
                                color="default"
                                label="Permissions"
                                labelPlacement="outside"
                                selectionMode="multiple"
                                placeholder="Select permissions"
                                selectedKeys={permissions}
                                onSelectionChange={setPermissions}
                                radius="md"
                                size="lg"
                                variant="bordered"
                            >
                                {Permissions.map((permission: Permission) => (
                                    <SelectItem key={permission.value} value={permission.value}>
                                        {permission.value}
                                    </SelectItem>
                                ))}
                            </Select>
                            <Select
                                name="is_parking_space_available"
                                label="Is Parking Space Available"
                                labelPlacement="outside"
                                placeholder="Select an option"
                                color="default"
                                radius="md"
                                size="lg"
                                variant="bordered"
                                selectedKeys={isParkingSpaceAvailable}
                                onSelectionChange={setIsParkingSpaceAvailable}
                            >
                                <SelectItem key={"true"} value="true">
                                    Yes
                                </SelectItem>
                                <SelectItem key={"false"} value="false">
                                    No
                                </SelectItem>
                            </Select>
                            <div className="relative flex flex-col items-center *:w-full">
                                <Input
                                    type="text"
                                    name="location"
                                    label="Location"
                                    labelPlacement="outside"
                                    placeholder="Enter location"
                                    className="relative"
                                    color="default"
                                    isRequired={true}
                                    radius="md"
                                    size="lg"
                                    variant="bordered"
                                    value={location}
                                    onChange={handleLocationInput}
                                    endContent={
                                        fetchingLocation ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <span
                                                className="text-xs h-auto bg-white hover:bg-zinc-50 -mr-1 cursor-pointer px-3 py-2 rounded-md border border-gray-300 text-nowrap font-medium"
                                                onClick={handleGetLiveLocation}
                                            >
                                                live location
                                            </span>
                                        )
                                    }
                                />
                                <div className="absolute -top-2 right-0 flex justify-end items-center">
                                    <Badge
                                        onClick={fetchLocation}
                                        variant="default"
                                        className="mr-1 py-1 cursor-pointer"
                                    >
                                        fetch location
                                    </Badge>
                                </div>
                            </div>
                            <Input
                                type="text"
                                name="city"
                                label="City"
                                labelPlacement="outside"
                                placeholder="Enter city"
                                color="default"
                                radius="md"
                                size="lg"
                                variant="bordered"
                                value={city}
                                onValueChange={setCity}
                            />
                            <Input
                                type="text"
                                name="state"
                                label="State"
                                labelPlacement="outside"
                                placeholder="Enter state"
                                color="default"
                                radius="md"
                                size="lg"
                                variant="bordered"
                                value={state}
                                onValueChange={setState}
                            />
                            <Select
                                label="Nearby Places"
                                labelPlacement="outside"
                                placeholder="Select an option"
                                color="default"
                                radius="md"
                                size="lg"
                                variant="bordered"
                                selectionMode="multiple"
                                selectedKeys={nearbyPlaces}
                                onSelectionChange={setNearbyPlaces}
                                endContent={
                                    fetchingNearbyPlaces ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <span
                                            className="text-xs h-auto bg-white hover:bg-zinc-50 -mr-1 cursor-pointer px-3 py-2 rounded-md border border-gray-300 text-nowrap font-medium"
                                            onClick={handleGetNearbyPlaces}
                                        >
                                            Get Nearby Places
                                        </span>
                                    )
                                }
                            >
                                {nearbyPlacesData &&
                                    nearbyPlacesData.map((place) => (
                                        <SelectItem key={place} value={place}>
                                            {place}
                                        </SelectItem>
                                    ))}
                            </Select>
                            <Select
                                label="Facilities"
                                labelPlacement="outside"
                                placeholder="Select an option"
                                color="default"
                                radius="md"
                                size="lg"
                                variant="bordered"
                                selectionMode="multiple"
                                selectedKeys={facilities}
                                onSelectionChange={setFacilities}
                            >
                                {facilitiesEnum.map((facility: any) => (
                                    <SelectItem key={facility} value={facility}>
                                        {facility}
                                    </SelectItem>
                                ))}
                            </Select>
                            <Input
                                type="text"
                                name="zipCode"
                                label="Zip Code"
                                labelPlacement="outside"
                                placeholder="Enter zipcode"
                                color="default"
                                radius="md"
                                size="lg"
                                variant="bordered"
                                value={state}
                                onValueChange={setState}
                            />
                            <Input
                                type="text"
                                name="address"
                                label="Address"
                                labelPlacement="outside"
                                placeholder="Enter address"
                                color="default"
                                radius="md"
                                size="lg"
                                variant="bordered"
                                value={state}
                                onValueChange={setState}
                            />
                            <div className="flex items-end justify-start w-full">
                                <Checkbox
                                    isSelected={coupleFriendly}
                                    onValueChange={setCoupleFriendly}
                                >
                                    Couple Friendly
                                </Checkbox>
                            </div>
                        </div>
                    </div>
                    <div className="p-5 bg-zinc-50 border rounded-md w-full">
                        <Heading variant="subheading">Settings</Heading>
                        <div className="mt-5 grid grid-cols-3 gap-5 w-full">
                            <Input
                                type="text"
                                name="name"
                                label="Min Price"
                                labelPlacement="outside"
                                placeholder="Enter property name"
                                color="default"
                                isRequired={true}
                                value={settings?.minPrice}
                                onValueChange={handleChange}
                                radius="md"
                                size="lg"
                                variant="bordered"
                            />
                            <Input
                                type="text"
                                name="state"
                                label="Max Price"
                                labelPlacement="outside"
                                placeholder="Enter state"
                                color="default"
                                radius="md"
                                size="lg"
                                variant="bordered"
                                value={settings?.maxPrice}
                                onValueChange={handleChange}
                            />
                        </div>
                        <Heading className="text-sm font-thin mt-5 ">Automatic Availability Update Settings</Heading>
                        <Heading className="text-sm font-thin mt-5 ">Here you will decide what should happen when a New, Modified or Cancelled booking happens. If the availability will change automatically or the PMS will control these changes</Heading>
                        <div className="mt-3 grid grid-cols-3 gap-5 w-full">
                            <div>
                                <Select
                                    name="is_parking_space_available"
                                    label="New Booking"
                                    labelPlacement="outside"
                                    placeholder="If selected, for any new bookings created the availability will be negatively adjusted"
                                    color="default"
                                    radius="md"
                                    size="lg"
                                    variant="bordered"
                                    selectedKeys={isParkingSpaceAvailable}
                                    onSelectionChange={setIsParkingSpaceAvailable}
                                >
                                    <SelectItem key={"true"} value="true">
                                        Yes
                                    </SelectItem>
                                    <SelectItem key={"false"} value="false">
                                        No
                                    </SelectItem>
                                </Select>
                                <p className="mt-1 text-xs text-slate-400 font-thin text-muted-foreground">
                                    If selected, for any new bookings created the availability will be negatively adjusted</p>
                            </div>
                            <div><Select
                                name="is_parking_space_available"
                                label="Cancelled Booking"
                                labelPlacement="outside"
                                placeholder="Select an option"
                                color="default"
                                radius="md"
                                size="lg"
                                variant="bordered"
                                selectedKeys={isParkingSpaceAvailable}
                                onSelectionChange={setIsParkingSpaceAvailable}
                            >
                                <SelectItem key={"true"} value="true">
                                    Yes
                                </SelectItem>
                                <SelectItem key={"false"} value="false">
                                    No
                                </SelectItem>
                            </Select>
                                <p className="mt-1 text-xs text-slate-400 font-thin text-muted-foreground">
                                    If selected, for any modified bookings created the availability will be automatically adjusted</p></div>
                            <div className="relative flex flex-col items-center *:w-full">
                                <Select
                                    name="is_parking_space_available"
                                    label="Modified Booking"
                                    labelPlacement="outside"
                                    placeholder="

                                    If selected, for any modified bookings created the availability will be automatically adjusted"
                                    color="default"
                                    radius="md"
                                    size="lg"
                                    variant="bordered"
                                    selectedKeys={isParkingSpaceAvailable}
                                    onSelectionChange={setIsParkingSpaceAvailable}
                                >
                                    <SelectItem key={"true"} value="true">
                                        Yes
                                    </SelectItem>
                                    <SelectItem key={"false"} value="false">
                                        No
                                    </SelectItem>
                                </Select>
                                <p className="mt-1 text-xs text-slate-400 font-thin text-muted-foreground">
                                    If selected, for any cancelled bookings the availability will be positively adjusted</p>
                            </div>
                            <div>
                                <Input
                                    type="text"
                                    name="city"
                                    label="Inventory Days"
                                    labelPlacement="outside"
                                    placeholder="Set the length of the inventory table in number of days. Min: 100, Max: 730"
                                    color="default"
                                    radius="md"
                                    size="lg"
                                    variant="bordered"
                                    value={city}
                                    onValueChange={setCity}
                                />
                                <p className="mt-1 text-xs text-slate-400 font-thin text-muted-foreground">
                                    Set the length of the inventory table in number of days. Min: 100, Max: 730</p>
                            </div>
                            <Input
                                type="text"
                                name="state"
                                label="Minimum Stay Settings"
                                labelPlacement="outside"
                                placeholder="Enter state"
                                color="default"
                                radius="md"
                                size="lg"
                                variant="bordered"
                                value={state}
                                onValueChange={setState}
                            />
                            <Input
                                type="text"
                                name="zipCode"
                                label="Cut off time"
                                labelPlacement="outside"
                                placeholder="Enter zipcode"
                                color="default"
                                radius="md"
                                size="lg"
                                variant="bordered"
                                value={state}
                                onValueChange={setState}
                            />
                            <Input
                                type="text"
                                name="address"
                                label="Cut Off Days"
                                labelPlacement="outside"
                                placeholder="Enter address"
                                color="default"
                                radius="md"
                                size="lg"
                                variant="bordered"
                                value={state}
                                onValueChange={setState}
                            />
                        </div>
                    </div>
                    <div className="w-full grid lg:grid-cols-2 gap-2.5">
                        <div className="p-5 bg-zinc-50 border rounded-md w-full flex flex-col justify-start items-start gap-5">
                            <Heading variant="subheading">Images</Heading>
                            <div className="relative px-16 py-7 bg-zinc-100 rounded-md border-dashed border-2 w-full">
                                <input
                                    type="file"
                                    name="images"
                                    multiple={true}
                                    required
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full h-full absolute top-0 right-0 bottom-0 left-0 opacity-0 cursor-pointer z-10"
                                />
                                <span className="inset-0 absolute z-[1] text-sm text-zinc-600 flex justify-center items-center">
                                    + Add Images
                                </span>
                            </div>
                            <motion.div
                                layout="size"
                                transition={{
                                    duration: 0.5,
                                    ease: [0.87, 0, 0.13, 1],
                                }}
                                className="relative w-full grid grid-cols-5 gap-3"
                            >
                                <AnimatePresence>
                                    {images.map((image, index) => (
                                        <AnimatePresence key={image.label}>
                                            <motion.div
                                                layout
                                                initial={{
                                                    opacity: 0,
                                                    scale: 0.5,
                                                    x: 100,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    scale: 1,
                                                    x: 0,
                                                }}
                                                transition={{
                                                    duration: 0.5,
                                                    ease: [0.87, 0, 0.13, 1],
                                                    delay: index * 0.1,
                                                }}
                                                className="relative p-2.5 rounded-md bg-zinc-100 border-2 border-dashed origin-right"
                                            >
                                                <img
                                                    key={index}
                                                    src={image.url}
                                                    alt={`Uploaded ${index}`}
                                                    className="min-h-20 w-full object-cover h-full rounded-md"
                                                />
                                                <div
                                                    className="absolute top-1 right-1 cursor-pointer p-1 bg-white border rounded-3xl z-10"
                                                    onClick={() => handleImageDelete(index)}
                                                >
                                                    <X size={20} className="text-black" />
                                                </div>
                                            </motion.div>
                                        </AnimatePresence>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        </div>
                        <div className="w-full min-w-0 border rounded-md">
                            <MemoizedMapComponent
                                containerStyle={{
                                    height: "275px",
                                    width: "100%",
                                    borderRadius: "0.375rem",
                                }}
                                coordinate={coordinate}
                            // coordinates={location}
                            />
                        </div>
                    </div>
                    <div className="w-full flex justify-end items-center gap-2.5 mt-5">
                        <Button variant="ghost" className=" active:scale-95">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            isLoading={submitting}
                            className="bg-purple-700 active:scale-95"
                        >
                            Add Property
                        </Button>
                    </div>
                </ContainerColumn>
            </Container>
        </>
    );
};
export default AddChannelProperty;
