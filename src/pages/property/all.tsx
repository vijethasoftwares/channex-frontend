import Container from "@/components/container";
import ContainerBetween from "@/components/container-between";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import PropertyCard from "@/components/property-card";
import { GlobalContextType } from "@/components/providers";
import { PropertyProps } from "@/components/types/app";
import { Button } from "@/components/ui/button";
import { SERVER_URL, useGlobalContext } from "@/lib/utils";
import { Input, Spinner } from "@nextui-org/react";
import axios, { AxiosResponse } from "axios";
import React, { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

type Props = {
  children?: React.ReactNode;
};

const AllProperties: FC<Props> = () => {
  const { user } = useGlobalContext() as GlobalContextType;
  const [properties, setProperties] = useState<PropertyProps[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<PropertyProps[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    try {
      const res = (await axios.get(SERVER_URL + "/owner/get-all-properties", {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })) as AxiosResponse;
      const data = res.data;
      const { properties } = data;
      setProperties(properties);
      setFilteredProperties(properties);
      console.log(data);
    } catch (error) {
      toast.error((error as Error)?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (user?.userId) fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const value = e.target.value;
    const filtered = properties.filter((property) => {
      return property.name.toLowerCase().includes(value.toLowerCase());
    });
    setFilteredProperties(filtered);
  };

  if (loading) {
    return (
      <div className="px-5 py-10 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Container>
      <ContainerColumn>
        <ContainerBetween>
          <Heading>All Properties</Heading>
          <Link to={"add"}>
            <Button className="active:scale-95 bg-purple-700">
              + Add Property
            </Button>
          </Link>
        </ContainerBetween>
        <Container className="space-y-5 p-0">
          <Heading variant="subtitle">
            Search or select a property to view bookings
          </Heading>
          <Input
            type="text"
            onChange={handleSearch}
            // variant="bordered"
            placeholder="Search properties"
            classNames={{
              inputWrapper: "rounded-xl border shadow-none pl-5",
              base: "font-medium text-black",
            }}
          />

          {filteredProperties.length > 0 &&
            filteredProperties.map((property, i) => {
              return (
                <PropertyCard
                  fetchData={fetchProperties}
                  key={i}
                  data={property}
                />
              );
            })}
          {filteredProperties.length === 0 && !loading && (
            <Heading variant="caption">No properties found</Heading>
          )}
        </Container>
      </ContainerColumn>
    </Container>
  );
};

export default AllProperties;
