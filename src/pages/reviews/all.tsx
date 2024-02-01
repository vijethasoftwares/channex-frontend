import Container from "@/components/container";
import ContainerBetween from "@/components/container-between";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import { ReviewProps } from "@/components/types/app";
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
import { Star } from "lucide-react";
import React, { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";

type Props = {
  children?: React.ReactNode;
};

const AllComplaints: FC<Props> = () => {
  const { user } = useGlobalContext();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<ReviewProps[]>([]);
  const fetchReviews = async () => {
    try {
      const res = (await axios.get(SERVER_URL + "/owner/get-reviews", {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })) as AxiosResponse;
      const data = await res.data;
      setReviews(data.reviews);
    } catch (error) {
      toast.error((error as Error)?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (user?.userId) fetchReviews();
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
          <Heading>All Reviews</Heading>
          {/* <Button className="active:scale-95 bg-purple-700">
            + Add Compalint
          </Button> */}
        </ContainerBetween>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Property Name</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Review</TableCell>
              <TableCell>Review By</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}>
                  <Heading
                    variant="subtitle"
                    className="w-full flex justify-center py-5"
                  >
                    No Reviews Found
                  </Heading>
                </TableCell>
              </TableRow>
            )}
            {reviews &&
              reviews.map((review) => {
                return (
                  <TableRow key={review?._id?.toString()}>
                    <TableCell>{review?.propertyName}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500 py-2">
                        {review?.rating}{" "}
                        <Star size={14} className="fill-white" />
                      </Badge>
                    </TableCell>
                    <TableCell>{review?.review}</TableCell>
                    <TableCell>{review?.userName}</TableCell>
                    <TableCell>
                      {dayjs(review?.createdAt).format("DD MMM, YYYY")}
                    </TableCell>
                    <TableCell>
                      {/* <Button className="bg-purple-700">View</Button> */}
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
