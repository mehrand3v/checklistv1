// components/dashboard/InspectionTable.jsx
import React, { useState, useEffect } from "react";
import { getInspections } from "@/services/inspections/inspectionService";
import {
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const InspectionTable = ({
  storeId,
  dateRange,
  searchQuery,
  onSelect,
  onDelete,
}) => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState("timestamp");
  const [sortDirection, setSortDirection] = useState("desc");
  const itemsPerPage = 25;

  useEffect(() => {
    const fetchInspections = async () => {
      setLoading(true);
      try {
        const { data, total } = await getInspections({
          storeId,
          startDate: dateRange.start,
          endDate: dateRange.end,
          searchQuery,
          page: currentPage,
          itemsPerPage,
          sortField,
          sortDirection,
        });

        setInspections(data);
        setTotalPages(Math.ceil(total / itemsPerPage));
      } catch (error) {
        console.error("Error fetching inspections:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInspections();
  }, [storeId, dateRange, searchQuery, currentPage, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "—";

    try {
      // Handle different timestamp formats
      let date;
      if (timestamp?.toDate) {
        date = timestamp.toDate();
      } else if (typeof timestamp === "string") {
        date = new Date(timestamp);
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        return "Invalid date";
      }

      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (e) {
      console.error("Date formatting error:", e);
      return "Invalid date";
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;

    return <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>;
  };

  if (loading && inspections.length === 0) {
    return (
      <div className="py-32 text-center">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full mx-auto mb-4"></div>
        <p className="text-gray-400">Loading inspection data...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-800/60 text-left">
              <th
                className="p-3 font-medium text-gray-300 cursor-pointer hover:text-white"
                onClick={() => handleSort("timestamp")}
              >
                Date/Time {renderSortIcon("timestamp")}
              </th>
              <th
                className="p-3 font-medium text-gray-300 cursor-pointer hover:text-white"
                onClick={() => handleSort("storeName")}
              >
                Store {renderSortIcon("storeName")}
              </th>
              <th
                className="p-3 font-medium text-gray-300 cursor-pointer hover:text-white"
                onClick={() => handleSort("submittedBy")}
              >
                Inspector {renderSortIcon("submittedBy")}
              </th>
              <th
                className="p-3 font-medium text-gray-300 cursor-pointer hover:text-white"
                onClick={() => handleSort("issueItems")}
              >
                Issues {renderSortIcon("issueItems")}
              </th>
              <th className="p-3 font-medium text-gray-300 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {inspections.length > 0 ? (
              inspections.map((inspection) => (
                <tr
                  key={inspection.id}
                  className="hover:bg-gray-700/30 transition-colors"
                >
                  <td className="p-3 text-sm">
                    {formatDate(inspection.timestamp)}
                  </td>
                  <td className="p-3">
                    {inspection.storeName || "Unknown Store"}
                  </td>
                  <td className="p-3">{inspection.submittedBy || "Unknown"}</td>
                  <td className="p-3">
                    {inspection.issueItems > 0 ? (
                      <span className="flex items-center text-amber-400">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {inspection.issueItems}{" "}
                        {inspection.issueItems === 1 ? "issue" : "issues"}
                      </span>
                    ) : (
                      <span className="flex items-center text-green-400">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        No issues
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => onSelect(inspection)}
                      className="inline-flex items-center px-2 py-1 bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded hover:bg-blue-600/50 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => onDelete(inspection.id)}
                      className="inline-flex items-center px-2 py-1 bg-red-600/30 text-red-300 border border-red-500/30 rounded hover:bg-red-600/50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-400">
                  No inspection data found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center p-4 border-t border-gray-700/50">
          <div className="text-sm text-gray-400">
            Showing page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-800 border border-gray-700 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-800 border border-gray-700 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionTable;
