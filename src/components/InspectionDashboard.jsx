import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import useInspections from "@/hooks/useInspections";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, subDays } from "date-fns";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Clock,
  List,
  FileText,
} from "lucide-react";

// Card component for stats
const StatCard = ({ title, value, icon, color, increase, subtitle }) => (
  <motion.div
    whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
    className={`bg-white rounded-xl shadow-md overflow-hidden p-6 border-l-4 ${color}`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        {increase !== undefined && (
          <p
            className={`text-xs mt-2 ${
              increase >= 0 ? "text-green-500" : "text-red-500"
            } flex items-center`}
          >
            {increase >= 0 ? "↑" : "↓"} {Math.abs(increase)}% from last week
          </p>
        )}
      </div>
      <div
        className={`p-3 rounded-full ${color
          .replace("border-", "bg-")
          .replace("-600", "-100")}`}
      >
        {icon}
      </div>
    </div>
  </motion.div>
);

const InspectionDashboard = () => {
  const [viewMode, setViewMode] = useState("week"); // 'day', 'week', 'month'
  const [chartType, setChartType] = useState("passRate"); // 'passRate', 'count', 'failures'

  // Using our enhanced hook
  const {
    inspections,
    stats,
    loading,
    error,
    fetchInspections,
    getFailureStats,
  } = useInspections({
    limitCount: 100, // Get more data for meaningful charts
    autoFetch: true,
  });

  // Refresh data handler
  const handleRefresh = () => {
    fetchInspections(true); // Force refresh
  };

  // Prepare chart data based on view mode
  const getChartData = () => {
    if (!inspections || inspections.length === 0) return [];

    const now = new Date();
    let dateRange;

    // Determine date range based on view mode
    switch (viewMode) {
      case "day":
        dateRange = 1;
        break;
      case "month":
        dateRange = 30;
        break;
      case "week":
      default:
        dateRange = 7;
        break;
    }

    // Generate dates for x-axis
    const dates = Array.from({ length: dateRange }, (_, i) => {
      const date = subDays(now, dateRange - 1 - i);
      return {
        date,
        dateString: format(date, "yyyy-MM-dd"),
        displayDate: format(date, viewMode === "day" ? "HH:mm" : "MMM dd"),
        count: 0,
        passRate: 0,
        failures: 0,
        totalItems: 0,
        passedItems: 0,
      };
    });

    // Add inspection data to corresponding dates
    inspections.forEach((inspection) => {
      if (!inspection.timestamp) return;

      const inspDate = inspection.timestamp;
      const dateString = format(inspDate, "yyyy-MM-dd");

      const dateIndex = dates.findIndex((d) => d.dateString === dateString);
      if (dateIndex !== -1) {
        dates[dateIndex].count += 1;
        dates[dateIndex].totalItems += inspection.totalItems || 0;
        dates[dateIndex].passedItems += inspection.passedItems || 0;
        dates[dateIndex].failures += inspection.failedItems || 0;
      }
    });

    // Calculate pass rates
    dates.forEach((date) => {
      if (date.totalItems > 0) {
        date.passRate = Math.round((date.passedItems / date.totalItems) * 100);
      }
    });

    return dates;
  };

  const chartData = getChartData();

  // Get top failure items
  const failureData = getFailureStats().map((failure) => ({
    id: failure.id,
    name: `Item ${failure.id}`,
    value: failure.count,
  }));

  // Colors for pie chart
  const COLORS = ["#FF8042", "#FF6B6B", "#FF4858", "#FF304F", "#FF1744"];

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Inspection Dashboard
        </h1>
        <button
          onClick={handleRefresh}
          className="flex items-center px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition-colors"
          disabled={loading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Inspections"
          value={stats.total}
          icon={<List className="h-6 w-6 text-blue-600" />}
          color="border-blue-600"
          subtitle="All time"
        />
        <StatCard
          title="This Week"
          value={stats.thisWeek}
          icon={<Calendar className="h-6 w-6 text-indigo-600" />}
          color="border-indigo-600"
          increase={12} // Example increase value
        />
        <StatCard
          title="Pass Rate (Weekly)"
          value={`${Math.round(stats.weekPassRate)}%`}
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          color="border-green-600"
          increase={5} // Example increase value
        />
        <StatCard
          title="Failed Items"
          value={inspections.reduce(
            (sum, insp) => sum + (insp.failedItems || 0),
            0
          )}
          icon={<XCircle className="h-6 w-6 text-red-600" />}
          color="border-red-600"
          subtitle="All inspections"
        />
      </div>

      {/* Chart Controls */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Inspection Trends</h2>
          <div className="flex space-x-2">
            <div className="flex border rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode("day")}
                className={`px-3 py-1.5 text-sm ${
                  viewMode === "day"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={`px-3 py-1.5 text-sm ${
                  viewMode === "week"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode("month")}
                className={`px-3 py-1.5 text-sm ${
                  viewMode === "month"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Month
              </button>
            </div>

            <div className="flex border rounded-md overflow-hidden">
              <button
                onClick={() => setChartType("passRate")}
                className={`px-3 py-1.5 text-sm ${
                  chartType === "passRate"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Pass Rate
              </button>
              <button
                onClick={() => setChartType("count")}
                className={`px-3 py-1.5 text-sm ${
                  chartType === "count"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Inspections
              </button>
              <button
                onClick={() => setChartType("failures")}
                className={`px-3 py-1.5 text-sm ${
                  chartType === "failures"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Failures
              </button>
            </div>
          </div>
        </div>

        {/* Inspection Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "passRate" ? (
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Pass Rate"]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="passRate"
                  name="Pass Rate"
                  stroke="#10B981"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            ) : chartType === "count" ? (
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="count"
                  name="Inspections"
                  fill="#6366F1"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            ) : (
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="failures"
                  name="Failed Items"
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section with Pie Chart and Recent Inspections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Common Failures Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Top Failure Areas
          </h2>
          {failureData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={failureData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) =>
                      `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {failureData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No failure data available</p>
            </div>
          )}
        </div>

        {/* Recent Inspections List */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Recent Inspections
          </h2>
          {inspections.length > 0 ? (
            <div className="space-y-4 overflow-auto max-h-64">
              {inspections.slice(0, 5).map((inspection) => (
                <div
                  key={inspection.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        {inspection.timestamp
                          ? format(inspection.timestamp, "MMM dd, yyyy h:mm a")
                          : "No date"}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {inspection.passedItems || 0} passed,{" "}
                        {inspection.failedItems || 0} failed
                      </div>
                    </div>
                    <div
                      className={`text-sm font-medium px-2 py-1 rounded-full ${
                        (inspection.passRate || 0) > 90
                          ? "bg-green-100 text-green-800"
                          : (inspection.passRate || 0) > 70
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {Math.round(inspection.passRate || 0)}% passed
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No recent inspections</p>
            </div>
          )}

          {inspections.length > 5 && (
            <div className="mt-4 text-center">
              <button className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors">
                View All Inspections
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InspectionDashboard;
