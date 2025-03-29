// src/components/InspectionDashboard.js
import React, { useState, useEffect } from "react";
import { logPageView } from "@/services/analytics";
import useInspections from "@/hooks/useInspections";
import InspectionSwipeCards from "./InspectionSwipeCards";

const InspectionDashboard = () => {
  const [view, setView] = useState("dashboard");
  const [selectedInspection, setSelectedInspection] = useState(null);

  // Use our custom hook to manage inspections
  const { inspections, stats, loading, error, getInspection } =
    useInspections();

  // Log page view
  useEffect(() => {
    logPageView("inspection_dashboard");
  }, []);

  // Handle inspection row click
  const handleInspectionClick = async (inspectionId) => {
    try {
      // Find in existing data first
      let inspection = inspections.find((i) => i.id === inspectionId);

      // If not in memory, get from Firestore
      if (!inspection) {
        inspection = await getInspection(inspectionId);
      }

      if (inspection) {
        setSelectedInspection(inspection);
        setView("details");
      }
    } catch (error) {
      console.error("Error getting inspection details:", error);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Dashboard View */}
      {view === "dashboard" && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h1 className="text-2xl font-bold mb-4 sm:mb-0">
              Inspection Dashboard
            </h1>
            <button
              onClick={() => setView("new")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Start New Inspection
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">
                Total Inspections
              </h3>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">This Week</h3>
              <p className="text-3xl font-bold">{stats.thisWeek}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Pass Rate</h3>
              <p className="text-3xl font-bold">{stats.passRate}%</p>
            </div>
          </div>

          {/* Recent Inspections */}
          <h2 className="text-xl font-bold mb-4">Recent Inspections</h2>

          {loading ? (
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading inspections...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700 mb-4">
              <p>Error loading inspections: {error}</p>
            </div>
          ) : inspections.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <p className="text-gray-500 mb-4">No inspections found</p>
              <button
                onClick={() => setView("new")}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Start Your First Inspection
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pass Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inspections.map((inspection) => (
                    <tr
                      key={inspection.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleInspectionClick(inspection.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDate(inspection.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {inspection.totalItems || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {inspection.totalItems > 0
                          ? `${Math.round(
                              (inspection.passedItems / inspection.totalItems) *
                                100
                            )}%`
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            inspection.failedItems > 0
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {inspection.failedItems > 0
                            ? "Issues Found"
                            : "All Passed"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* New Inspection View */}
      {view === "new" && (
        <div>
          <div className="flex items-center mb-6">
            <button
              onClick={() => setView("dashboard")}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <h1 className="text-2xl font-bold">New Inspection</h1>
          </div>

          <InspectionSwipeCards onComplete={() => setView("dashboard")} />
        </div>
      )}

      {/* Inspection Details View */}
      {view === "details" && selectedInspection && (
        <div>
          <div className="flex items-center mb-6">
            <button
              onClick={() => {
                setView("dashboard");
                setSelectedInspection(null);
              }}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <h1 className="text-2xl font-bold">Inspection Details</h1>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date</h3>
                <p className="text-lg">
                  {formatDate(selectedInspection.timestamp)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <span
                  className={`px-2 py-1 inline-flex text-sm font-semibold rounded-full ${
                    selectedInspection.failedItems > 0
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {selectedInspection.failedItems > 0
                    ? "Issues Found"
                    : "All Passed"}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Items Inspected
                </h3>
                <p className="text-lg">{selectedInspection.totalItems}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Pass Rate</h3>
                <p className="text-lg">
                  {selectedInspection.totalItems > 0
                    ? `${Math.round(
                        (selectedInspection.passedItems /
                          selectedInspection.totalItems) *
                          100
                      )}%`
                    : "N/A"}
                </p>
              </div>
            </div>

            <h3 className="text-lg font-bold mb-4">Inspection Results</h3>

            {selectedInspection.items && selectedInspection.items.length > 0 ? (
              <div className="space-y-4">
                {selectedInspection.items
                  .sort((a, b) => (a.status === "fail" ? -1 : 1)) // Failed items first
                  .map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-lg ${
                        item.status === "fail"
                          ? "bg-red-50 border border-red-200"
                          : "bg-green-50 border border-green-200"
                      }`}
                    >
                      <div className="flex items-start">
                        <div
                          className={`mr-4 mt-1 ${
                            item.status === "fail"
                              ? "text-red-500"
                              : "text-green-500"
                          }`}
                        >
                          {item.status === "fail" ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.description}</h4>
                          {item.failReason && (
                            <div className="mt-2">
                              <h5 className="text-sm font-medium text-red-800">
                                Issue Details:
                              </h5>
                              <p className="text-sm text-gray-700 mt-1">
                                {item.failReason}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500">
                No detailed results available for this inspection.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionDashboard;
