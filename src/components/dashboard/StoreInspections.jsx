// components/dashboard/StoreInspections.jsx
import React, { useState, useEffect } from "react";
import { getInspections } from "@/services/inspections/inspectionService";
import {
  Store,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Clock,
  Eye,
} from "lucide-react";

const StoreInspections = ({
  selectedStore,
  dateRange,
  limit = 5,
  onViewDetail,
}) => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchInspections = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await getInspections({
          storeId: selectedStore,
          startDate: dateRange?.start,
          endDate: dateRange?.end,
          itemsPerPage: limit,
          sortField: "timestamp",
          sortDirection: "desc",
        });

        setInspections(data);
      } catch (error) {
        console.error("Error fetching store inspections:", error);
        setError("Failed to load inspections");
      } finally {
        setLoading(false);
      }
    };

    if (selectedStore) {
      fetchInspections();
    }
  }, [selectedStore, dateRange, limit]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "—";

    try {
      return new Date(timestamp).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      console.error("Date formatting error:", e);
      return "Invalid date";
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    try {
      return new Date(timestamp).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      console.error("Time formatting error:", e);
      return "";
    }
  };

  const getPassRate = (inspection) => {
    const total = inspection.totalItems || 0;
    const satisfactory = inspection.satisfactoryItems || 0;

    if (total === 0) return "0%";

    return `${Math.round((satisfactory / total) * 100)}%`;
  };

  // Toggle expanded view
  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  // Handle retry button click
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // The useEffect will trigger a refetch
  };

  // Handle view detail click
  const handleViewDetail = (inspection) => {
    if (onViewDetail && typeof onViewDetail === "function") {
      onViewDetail(inspection);
    }
  };

  return (
    <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
      <h2 className="text-lg font-bold text-gray-200 flex items-center mb-4">
        <Clock className="h-5 w-5 mr-2 text-blue-400" />
        Recent Inspections
      </h2>

      {error ? (
        <div className="p-6 text-center">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-2" />
          <p className="text-red-300 text-lg font-medium mb-2">{error}</p>
          <button
            onClick={handleRetry}
            className="mt-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg flex items-center mx-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="p-6 text-center">
          <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-blue-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading recent inspections...</p>
        </div>
      ) : inspections.length === 0 ? (
        <div className="p-6 text-center">
          <Store className="h-10 w-10 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-300 font-medium mb-1">No inspections found</p>
          <p className="text-gray-400 text-sm">
            There are no recorded inspections for this store in the selected
            date range.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {inspections.map((inspection) => (
            <div
              key={inspection.id}
              className="bg-gray-800/60 rounded-lg border border-gray-700/50 p-3 hover:bg-gray-700/40 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <span className="text-blue-300 font-medium">
                      {inspection.storeName}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      • {formatDate(inspection.timestamp)} at{" "}
                      {formatTime(inspection.timestamp)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Conducted by {inspection.submittedBy || "Unknown"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center text-sm font-medium rounded-full px-2 py-0.5 ${
                      inspection.overallStatus === "pass"
                        ? "bg-green-900/30 text-green-300 border border-green-500/30"
                        : "bg-red-900/30 text-red-300 border border-red-500/30"
                    }`}
                  >
                    {inspection.overallStatus === "pass" ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {getPassRate(inspection)}
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        {getPassRate(inspection)}
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => toggleExpand(inspection.id)}
                    className="p-1 bg-gray-700/50 rounded-full hover:bg-gray-600/70 transition-colors"
                  >
                    <ChevronRight
                      className={`h-4 w-4 text-gray-400 transition-transform ${
                        expandedId === inspection.id
                          ? "transform rotate-90"
                          : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Basic metrics row */}
              <div className="mt-2 grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-gray-700/50 rounded p-1">
                  <div className="text-gray-400">Total</div>
                  <div className="text-gray-200 font-medium">
                    {inspection.totalItems || 0}
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded p-1">
                  <div className="text-gray-400">Pass</div>
                  <div className="text-green-400 font-medium">
                    {inspection.satisfactoryItems || 0}
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded p-1">
                  <div className="text-gray-400">Issues</div>
                  <div className="text-red-400 font-medium">
                    {inspection.issueItems || 0}
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded p-1">
                  <div className="text-gray-400">Fixed</div>
                  <div className="text-blue-400 font-medium">
                    {inspection.fixedIssues || 0}
                  </div>
                </div>
              </div>

              {/* Expanded view with items that failed inspection */}
              {expandedId === inspection.id && inspection.items && (
                <div className="mt-3 pt-3 border-t border-gray-700/50">
                  <div className="text-xs text-gray-400 mb-2 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1 text-amber-400" />
                    Issues Found:
                  </div>

                  <div className="max-h-48 overflow-y-auto pr-1">
                    {inspection.items
                      .filter((item) => item.status === "fail")
                      .map((item, index) => (
                        <div
                          key={index}
                          className="mb-2 p-2 bg-red-900/20 border border-red-500/30 rounded-md text-xs"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <XCircle className="h-3 w-3 text-red-400 mr-1 flex-shrink-0" />
                                <span className="font-medium text-gray-200">
                                  Item #{item.id}
                                </span>
                              </div>
                              <p className="text-gray-300 mt-1">
                                {item.description}
                              </p>
                              {item.failReason && (
                                <div className="mt-1 text-red-300 bg-red-900/30 p-1.5 rounded">
                                  {item.failReason}
                                </div>
                              )}
                            </div>
                            {item.isFixed && (
                              <div className="bg-green-900/30 text-green-300 border border-green-500/30 px-2 py-0.5 rounded-full text-xs flex items-center ml-2">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Fixed
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                    {inspection.items.filter((item) => item.status === "fail")
                      .length === 0 && (
                      <div className="text-center py-3 text-gray-400 text-xs">
                        No issues found in this inspection
                      </div>
                    )}
                  </div>

                  {/* View details button */}
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => handleViewDetail(inspection)}
                      className="px-3 py-1 bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded text-xs flex items-center hover:bg-blue-600/50 transition-colors"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Full Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Show more link */}
          {inspections.length >= limit && (
            <div className="text-center mt-2">
              <button
                onClick={() => onViewDetail && onViewDetail()}
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center mx-auto"
              >
                View All Inspections
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StoreInspections;
