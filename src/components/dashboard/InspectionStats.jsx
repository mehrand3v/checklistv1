// components/dashboard/InspectionStats.jsx - Updated version
import React, { useState, useEffect } from "react";
import { getInspectionsStats } from "@/services/inspections/inspectionService";
import { CheckCircle, AlertCircle, Calendar, Store, Clock } from "lucide-react";

const StatCard = ({ title, value, icon, color }) => (
  <div className={`bg-gray-800/60 rounded-xl p-5 border border-gray-700/50`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
        <h3 className={`text-2xl font-bold text-${color}-400`}>{value}</h3>
      </div>
      <div
        className={`p-3 rounded-full bg-${color}-900/30 border border-${color}-500/30`}
      >
        {icon}
      </div>
    </div>
  </div>
);

const InspectionStats = ({ storeId, dateRange }) => {
  const [stats, setStats] = useState({
    total: 0,
    satisfactoryItems: 0,
    issueItems: 0,
    stores: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await getInspectionsStats(storeId, dateRange);
        setStats(data);
      } catch (error) {
        console.error("Error fetching inspection stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [storeId, dateRange]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-800/60 rounded-xl p-5 border border-gray-700/50 animate-pulse"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <div className="h-3 bg-gray-700 rounded w-24"></div>
                <div className="h-7 bg-gray-700 rounded w-16"></div>
              </div>
              <div className="h-12 w-12 bg-gray-700 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Inspections"
        value={stats.total}
        icon={<Calendar className="h-6 w-6 text-blue-400" />}
        color="blue"
      />

      <StatCard
        title="Satisfactory Items"
        value={stats.satisfactoryItems}
        icon={<CheckCircle className="h-6 w-6 text-green-400" />}
        color="green"
      />

      <StatCard
        title="Issues Found"
        value={stats.issueItems}
        icon={<AlertCircle className="h-6 w-6 text-amber-400" />}
        color="amber"
      />

      <StatCard
        title="Store Locations"
        value={stats.stores}
        icon={<Store className="h-6 w-6 text-purple-400" />}
        color="purple"
      />
    </div>
  );
};

export default InspectionStats;
