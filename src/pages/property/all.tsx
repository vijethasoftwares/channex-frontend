import Container from "@/components/container";
import ContainerBetween from "@/components/container-between";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import Loader from "@/components/loader";
import PropertyCard from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { SERVER_URL } from "@/lib/utils";
import axios, { AxiosResponse } from "axios";
import React, { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";

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
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProperties();
  }, [pathname]);
  return (
    <Container>
      <ContainerColumn>
        <ContainerBetween>
          <Heading>Manage Properties</Heading>
          <Button className="active:scale-95 bg-purple-700">
            + Add Property
          </Button>
        </ContainerBetween>
        <Container className="space-y-5">
          <Heading variant="subheading">All Properties</Heading>
          {loading && <Loader />}
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
