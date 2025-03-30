// components/dashboard/CommonIssuesChart.jsx
import React, { useState, useEffect } from "react";
import { getCommonIssues } from "@/services/inspections/inspectionService";
import { AlertCircle } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

const CommonIssuesChart = ({ storeId, dateRange }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const issuesData = await getCommonIssues(storeId, dateRange);
        setData(issuesData);
      } catch (error) {
        console.error("Error fetching common issues data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storeId, dateRange]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-gray-400">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p>No issue data available</p>
      </div>
    );
  }

  // Truncate long descriptions
  const truncateDescription = (text, maxLength = 30) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Process data for chart
  const chartData = data.map((item) => ({
    ...item,
    shortDesc: truncateDescription(item.description),
  }));

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-200 mb-4 flex items-center">
        <AlertCircle className="h-5 w-5 mr-2 text-amber-400" />
        Most Common Issues
      </h2>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" stroke="#9CA3AF" />
            <YAxis
              type="category"
              dataKey="shortDesc"
              stroke="#9CA3AF"
              width={150}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                borderColor: "#374151",
                color: "#E5E7EB",
              }}
              labelStyle={{ color: "#E5E7EB" }}
              formatter={(value, name) => [value, "Occurrences"]}
              labelFormatter={(label, payload) => {
                if (payload.length > 0) {
                  return payload[0].payload.description;
                }
                return label;
              }}
            />
            <Bar dataKey="count" fill="#7C3AED">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`#7C3AED`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CommonIssuesChart;
