import Container from "@/components/container";
import ContainerBetween from "@/components/container-between";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import { ComplaintProps } from "@/components/types/app";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SERVER_URL, useGlobalContext } from "@/lib/utils";
import { Spinner } from "@nextui-org/react";
import axios, { AxiosResponse } from "axios";
import dayjs from "dayjs";
import React, { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";

type Props = {
  children?: React.ReactNode;
};

const AllComplaints: FC<Props> = () => {
  const { user } = useGlobalContext();
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<ComplaintProps[]>([]);
  const fetchComplaints = async () => {
    try {
      const res = (await axios.get(SERVER_URL + "/owner/get-complaints", {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })) as AxiosResponse;
      const data = await res.data;
      setComplaints(data.complaints);
    } catch (error) {
      toast.error((error as Error)?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (user?.userId) fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
          <Heading>All Complaints</Heading>
          {/* <Button className="active:scale-95 bg-purple-700">
            + Add Compalint
          </Button> */}
        </ContainerBetween>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Property Name</TableCell>
              <TableCell>Complaint Type</TableCell>
              <TableCell>Complaint Details</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Complaint By</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {complaints.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}>
                  <Heading
                    variant="subtitle"
                    className="w-full flex justify-center py-5"
                  >
                    No Complaints Found
                  </Heading>
                </TableCell>
              </TableRow>
            )}
            {complaints &&
              complaints.map((complaint) => {
                return (
                  <TableRow key={complaint?._id?.toString()}>
                    <TableCell>{complaint?.propertyName}</TableCell>
                    <TableCell>{complaint?.complaintType}</TableCell>
                    <TableCell>{complaint?.complaintDetails}</TableCell>
                    <TableCell>
                      {dayjs(complaint?.createdAt).format("DD/MM/YYYY")}
                    </TableCell>
                    <TableCell>{complaint?.userName}</TableCell>
                    <TableCell>
                      {complaint.isResolved ? (
                        <Badge color="success">Resolved</Badge>
                      ) : (
                        <Badge color="error">Pending</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </ContainerColumn>
    </Container>
  );
};

export default AllComplaints;
