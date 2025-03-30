// components/dashboard/CommonIssuesChart.jsx
import React, { useState, useEffect } from "react";
import { getCommonIssues } from "@/services/inspections/inspectionService";
import { AlertCircle, RefreshCw } from "lucide-react";
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
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const issuesData = await getCommonIssues(storeId, dateRange);
        setData(issuesData);
      } catch (error) {
        console.error("Error fetching common issues data:", error);
        setError("Failed to load issues data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storeId, dateRange]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // The useEffect will trigger a refetch
  };

  // Truncate long descriptions
  const truncateDescription = (text, maxLength = 28) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Process data for chart - add short descriptions and colors
  const chartData = data.map((item, index) => ({
    ...item,
    shortDesc: truncateDescription(item.description || `Issue #${item.id}`),
    color: `#7C3AED`, // Use a consistent color
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 border border-gray-700 rounded shadow-lg">
          <p className="text-gray-200 font-medium mb-1">
            {payload[0].payload.description || label}
          </p>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2 bg-purple-500"></div>
            <span className="text-gray-300">
              {payload[0].value} occurrences
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (error) {
    return (
      <div className="h-64 flex flex-col items-center justify-center">
        <AlertCircle className="h-8 w-8 text-red-400 mb-2" />
        <p className="text-red-300 mb-3">{error}</p>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 flex items-center text-sm"
        >
          <RefreshCw className="h-3 w-3 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-purple-500 rounded-full mr-2"></div>
        <p className="text-gray-400">Loading data...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-gray-400">
        <AlertCircle className="h-8 w-8 mb-2 text-gray-500" />
        <p className="text-center">No issue data available</p>
        <p className="text-sm text-gray-500 mt-1">
          All inspections passed or no data for the selected period
        </p>
      </div>
    );
  }

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
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="#7C3AED" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`#7C3AED`}
                  opacity={0.7 + 0.3 * (index / chartData.length)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CommonIssuesChart;
