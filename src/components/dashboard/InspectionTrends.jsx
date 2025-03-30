// components/dashboard/InspectionTrends.jsx
import React, { useState, useEffect } from "react";
import { getInspectionTrendsData } from "@/services/inspections/inspectionService";
import { BarChart2, Calendar, RefreshCw, AlertCircle } from "lucide-react";
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
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState("line"); // 'line' or 'bar'
  const [timeGrouping, setTimeGrouping] = useState("day"); // 'day', 'week', 'month'

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const trendsData = await getInspectionTrendsData(
          storeId,
          dateRange,
          timeGrouping
        );
        setData(trendsData);
      } catch (error) {
        console.error("Error fetching inspection trends:", error);
        setError("Failed to load trend data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storeId, dateRange, timeGrouping]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // The useEffect will trigger a refetch
  };

  const renderChart = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="h-10 w-10 text-red-400 mb-3" />
          <p className="text-red-300 text-lg font-medium mb-1">{error}</p>
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
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 text-blue-400 mx-auto mb-3 animate-spin" />
            <p className="text-gray-400">Loading chart data...</p>
          </div>
        </div>
      );
    }

    if (!data || data.length === 0) {
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

    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-gray-800 p-3 border border-gray-700 rounded shadow-lg">
            <p className="text-gray-200 font-medium">{label}</p>
            <div className="mt-2">
              {payload.map((entry, index) => (
                <div key={index} className="flex items-center py-1">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-gray-300 text-sm">
                    {entry.name}: {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      }
      return null;
    };

    if (chartType === "line") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              tick={{ fontSize: 12 }}
              tickMargin={5}
            />
            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: 10 }} />
            <Line
              type="monotone"
              dataKey="satisfactoryItems"
              name="Satisfactory"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="issueItems"
              name="Issues"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="fixedIssues"
              name="Fixed Issues"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="total"
              name="Total Items"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              tick={{ fontSize: 12 }}
              tickMargin={5}
            />
            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: 10 }} />
            <Bar
              dataKey="satisfactoryItems"
              name="Satisfactory"
              fill="#10B981"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="issueItems"
              name="Issues"
              fill="#F59E0B"
              radius={[4, 4, 0, 0]}
            />
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
