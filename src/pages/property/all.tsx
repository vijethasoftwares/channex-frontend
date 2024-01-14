import Container from "@/components/container";
import ContainerBetween from "@/components/container-between";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import PropertyCard from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { SERVER_URL } from "@/lib/utils";
import { Spinner } from "@nextui-org/react";
import axios, { AxiosResponse } from "axios";
import React, { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation } from "react-router-dom";

type Props = {
  children?: React.ReactNode;
};

const AllProperties: FC<Props> = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const pathname = useLocation().pathname;

  const fetchProperties = async () => {
    try {
      const res = (await axios.get(
        SERVER_URL + "/owner/get-all-properties"
      )) as AxiosResponse;
      const data = res.data;
      const { properties } = data;
      setProperties(properties);
      console.log(data);
    } catch (error) {
      toast.error((error as Error)?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProperties();
  }, [pathname]);

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
          <Heading>Manage Properties</Heading>
          <Link to={"add"}>
            <Button className="active:scale-95 bg-purple-700">
              + Add Property
            </Button>
          </Link>
        </ContainerBetween>
        <Container className="space-y-5 p-0">
          <Heading variant="subheading">All Properties</Heading>
          {properties.length > 0 &&
            properties.map((property, i) => {
              return <PropertyCard key={i} data={property} />;
            })}
          {properties.length === 0 && !loading && (
            <Heading variant="caption">No properties found</Heading>
          )}
        </Container>
      </ContainerColumn>
    </Container>
  );
};

export default AllProperties;
