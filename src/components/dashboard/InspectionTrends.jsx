// components/dashboard/InspectionTrends.jsx - Updated version
import React, { useState, useEffect } from "react";
import { getInspectionTrendsData } from "@/services/inspections/inspectionService";
import { BarChart2, Calendar, RefreshCcw } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  BarChart,
} from "recharts";

const InspectionTrends = ({ storeId, dateRange }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState("line"); // 'line' or 'bar'
  const [timeGrouping, setTimeGrouping] = useState("day"); // 'day', 'week', 'month'

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const trendsData = await getInspectionTrendsData(
          storeId,
          dateRange,
          timeGrouping
        );
        setData(trendsData);
      } catch (error) {
        console.error("Error fetching inspection trends:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storeId, dateRange, timeGrouping]);

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCcw className="h-8 w-8 text-blue-400 mx-auto mb-3 animate-spin" />
            <p className="text-gray-400">Loading chart data...</p>
          </div>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart2 className="h-8 w-8 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">
              No data available for the selected period
            </p>
          </div>
        </div>
      );
    }

    if (chartType === "line") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                borderColor: "#374151",
                color: "#E5E7EB",
              }}
              labelStyle={{ color: "#E5E7EB" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="satisfactoryItems"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Satisfactory"
            />
            <Line
              type="monotone"
              dataKey="issueItems"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Issues"
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Total Items"
            />
          </LineChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
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
              dataKey="satisfactoryItems"
              fill="#10B981"
              name="Satisfactory"
            />
            <Bar dataKey="issueItems" fill="#F59E0B" name="Issues" />
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-200 flex items-center">
          <BarChart2 className="h-5 w-5 mr-2 text-blue-400" />
          Inspection Trends
        </h2>

        <div className="flex space-x-2">
          {/* Time grouping selector */}
          <div className="flex border border-gray-700 rounded-lg overflow-hidden">
            {["day", "week", "month"].map((group) => (
              <button
                key={group}
                className={`px-3 py-1.5 text-xs font-medium ${
                  timeGrouping === group
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
                onClick={() => setTimeGrouping(group)}
              >
                {group.charAt(0).toUpperCase() + group.slice(1)}
              </button>
            ))}
          </div>

          {/* Chart type selector */}
          <div className="flex border border-gray-700 rounded-lg overflow-hidden">
            <button
              className={`px-3 py-1.5 text-xs font-medium ${
                chartType === "line"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
              onClick={() => setChartType("line")}
            >
              Line
            </button>
            <button
              className={`px-3 py-1.5 text-xs font-medium ${
                chartType === "bar"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
              onClick={() => setChartType("bar")}
            >
              Bar
            </button>
          </div>
        </div>
      </div>

      {renderChart()}
    </div>
  );
};

export default InspectionTrends;
