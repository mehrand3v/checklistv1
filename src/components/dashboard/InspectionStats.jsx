// components/dashboard/InspectionStats.jsx
import React, { useState, useEffect } from "react";
import { getInspectionsStats } from "@/services/inspections/inspectionService";
import {
  CheckCircle,
  AlertCircle,
  Calendar,
  Store,
  Clock,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const StatCard = ({
  title,
  value,
  icon,
  color,
  loading,
  subtext,
  trend,
  trendValue,
}) => (
  <div
    className={`bg-gray-800/60 rounded-xl p-5 border border-gray-700/50 hover:bg-gray-700/40 transition-all duration-300 hover:shadow-lg hover:shadow-${color}-900/10`}
  >
    {loading ? (
      <div className="animate-pulse">
        <div className="flex justify-between items-start">
          <div>
            <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
            <div className="h-7 bg-gray-700 rounded w-16"></div>
          </div>
          <div className="h-12 w-12 bg-gray-700 rounded-full"></div>
        </div>
      </div>
    ) : (
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <h3 className={`text-2xl font-bold text-${color}-400`}>{value}</h3>

          {subtext && (
            <div className="flex items-center mt-2">
              <p className="text-xs text-gray-400">{subtext}</p>

              {trend && (
                <div
                  className={`flex items-center ml-2 px-1.5 py-0.5 rounded text-xs ${
                    trend === "up"
                      ? "text-green-400 bg-green-900/30"
                      : "text-red-400 bg-red-900/30"
                  }`}
                >
                  {trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  )}
                  {trendValue}
                </div>
              )}
            </div>
          )}
        </div>
        <div
          className={`p-3 rounded-full bg-${color}-900/30 border border-${color}-500/30`}
        >
          {icon}
        </div>
      </div>
    )}
  </div>
);

const InspectionStats = ({ storeId, dateRange }) => {
  const [stats, setStats] = useState({
    total: 0,
    satisfactoryItems: 0,
    issueItems: 0,
    fixedIssues: 0,
    stores: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getInspectionsStats(storeId, dateRange);
        setStats(data);
      } catch (error) {
        console.error("Error fetching inspection stats:", error);
        setError("Failed to load statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [storeId, dateRange]);

  // Calculate pass rate
  const passRate =
    stats.satisfactoryItems + stats.issueItems > 0
      ? Math.round(
          (stats.satisfactoryItems /
            (stats.satisfactoryItems + stats.issueItems)) *
            100
        )
      : 0;

  // Calculate fix rate
  const fixRate =
    stats.issueItems > 0
      ? Math.round((stats.fixedIssues / stats.issueItems) * 100)
      : 0;

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-200 flex items-center mb-4">
        <Calendar className="h-5 w-5 mr-2 text-blue-400" />
        Analytics Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {error ? (
          <div className="col-span-4 bg-red-900/30 border border-red-500/30 rounded-xl p-4 text-center">
            <AlertCircle className="h-6 w-6 text-red-400 mx-auto mb-2" />
            <p className="text-red-300">{error}</p>
            <button
              className="mt-2 px-4 py-1 bg-red-800/50 text-red-200 text-sm rounded-lg border border-red-500/30"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <StatCard
              title="Total Inspections"
              value={loading ? "-" : stats.total}
              icon={<Calendar className="h-6 w-6 text-blue-400" />}
              color="blue"
              loading={loading}
              subtext="During selected period"
              trend="up"
              trendValue="12%"
            />

            <StatCard
              title="Satisfactory Items"
              value={loading ? "-" : stats.satisfactoryItems}
              icon={<CheckCircle className="h-6 w-6 text-green-400" />}
              color="green"
              loading={loading}
              subtext={`${passRate}% pass rate`}
              trend={passRate >= 80 ? "up" : "down"}
              trendValue={`${passRate}%`}
            />

            <StatCard
              title="Issues Found"
              value={loading ? "-" : stats.issueItems}
              icon={<AlertCircle className="h-6 w-6 text-amber-400" />}
              color="amber"
              loading={loading}
              subtext={`${fixRate}% fix rate`}
              trend={fixRate > 50 ? "up" : "down"}
              trendValue={`${fixRate}%`}
            />

            <StatCard
              title="Store Locations"
              value={loading ? "-" : stats.stores}
              icon={<Store className="h-6 w-6 text-purple-400" />}
              color="purple"
              loading={loading}
              subtext="With inspection data"
            />
          </>
        )}
      </div>

      {/* Additional Analytics Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Pass Rate Card */}
          <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50">
            <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
              <Percent className="h-4 w-4 mr-2 text-blue-400" />
              Overall Pass Rate
            </h3>

            <div className="flex items-end">
              <div className="text-3xl font-bold text-blue-400">
                {passRate}%
              </div>
              <div className="ml-3 text-xs text-gray-400">
                of all inspection items passed
              </div>
            </div>

            <div className="mt-3 w-full bg-gray-700/50 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${
                  passRate >= 90
                    ? "bg-green-500"
                    : passRate >= 75
                    ? "bg-blue-500"
                    : passRate >= 50
                    ? "bg-amber-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${passRate}%` }}
              ></div>
            </div>

            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Issue Resolution Rate Card */}
          <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50">
            <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-green-400" />
              Issue Resolution Rate
            </h3>

            <div className="flex items-end">
              <div className="text-3xl font-bold text-green-400">
                {fixRate}%
              </div>
              <div className="ml-3 text-xs text-gray-400">
                of identified issues have been fixed
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-4">
              <div className="p-2 bg-gray-700/40 rounded border border-gray-600/30 text-center">
                <div className="text-lg font-bold text-amber-400">
                  {stats.issueItems}
                </div>
                <div className="text-xs text-gray-400">Total Issues</div>
              </div>

              <div className="p-2 bg-gray-700/40 rounded border border-gray-600/30 text-center">
                <div className="text-lg font-bold text-green-400">
                  {stats.fixedIssues}
                </div>
                <div className="text-xs text-gray-400">Fixed Issues</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionStats;
