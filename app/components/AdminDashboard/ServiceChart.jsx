import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const ServiceChart = ({ data }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-white mb-4">
        Most Popular Services
      </h2>
      {data.length === 0 ? (
        <div className="text-gray-400">No data to display</div>
      ) : (
        <div
          className="bg-gray-800 rounded-lg p-4 border border-gray-700 overflow-hidden"
          style={{ position: "relative", maxWidth: "100%" }}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              margin={{ top: 10, right: 20, left: 0, bottom: 30 }}
            >
              <CartesianGrid stroke="#2d3748" />
              <XAxis
                dataKey="service"
                tick={{ fill: "#cbd5e1", fontSize: 12 }}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={60}
              />
              <YAxis allowDecimals={false} tick={{ fill: "#cbd5e1" }} />
              <Tooltip />
              <Bar dataKey="count" fill="#60a5fa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ServiceChart;
