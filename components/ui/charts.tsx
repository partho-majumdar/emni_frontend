"use client";

import React from "react";
import {
  BarChart as RechartsBarChart,
  LineChart as RechartsLineChart,
  PieChart as RechartsPieChart,
  Bar,
  Line,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChartProps {
  data: any[];
  index?: string;
  categories?: string[];
  colors?: string[];
  showLegend?: boolean;
  className?: string;
  valueFormatter?: (value: number) => string;
  layout?: "horizontal" | "vertical";
  curveType?: "monotone" | "linear";
}

export function BarChart({
  data,
  index,
  categories,
  colors = ["#3b82f6"],
  showLegend = true,
  className,
  valueFormatter,
  layout = "horizontal",
}: ChartProps) {
  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        {layout === "horizontal" ? (
          <RechartsBarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            layout={layout}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis
              dataKey={index}
              tick={{ fill: "#9CA3AF" }}
              axisLine={{ stroke: "#6B7280" }}
              tickLine={{ stroke: "#6B7280" }}
            />
            <YAxis
              tick={{ fill: "#9CA3AF" }}
              axisLine={{ stroke: "#6B7280" }}
              tickLine={{ stroke: "#6B7280" }}
              tickFormatter={valueFormatter}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#1F2937", borderColor: "#374151" }}
              itemStyle={{ color: "#F3F4F6" }}
              labelStyle={{ color: "#9CA3AF" }}
              formatter={(value: number) => (valueFormatter ? valueFormatter(value) : value)}
            />
            {showLegend && (
              <Legend
                wrapperStyle={{ color: "#F3F4F6", paddingTop: "20px" }}
                formatter={(value) => (
                  <span className="text-gray-300 capitalize">{value}</span>
                )}
              />
            )}
            {categories?.map((category, i) => (
              <Bar
                key={category}
                dataKey={category}
                fill={colors[i % colors.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </RechartsBarChart>
        ) : (
          <RechartsBarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            layout={layout}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: "#9CA3AF" }}
              axisLine={{ stroke: "#6B7280" }}
              tickLine={{ stroke: "#6B7280" }}
              tickFormatter={valueFormatter}
            />
            <YAxis
              dataKey={index}
              type="category"
              tick={{ fill: "#9CA3AF" }}
              axisLine={{ stroke: "#6B7280" }}
              tickLine={{ stroke: "#6B7280" }}
              width={80}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#1F2937", borderColor: "#374151" }}
              itemStyle={{ color: "#F3F4F6" }}
              labelStyle={{ color: "#9CA3AF" }}
              formatter={(value: number) => (valueFormatter ? valueFormatter(value) : value)}
            />
            {showLegend && (
              <Legend
                wrapperStyle={{ color: "#F3F4F6", paddingTop: "20px" }}
                formatter={(value) => (
                  <span className="text-gray-300 capitalize">{value}</span>
                )}
              />
            )}
            {categories?.map((category, i) => (
              <Bar
                key={category}
                dataKey={category}
                fill={colors[i % colors.length]}
                radius={[0, 4, 4, 0]}
              />
            ))}
          </RechartsBarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export function LineChart({
  data,
  index,
  categories,
  colors = ["#3b82f6"],
  showLegend = true,
  className,
  valueFormatter,
  curveType = "monotone",
}: ChartProps) {
  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          <XAxis
            dataKey={index}
            tick={{ fill: "#9CA3AF" }}
            axisLine={{ stroke: "#6B7280" }}
            tickLine={{ stroke: "#6B7280" }}
          />
          <YAxis
            tick={{ fill: "#9CA3AF" }}
            axisLine={{ stroke: "#6B7280" }}
            tickLine={{ stroke: "#6B7280" }}
            tickFormatter={valueFormatter}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#1F2937", borderColor: "#374151" }}
            itemStyle={{ color: "#F3F4F6" }}
            labelStyle={{ color: "#9CA3AF" }}
            formatter={(value: number) => (valueFormatter ? valueFormatter(value) : value)}
          />
          {showLegend && (
            <Legend
              wrapperStyle={{ color: "#F3F4F6", paddingTop: "20px" }}
              formatter={(value) => (
                <span className="text-gray-300 capitalize">{value}</span>
              )}
            />
          )}
          {categories?.map((category, i) => (
            <Line
              key={category}
              type={curveType}
              dataKey={category}
              stroke={colors[i % colors.length]}
              strokeWidth={2}
              dot={{ r: 4, fill: colors[i % colors.length] }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PieChart({
  data,
  colors = ["#10b981", "#f59e0b", "#6B7280"],
  showLegend = true,
  className,
  valueFormatter,
}: ChartProps) {
  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="80%"
            innerRadius="50%"
            paddingAngle={5}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: "#1F2937", borderColor: "#374151" }}
            itemStyle={{ color: "#F3F4F6" }}
            labelStyle={{ color: "#9CA3AF" }}
            formatter={(value: number) => (valueFormatter ? valueFormatter(value) : `${value}%`)}
          />
          {showLegend && (
            <Legend
              wrapperStyle={{ color: "#F3F4F6", paddingTop: "20px" }}
              formatter={(value) => (
                <span className="text-gray-300 capitalize">{value}</span>
              )}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}