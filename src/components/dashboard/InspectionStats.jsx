// components/dashboard/InspectionStats.jsx
import React, { useState, useEffect } from "react";
import { getInspectionsStats } from "@/services/inspections/inspectionService";
import {
  CheckCircle,
  XCircle,
  Calendar,
  Store,
  TrendingUp,
} from "lucide-react";

const StatCard = ({ title, value, icon, bgColor, textColor, trend }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className={`text-2xl font-bold ${textColor}`}>{value}</h3>
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUp
              className={`h-4 w-4 mr-1 ${
                trend > 0 ? "text-green-500" : "text-red-500"
              }`}
            />
            <span
              className={`text-xs font-medium ${
                trend > 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {trend > 0 ? `+${trend}%` : `${trend}%`} from last month
            </span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-full ${bgColor}`}>{icon}</div>
    </div>
  </div>
);

const InspectionStats = ({ storeId }) => {
  const [stats, setStats] = useState({
    total: 0,
    passed: 0,
    failed: 0,
    stores: 0,
    trends: {
      total: 0,
      passed: 0,
      failed: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await getInspectionsStats(storeId);
        setStats(data);
      } catch (error) {
        console.error("Error fetching inspection stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [storeId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 animate-pulse"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded w-24"></div>
                <div className="h-7 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Inspections"
        value={stats.total}
        icon={<Calendar className="h-6 w-6 text-blue-600" />}
        bgColor="bg-blue-100"
        textColor="text-gray-800"
        trend={stats.trends.total}
      />

      <StatCard
        title="Passed Inspections"
        value={stats.passed}
        icon={<CheckCircle className="h-6 w-6 text-green-600" />}
        bgColor="bg-green-100"
        textColor="text-gray-800"
        trend={stats.trends.passed}
      />

      <StatCard
        title="Failed Inspections"
        value={stats.failed}
        icon={<XCircle className="h-6 w-6 text-red-600" />}
        bgColor="bg-red-100"
        textColor="text-gray-800"
        trend={stats.trends.failed}
      />

      <StatCard
        title="Active Stores"
        value={stats.stores}
        icon={<Store className="h-6 w-6 text-purple-600" />}
        bgColor="bg-purple-100"
        textColor="text-gray-800"
      />
    </div>
  );
};

export default InspectionStats;
