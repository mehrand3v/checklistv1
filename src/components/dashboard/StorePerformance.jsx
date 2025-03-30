// components/dashboard/StorePerformance.jsx
import React, { useState, useEffect } from "react";
import { getStorePerformance } from "@/services/inspections/inspectionService";
import { Store, AlertCircle, RefreshCw } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const StorePerformance = ({ dateRange }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("name"); // 'name', 'inspections', 'issues'

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const performanceData = await getStorePerformance(dateRange);
        setData(performanceData);
      } catch (error) {
        console.error("Error fetching store performance data:", error);
        setError("Failed to load store performance data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // The useEffect will trigger a refetch
  };

  const sortedData = [...data].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "inspections") return b.inspections - a.inspections;
    return b.issues - a.issues;
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 border border-gray-700 rounded shadow-lg">
          <p className="text-gray-200 font-medium mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-gray-300 text-sm">
                  {entry.name}: {entry.value}
                </span>
              </div>
            ))}

            {/* Show total items if available */}
            {payload[0]?.payload?.satisfactoryItems !== undefined && (
              <div className="flex items-center pt-1 border-t border-gray-700 mt-1">
                <div className="w-3 h-3 rounded-full mr-2 bg-gray-400"></div>
                <span className="text-gray-300 text-sm">
                  Total Items:{" "}
                  {(payload[0].payload.satisfactoryItems || 0) +
                    (payload[0].payload.issues || 0)}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (error) {
    return (
      <div className="h-80 flex flex-col items-center justify-center">
        <AlertCircle className="h-10 w-10 text-red-400 mb-3" />
        <p className="text-red-300 text-lg font-medium mb-2">{error}</p>
        <button
          onClick={handleRetry}
          className="mt-3 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full mr-3"></div>
        <p className="text-gray-400">Loading store performance data...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-80 flex flex-col items-center justify-center text-gray-400">
        <Store className="h-10 w-10 mb-3 text-gray-500" />
        <p className="text-lg font-medium">
          No store performance data available
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Try selecting a different date range
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-200 flex items-center">
          <Store className="h-5 w-5 mr-2 text-blue-400" />
          Store Performance Comparison
        </h2>

        <div className="flex space-x-2 text-sm">
          <button
            className={`px-2 py-1 rounded ${
              sortBy === "name"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
            onClick={() => setSortBy("name")}
          >
            Sort by Name
          </button>
          <button
            className={`px-2 py-1 rounded ${
              sortBy === "inspections"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
            onClick={() => setSortBy("inspections")}
          >
            Sort by Inspections
          </button>
          <button
            className={`px-2 py-1 rounded ${
              sortBy === "issues"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
            onClick={() => setSortBy("issues")}
          >
            Sort by Issues
          </button>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="name"
              stroke="#9CA3AF"
              angle={-45}
              textAnchor="end"
              height={70}
              tick={{ fontSize: 12 }}
            />
            <YAxis stroke="#9CA3AF" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              name="Inspections Completed"
              dataKey="inspections"
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              name="Issues Found"
              dataKey="issues"
              fill="#F59E0B"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              name="Satisfactory Items"
              dataKey="satisfactoryItems"
              fill="#10B981"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StorePerformance;
