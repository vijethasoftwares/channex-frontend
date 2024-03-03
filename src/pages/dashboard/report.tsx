import Container from "@/components/container";
import ContainerBetween from "@/components/container-between";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import { BookingProps } from "@/components/types/app";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SERVER_URL, useGlobalContext } from "@/lib/utils";
import { Select, SelectItem } from "@nextui-org/react";
import axios from "axios";
import dayjs from "dayjs";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Loader2 } from "lucide-react";
import React, { FC, useEffect, useState } from "react";

type Props = {
  children?: React.ReactNode;
};

interface ReportInterval {
  key: string;
  label: string;
}

const reportIntervals: ReportInterval[] = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
];

const Report: FC<Props> = () => {
  const { user, selectedProperty } = useGlobalContext();

  const [report, setReport] = useState<BookingProps[]>([]);
  const [isReportLoading, setIsReportLoading] = useState<boolean>(false);
  const [selectedReportInterval, setSelectedReportInterval] = useState<string>(
    reportIntervals[0].key
  );

  const fetchReport = async () => {
    setIsReportLoading(true);
    try {
      const res = await axios.get(
        SERVER_URL +
          `/owner/get-property-report/${selectedReportInterval}/${selectedProperty}`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      const data = await res.data;
      setReport(data.report);
    } catch (error) {
      console.error(error);
    } finally {
      setIsReportLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!report) return;

    const doc = new jsPDF();
    const tableHeaders = [
      [
        "Folio ID",
        "Guest Name",
        "Guest Email",
        "Total Guests",
        "Check In Date",
        "Check Out Date",
        "Room No",
        "Payment Amount",
        "Payment Type",
      ],
    ];
    const tableData = report.map((r) => {
      const primaryGuest = r?.checkedIn?.filter((g) => g.isPrimary)[0];
      return [
        r?.folioId,
        r?.guestName,
        r?.guestEmail,
        r?.numberOfGuests,
        dayjs(r?.from).format("D MMMM YYYY - h:mm a"),
        dayjs(r?.to).format("D MMMM YYYY - h:mm a"),
        primaryGuest?.roomNumber,
        r?.paymentAmount,
        r?.paymentMethod,
      ];
    });
    autoTable(doc, {
      head: tableHeaders,
      /* eslint-disable @typescript-eslint/no-explicit-any */
      body: tableData as any,
      margin: { horizontal: 5, vertical: 5 },
      headStyles: { overflow: "linebreak" },
      styles: { halign: "left", fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      theme: "grid",
    });
    doc.save("report_" + dayjs().format("DD-MM-YYYY") + ".pdf");
  };

  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Report");

    worksheet.columns = [
      {
        header: "Folio ID",
        key: "folioId",
        width: 15,
        style: { alignment: { horizontal: "left" } },
      },
      {
        header: "Guest Name",
        key: "guestName",
        width: 20,

        style: { alignment: { horizontal: "left" } },
      },
      {
        header: "Guest Email",
        key: "guestEmail",
        width: 20,
        style: { alignment: { horizontal: "left" } },
      },
      {
        header: "Total Guests",
        key: "totalGuests",
        width: 15,
        style: { alignment: { horizontal: "left" } },
      },
      {
        header: "Check In Date",
        key: "checkInDate",
        width: 30,
        style: { alignment: { horizontal: "left" } },
      },
      {
        header: "Check Out Date",
        key: "checkOutDate",
        width: 30,
        style: { alignment: { horizontal: "left" } },
      },
      {
        header: "Room No",
        key: "roomNo",
        width: 10,
        style: { alignment: { horizontal: "left" } },
      },
      {
        header: "Payment Amount",
        key: "paymentAmount",
        width: 15,
        style: { alignment: { horizontal: "left" } },
      },
      {
        header: "Payment Type",
        key: "paymentType",
        width: 15,
        style: { alignment: { horizontal: "left" } },
      },
    ];

    report.forEach((r) => {
      const primaryGuest = r?.checkedIn?.filter((g) => g.isPrimary)[0];

      worksheet.addRow({
        folioId: r?.folioId,
        guestName: r?.guestName,
        guestEmail: r?.guestEmail,
        totalGuests: r?.numberOfGuests,
        checkInDate: dayjs(r?.from).format("D MMMM YYYY - h:mm a"),
        checkOutDate: dayjs(r?.to).format("D MMMM YYYY - h:mm a"),
        roomNo: primaryGuest?.roomNumber,
        paymentAmount: r?.paymentAmount,
        paymentType: r?.paymentMethod,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Report_" + dayjs().format("DD-MM-YYYY") + ".xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (user && selectedProperty && selectedReportInterval) {
      fetchReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedProperty, selectedReportInterval]);

  return (
    <Container>
      <ContainerColumn>
        <ContainerBetween>
          <div className="flex flex-col justify-start items-start gap-2.5">
            <Heading>Report</Heading>
            <div className="flex gap-2.5">
              <Button
                onClick={downloadPDF}
                className="py-2 h-auto text-xs rounded-xl"
              >
                Download PDF
              </Button>
              <Button
                onClick={downloadExcel}
                className="py-2 h-auto text-xs rounded-xl"
              >
                Download CSV
              </Button>
            </div>
          </div>
          <div className="flex justify-end flex-1 items-end gap-5">
            <Select
              items={reportIntervals.map((interval) => ({
                value: interval.key,
                label: interval.label,
              }))}
              label={"Get last " + selectedReportInterval + " report"}
              labelPlacement="outside"
              placeholder="Select Property"
              variant="bordered"
              selectedKeys={[selectedReportInterval]}
              onChange={(e) => setSelectedReportInterval(e.target.value)}
              className="max-w-[15rem]"
            >
              {(interval) => (
                <SelectItem key={interval.value}>{interval.label}</SelectItem>
              )}
            </Select>
          </div>
        </ContainerBetween>
        {isReportLoading && (
          <div className="px-5 py-10 flex justify-center items-center">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
        )}
        {!isReportLoading && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Guest Name</TableHead>
                <TableHead>Guest Email</TableHead>
                <TableHead>Total Guests</TableHead>
                <TableHead>Check In Date</TableHead>
                <TableHead>Check Out Date</TableHead>
                <TableHead>Room No</TableHead>
                <TableHead>Payment Amount</TableHead>
                <TableHead>Payment Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report && report.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No report available
                  </TableCell>
                </TableRow>
              )}
              {report &&
                report.map((r, index) => {
                  const primaryGuest = r?.checkedIn?.filter(
                    (g) => g.isPrimary
                  )[0];
                  return (
                    <TableRow key={index}>
                      <TableCell>{r?.folioId}</TableCell>
                      <TableCell>{r?.guestName}</TableCell>
                      <TableCell>{r?.guestEmail}</TableCell>
                      <TableCell>{r?.numberOfGuests}</TableCell>
                      <TableCell>
                        {dayjs(r?.from).format("D MMMM YYYY - h:mm a")}
                      </TableCell>
                      <TableCell>
                        {dayjs(r?.to).format("D MMMM YYYY - h:mm a")}
                      </TableCell>
                      <TableCell>{primaryGuest?.roomNumber}</TableCell>
                      <TableCell>{r?.paymentAmount}</TableCell>
                      <TableCell>{r?.paymentMethod}</TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        )}
      </ContainerColumn>
    </Container>
  );
};

export default Report;
