// components/dashboard/InspectionTrends.jsx
import React, { useState, useEffect } from "react";
import { getInspectionTrendsData } from "@/services/inspections/inspectionService";
import { BarChart2, Calendar, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
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
  ComposedChart,
} from "recharts";

const InspectionTrends = ({ storeId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState("line"); // 'line' or 'bar'
  const [timeRange, setTimeRange] = useState("month"); // 'week', 'month', 'quarter'

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const trendsData = await getInspectionTrendsData(storeId, timeRange);
        setData(trendsData);
      } catch (error) {
        console.error("Error fetching inspection trends:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storeId, timeRange]);

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCcw className="h-8 w-8 text-blue-500 mx-auto mb-3 animate-spin" />
            <p className="text-gray-500">Loading chart data...</p>
          </div>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart2 className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">
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
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 12 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="passed"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Passed"
            />
            <Line
              type="monotone"
              dataKey="failed"
              stroke="#EF4444"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Failed"
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Total"
            />
          </LineChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 12 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            />
            <Legend />
            <Bar dataKey="passed" fill="#10B981" name="Passed" />
            <Bar dataKey="failed" fill="#EF4444" name="Failed" />
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-800 flex items-center">
          <BarChart2 className="h-5 w-5 mr-2 text-blue-500" />
          Inspection Trends
        </h2>

        <div className="flex space-x-2">
          {/* Time range selector */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            {["week", "month", "quarter"].map((range) => (
              <button
                key={range}
                className={`px-3 py-1.5 text-xs font-medium ${
                  timeRange === range
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setTimeRange(range)}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>

          {/* Chart type selector */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              className={`px-3 py-1.5 text-xs font-medium ${
                chartType === "line"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => setChartType("line")}
            >
              Line
            </button>
            <button
              className={`px-3 py-1.5 text-xs font-medium ${
                chartType === "bar"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
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
