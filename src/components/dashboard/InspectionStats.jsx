// components/dashboard/InspectionStats.jsx
import React, { useState, useEffect } from "react";
import { getInspectionsStats } from "@/services/inspections/inspectionService";
import { CheckCircle, AlertCircle, Calendar, Store, Clock } from "lucide-react";

const StatCard = ({ title, value, icon, color, loading }) => (
  <div className={`bg-gray-800/60 rounded-xl p-5 border border-gray-700/50`}>
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

  return (
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
          />

          <StatCard
            title="Satisfactory Items"
            value={loading ? "-" : stats.satisfactoryItems}
            icon={<CheckCircle className="h-6 w-6 text-green-400" />}
            color="green"
            loading={loading}
          />

          <StatCard
            title="Issues Found"
            value={loading ? "-" : stats.issueItems}
            icon={<AlertCircle className="h-6 w-6 text-amber-400" />}
            color="amber"
            loading={loading}
          />

          <StatCard
            title="Store Locations"
            value={loading ? "-" : stats.stores}
            icon={<Store className="h-6 w-6 text-purple-400" />}
            color="purple"
            loading={loading}
          />
        </>
      )}
    </div>
  );
};

export default InspectionStats;
