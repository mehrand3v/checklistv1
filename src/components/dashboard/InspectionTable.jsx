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
  FileText,
  RefreshCw,
} from "lucide-react";

const InspectionTable = (props) => {
  // Destructure props
  const {
    storeId,
    dateRange,
    searchQuery,
    onSelect,
    onDelete,
    onViewIssues,
    onTotalCountChange,
  } = props;

  // Component state
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortField, setSortField] = useState("timestamp");
  const [sortDirection, setSortDirection] = useState("desc");
  const itemsPerPage = 25;

  // Load data when filters change
  useEffect(() => {
    const fetchInspections = async () => {
      setLoading(true);
      setError(null);

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

        // Update local state
        setInspections(data);
        setTotalPages(Math.ceil(total / itemsPerPage));
        setTotalItems(total);

        // Notify parent component if callback provided
        if (typeof onTotalCountChange === "function") {
          onTotalCountChange(total);
        }
      } catch (error) {
        console.error("Error fetching inspections:", error);
        setError("Failed to load inspections");
      } finally {
        setLoading(false);
      }
    };

    fetchInspections();
  }, [
    storeId,
    dateRange,
    searchQuery,
    currentPage,
    sortField,
    sortDirection,
    onTotalCountChange,
  ]);

  // Handle sort column click
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Format date for display
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

  // Render sort icon
  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>;
  };

  // Handle retry button click
  const handleRetry = () => {
    setError(null);
    setCurrentPage(1);
    // The useEffect will trigger a refetch
  };

  // Display loading state
  if (loading && inspections.length === 0) {
    return (
      <div className="py-32 text-center">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full mx-auto mb-4"></div>
        <p className="text-gray-400">Loading inspection data...</p>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-300 text-lg font-medium mb-2">{error}</p>
        <p className="text-gray-400 mb-4">
          There was an error loading the inspection data.
        </p>
        <button
          onClick={handleRetry}
          className="flex items-center justify-center px-4 py-2 mx-auto bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/60 text-left">
            <tr>
              <th
                className="p-2 sm:p-3 font-medium text-gray-300 cursor-pointer hover:text-white"
                onClick={() => handleSort("timestamp")}
              >
                <span className="hidden sm:inline">Date/Time</span>
                <span className="sm:hidden">Date</span>{" "}
                {renderSortIcon("timestamp")}
              </th>
              {/* Removed store column since we're already filtering by store */}
              <th
                className="p-2 sm:p-3 font-medium text-gray-300 cursor-pointer hover:text-white hidden sm:table-cell"
                onClick={() => handleSort("submittedBy")}
              >
                Inspector {renderSortIcon("submittedBy")}
              </th>
              <th
                className="p-2 sm:p-3 font-medium text-gray-300 cursor-pointer hover:text-white"
                onClick={() => handleSort("issueItems")}
              >
                Issues {renderSortIcon("issueItems")}
              </th>
              <th className="p-2 sm:p-3 font-medium text-gray-300 text-right">
                <span className="sr-only">Actions</span>
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
                  <td className="p-2 sm:p-3 text-xs sm:text-sm">
                    {/* Mobile: show only date, desktop: show date & time */}
                    <span className="hidden sm:inline">
                      {formatDate(inspection.timestamp)}
                    </span>
                    <span className="sm:hidden">
                      {inspection.timestamp &&
                        new Date(inspection.timestamp).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-2 sm:p-3 hidden sm:table-cell">
                    {inspection.submittedBy || "Unknown"}
                  </td>
                  <td className="p-2 sm:p-3">
                    {inspection.issueItems > 0 ? (
                      <button
                        onClick={() => onViewIssues && onViewIssues(inspection)}
                        className="flex items-center text-amber-400 hover:underline"
                      >
                        <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">
                          {inspection.issueItems}{" "}
                          {inspection.issueItems === 1 ? "issue" : "issues"}
                        </span>
                        <span className="sm:hidden">
                          {inspection.issueItems}
                        </span>
                      </button>
                    ) : (
                      <span className="flex items-center text-green-400">
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">No issues</span>
                        <span className="sm:hidden">0</span>
                      </span>
                    )}
                  </td>
                  <td className="p-2 sm:p-3 text-right space-x-1 sm:space-x-2">
                    <button
                      onClick={() => onSelect(inspection)}
                      className="inline-flex items-center px-1.5 sm:px-2 py-1 bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded hover:bg-blue-600/50 transition-colors text-xs sm:text-sm"
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                      <span className="hidden sm:inline">View</span>
                    </button>
                    <button
                      onClick={() => onDelete(inspection.id)}
                      className="inline-flex items-center px-1.5 sm:px-2 py-1 bg-red-600/30 text-red-300 border border-red-500/30 rounded hover:bg-red-600/50 transition-colors text-xs sm:text-sm"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-400">
                  <FileText className="h-10 w-10 mx-auto mb-2 text-gray-500" />
                  <p className="text-lg font-medium mb-1">
                    No inspections found
                  </p>
                  <p className="text-sm">
                    No inspection data found matching your criteria.
                  </p>
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
            Showing page {currentPage} of {totalPages} ({totalItems} total
            items)
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
