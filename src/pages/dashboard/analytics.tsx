import Container from "@/components/container";
import ContainerColumn from "@/components/container-column";
import Heading from "@/components/heading";
import React, { FC } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
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
  return (
    <Container>
      <ContainerColumn>
        <Heading>Analytics</Heading>
        <div className="grid grid-cols-2 gap-5 w-full">
          <div className="col-span-2">
            <Heading variant="subheading" className="pt-2.5 pb-5">
              Revenue by Month
            </Heading>
            <div className="bg-zinc-100 p-2 rounded-lg pt-5">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart
                  data={data}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="total" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
          <div>
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
          </div>
        </div>
      </ContainerColumn>
    </Container>
  );
};

export default Analytics;
