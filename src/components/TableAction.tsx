import { SERVER_URL, useGlobalContext } from "@/lib/utils";
import axios from "axios";
import { Edit, Trash } from "lucide-react";
import React, { FC, useState } from "react";
import toast from "react-hot-toast";
import { createSearchParams, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { TableCell } from "./ui/table";

interface TableActionItemProps {
  data: DataProps;
  fetchFucntion: () => void;
  apiUrl: string;
  editUrl?: string;
  viewUrl?: string;
  isViewVisible?: boolean;
  isEditVisible?: boolean;
}

interface DataProps {
  id: number;
}

export const TableActionItem: FC<TableActionItemProps> = ({
  data,
  fetchFucntion,
  apiUrl,
  editUrl,
  viewUrl,
  isViewVisible = false,
  isEditVisible = false,
}) => {
  const { user } = useGlobalContext();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const navigate = useNavigate();

  const deleteTableItem = async () => {
    setIsDeleting(true);
    return await axios
      .delete(`${SERVER_URL}${apiUrl}${data.id}/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `token ${user.token}`,
        },
      })
      .then(() => {
        fetchFucntion();
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  const handleNavigate = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    if (data) {
      navigate({
        pathname: editUrl,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        search: createSearchParams(data as any).toString(),
      });
    }
  };

  const handleView = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    navigate({
      pathname: viewUrl,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      search: createSearchParams(data).toString(),
    });
  };

  const handleDelete = () => {
    if (user && user.token) {
      toast.promise(deleteTableItem(), {
        loading: "Deleting...",
        success: "Deleted successfully",
        error: "Something went wrong",
      });
    }
  };

  return (
    <TableCell className="flex justify-end gap-2.5">
      {isViewVisible && viewUrl && (
        <Button className="rounded-3xl h-auto" onClick={handleView}>
          view
        </Button>
      )}
      {isEditVisible && editUrl && (
        <Button className="rounded-3xl h-auto" onClick={handleNavigate}>
          <Edit className="w-3.5 h-3.5" />
        </Button>
      )}
      <Button
        isLoading={isDeleting}
        variant="outline"
        className="rounded-3xl h-auto relative"
        onClick={handleDelete}
      >
        <Trash className="w-3.5 h-3.5" /> Delete
      </Button>
    </TableCell>
  );
};
