import Container from "@/components/container";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import { SERVER_URL, useGlobalContext } from "@/lib/utils";
import axios from "axios";
import React, { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { data } from "./data";

type Props = {
  children?: React.ReactNode;
};

const Analytics: FC<Props> = () => {
  const { user } = useGlobalContext();
  const [monthlyRevenue, setMonthlyRevenue] =
    useState<{ total: number; _id: { year: number; month: number } }[]>();
  const [, setCheckedIn] = useState();
  const [arrivals, setArrivals] = useState<{ count: number }>();
  const [departures, setDepartures] = useState<{ count: number }>();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get(SERVER_URL + "/owner/get-reports", {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
        const data = res.data;
        setCheckedIn(data.checkedIn);
        setMonthlyRevenue(data.monthly);
        setArrivals(data.arrivals[0]);
        setDepartures(data.departures[0]);
        console.log(data);
      } catch (error) {
        toast.error((error as Error)?.message || "An error occurred");
      }
    };
    if (user?.token) fetchReports();
  }, [user]);

  return (
    <Container>
      <ContainerColumn>
        <Heading>Analytics</Heading>
        <div className="grid grid-cols-2 gap-5 w-full">
          <div className="col-span-2">
            <Heading variant="subheading" className="pt-2.5 pb-5">
              Monthly Revenue
            </Heading>
            <div className="bg-zinc-100 p-2 rounded-lg pt-5">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart
                  data={monthlyRevenue}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="total" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="_id.month"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip
                    contentStyle={{
                      // backgroundColor: "#1f2937",
                      color: "#000",
                      border: "none",
                      borderRadius: "5px",
                      fontWeight: "500",
                      fontSize: "12px",
                    }}
                    cursor={{ stroke: "#1f2937", strokeWidth: 1 }}
                    formatter={(value) => `$${value}`}
                    active={true}
                    //updatePosition={this.updatePosition}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#total)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <Heading variant="subheading" className="pt-2.5 pb-5">
              Revenue by Property
            </Heading>
            <div className="bg-zinc-100 p-2 rounded-lg pt-5">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  margin={{ top: 0, right: 15, left: 0, bottom: 5 }}
                  data={data}
                >
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Bar
                    dataKey="total"
                    fill="currentColor"
                    radius={[4, 4, 4, 4]}
                    className="fill-primary"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* <div>
            <Heading variant="subheading" className="pt-2.5 pb-5">
              Revenue by Rooms
            </Heading>
            <div className="bg-zinc-100 p-2 rounded-lg pt-5">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  margin={{ top: 0, right: 15, left: 0, bottom: 5 }}
                  data={data}
                >
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Bar
                    dataKey="total"
                    fill="currentColor"
                    radius={[4, 4, 4, 4]}
                    className="fill-primary"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div> */}
          <div>
            <Heading variant="subheading" className="pt-2.5 pb-5">
              Arrivals and Departures Today
            </Heading>
            <div className="bg-zinc-100 p-2 rounded-lg pt-5">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart margin={{ top: 0, right: 100, left: 0, bottom: 5 }}>
                  <Pie
                    data={[
                      { name: "Arrivals", value: arrivals?.count },
                      { name: "Departures", value: departures?.count },
                    ]}
                    cx={
                      window.innerWidth > 768
                        ? window.innerWidth / 5.5
                        : window.innerWidth / 2
                    }
                    cy={
                      window.innerWidth > 768
                        ? window.innerWidth / 9
                        : window.innerWidth / 2
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {data.map((__, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? "#8884d8" : "#82ca9d"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      // backgroundColor: "#1f2937",
                      color: "#000",
                      border: "none",
                      borderRadius: "5px",
                      fontWeight: "500",
                      fontSize: "12px",
                    }}
                    cursor={{ stroke: "#1f2937", strokeWidth: 1 }}
                    //two guets are arriving today and 1 guest is departing today
                    formatter={(value) => `${value} guests`}
                    active={true}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </ContainerColumn>
    </Container>
  );
};

export default Analytics;
