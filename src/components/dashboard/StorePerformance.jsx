// components/dashboard/StorePerformance.jsx
import React, { useState, useEffect } from "react";
import { getStorePerformance } from "@/services/inspections/inspectionService";
import { Store, AlertCircle } from "lucide-react";
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
  const [sortBy, setSortBy] = useState("issues"); // 'name', 'inspections', 'issues'

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const performanceData = await getStorePerformance(dateRange);
        setData(performanceData);
      } catch (error) {
        console.error("Error fetching store performance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const sortedData = [...data].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "inspections") return b.inspections - a.inspections;
    return b.issues - a.issues;
  });

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-80 flex flex-col items-center justify-center text-gray-400">
        <Store className="h-8 w-8 mb-2" />
        <p>No store performance data available</p>
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
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                borderColor: "#374151",
                color: "#E5E7EB",
              }}
              labelStyle={{ color: "#E5E7EB" }}
            />
            <Legend />
            <Bar
              name="Inspections Completed"
              dataKey="inspections"
              fill="#3B82F6"
            />
            <Bar name="Issues Found" dataKey="issues" fill="#F59E0B" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StorePerformance;
