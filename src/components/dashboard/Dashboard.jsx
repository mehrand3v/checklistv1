// components/dashboard/Dashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "@/services/auth";
import { logPageView, logCustomEvent } from "@/services/analytics";
import jsPDF from "jspdf";
import {
  ClipboardCheck,
  LogOut,
  Menu,
  X,
  BarChart2,
  FileText,
  Settings,
  Calendar,
  Search,
  Trash2,
  Edit,
  AlertCircle,
  Home,
  File,
  Store,
  Download,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";

// Import dashboard components
import InspectionStats from "./InspectionStats";
import StoreSelector from "./StoreSelector";
import InspectionTrends from "./InspectionTrends";
import InspectionTable from "./InspectionTable";
import InspectionDetail from "./InspectionDetail";
import CommonIssuesChart from "./CommonIssuesChart";
import StorePerformance from "./StorePerformance";
import DateRangePicker from "./DateRangePicker";
import StoreInspections from "./StoreInspections";

const Dashboard = () => {
  const navigate = useNavigate();
  const dashboardRef = useRef(null);

  // State variables
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("inspections"); // inspections, analytics, settings
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [exportLoading, setExportLoading] = useState(false);

  // Custom notification function
  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Function to get store name without loading inspections
  const getStoreName = (storeId) => {
    // This is a simple fallback if we don't have inspection data yet
    return "Store #" + storeId;
  };

  // Function to show issues directly
  const handleViewIssues = (inspection) => {
    // Filter only the failed items for this inspection
    if (inspection.items) {
      const failedItems = inspection.items.filter(
        (item) => item.status === "fail"
      );
      if (failedItems.length > 0) {
        // Set the selected inspection and view its details
        setSelectedInspection({
          ...inspection,
          items: failedItems, // Only show the failed items
        });
      } else {
        showNotification("No issues found for this inspection", "info");
      }
    } else {
      showNotification("No detailed item data available", "warning");
    }
  };

  useEffect(() => {
    // Log page view
    logPageView("admin_dashboard");

    // Check if user is authenticated
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate("/login");
      return;
    }

    setUser(currentUser);

    // Set default date range to last 30 days
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    setDateRange({ start, end });

    setLoading(false);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      logCustomEvent("user_logout");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setError("Failed to log out. Please try again.");
    }
  };

  const handleStoreChange = (storeId) => {
    setSelectedStore(storeId);
    // Reset selected inspection when changing store
    setSelectedInspection(null);
    // Reset to first page when changing filters
    setCurrentPage(1);
    logCustomEvent("store_filter_changed", { store_id: storeId });
  };

  const handleInspectionSelect = (inspection) => {
    setSelectedInspection(inspection);
    setActiveTab("inspections"); // Switch to inspections tab when selecting an inspection
    logCustomEvent("inspection_selected", { inspection_id: inspection.id });
  };

  const handleInspectionDelete = async (inspectionId) => {
    try {
      // In a real app, you would call a service to delete the inspection
      // await deleteInspection(inspectionId);

      // For now, we'll just log the deletion
      console.log("Delete inspection:", inspectionId);

      // Reset selected inspection if the deleted one was selected
      if (selectedInspection && selectedInspection.id === inspectionId) {
        setSelectedInspection(null);
      }

      // Show success notification
      showNotification("Inspection deleted successfully", "success");

      logCustomEvent("inspection_deleted", { inspection_id: inspectionId });
    } catch (error) {
      console.error("Error deleting inspection:", error);
      setError("Failed to delete inspection. Please try again.");
    }
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    // Reset to first page when changing filters
    setCurrentPage(1);
    logCustomEvent("date_range_changed", {
      start: range.start.toISOString(),
      end: range.end.toISOString(),
    });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Reset to first page when changing filters
    setCurrentPage(1);
    logCustomEvent("inspection_search", { query });
  };

  const clearError = () => {
    setError(null);
  };

  // Handle export to PDF functionality
  const handleExportToPDF = async () => {
    try {
      setExportLoading(true);

      // Create a new PDF document
      const pdf = new jsPDF("p", "mm", "a4");

      // Add title
      pdf.setFontSize(20);
      pdf.text("Inspection Report", 105, 15, { align: "center" });

      // Add store info and date range
      pdf.setFontSize(12);
      const storeName =
        selectedStore === "all"
          ? "All Stores"
          : inspections.length > 0
          ? inspections[0].storeName
          : getStoreName(selectedStore);

      pdf.text(`Store: ${storeName}`, 20, 30);
      pdf.text(
        `Date Range: ${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`,
        20,
        40
      );
      pdf.text(`Total Inspections: ${totalCount}`, 20, 50);

      // Add table headers
      pdf.setFontSize(10);
      pdf.text("Date", 20, 70);
      pdf.text("Inspector", 70, 70);
      pdf.text("Issues", 120, 70);
      pdf.text("Status", 160, 70);

      // Add line under headers
      pdf.line(20, 72, 190, 72);

      // Add table data
      let y = 80;

      // Use the current inspections data available
      const exportData = inspections.slice(0, 20); // Limit to 20 rows

      exportData.forEach((inspection, index) => {
        const date =
          inspection.timestamp instanceof Date
            ? inspection.timestamp.toLocaleDateString()
            : new Date(inspection.timestamp).toLocaleDateString();

        pdf.text(date, 20, y);
        pdf.text(inspection.submittedBy || "Unknown", 70, y);
        pdf.text(inspection.issueItems?.toString() || "0", 120, y);
        pdf.text(inspection.issueItems > 0 ? "Issues Found" : "Passed", 160, y);

        y += 10;

        // Add new page if needed
        if (y > 280 && index < exportData.length - 1) {
          pdf.addPage();
          y = 20;
          // Add headers on new page
          pdf.text("Date", 20, y);
          pdf.text("Inspector", 70, y);
          pdf.text("Issues", 120, y);
          pdf.text("Status", 160, y);
          pdf.line(20, y + 2, 190, y + 2);
          y += 10;
        }
      });

      // Add footer with date
      const currentDate = new Date().toLocaleDateString();
      pdf.setFontSize(8);
      pdf.text(`Generated on: ${currentDate}`, 20, 290);

      // Save PDF
      pdf.save(`inspection-report-${currentDate}.pdf`);

      showNotification("PDF exported successfully", "success");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      showNotification("Failed to export PDF", "error");
    } finally {
      setExportLoading(false);
    }
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of the element on page change
    if (dashboardRef.current) {
      dashboardRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value, 10);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page

    // Update settings
    logCustomEvent("items_per_page_changed", { value: newItemsPerPage });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <svg
            className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={dashboardRef}
      className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 text-gray-200 overflow-auto touch-auto"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {/* Header */}
      <header className="bg-gray-800/40 backdrop-blur-sm border-b border-gray-700/50 shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <ClipboardCheck className="h-7 w-7 text-blue-400 mr-2" />
            <h1 className="text-xl font-bold text-gray-200">
              Inspection Dashboard
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            {/* Home button */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center px-3 py-2 bg-gray-800/60 text-gray-300 border border-gray-700/50 rounded-lg hover:bg-gray-700/60 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span className="ml-2 hidden sm:inline">Home</span>
            </button>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-gray-300 flex items-center">
                <div className="w-8 h-8 bg-blue-900/50 border border-blue-500/30 rounded-full flex items-center justify-center mr-2">
                  {user?.email?.charAt(0).toUpperCase() || "A"}
                </div>
                <span>{user?.email || "Admin User"}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-300 hover:bg-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-800/80 border-b border-gray-700/50 z-30">
          <div className="container mx-auto px-4 py-3 space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-700/50">
              <div className="text-gray-300 flex items-center">
                <div className="w-8 h-8 bg-blue-900/50 border border-blue-500/30 rounded-full flex items-center justify-center mr-2">
                  {user?.email?.charAt(0).toUpperCase() || "A"}
                </div>
                <span className="text-sm">{user?.email || "Admin User"}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div className="container mx-auto px-4 py-2">
          <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-gray-400 hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Toast notification system */}
      {notification && (
        <div
          className={`fixed left-1/2 bottom-6 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm flex items-center ${
            notification.type === "success"
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 border border-emerald-300"
              : notification.type === "error"
              ? "bg-gradient-to-r from-red-500 to-red-600 border border-red-300"
              : notification.type === "warning"
              ? "bg-gradient-to-r from-amber-500 to-amber-600 border border-amber-300"
              : "bg-gradient-to-r from-blue-500 to-blue-600 border border-blue-300"
          }`}
        >
          {notification.type === "success" && (
            <CheckCircle className="w-4 h-4 mr-2" />
          )}
          {notification.type === "error" && (
            <AlertCircle className="w-4 h-4 mr-2" />
          )}
          {notification.type === "warning" && (
            <AlertCircle className="w-4 h-4 mr-2" />
          )}
          {notification.message}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex border-b border-gray-700/50 mb-4 overflow-x-auto hide-scrollbar">
          <button
            className={`px-4 py-2 font-medium text-sm mr-2 whitespace-nowrap ${
              activeTab === "inspections"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setActiveTab("inspections")}
          >
            <FileText className="h-4 w-4 inline mr-1" />
            Inspections
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm mr-2 whitespace-nowrap ${
              activeTab === "analytics"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setActiveTab("analytics")}
          >
            <BarChart2 className="h-4 w-4 inline mr-1" />
            Analytics
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "settings"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="h-4 w-4 inline mr-1" />
            Settings
          </button>
        </div>

        {/* Common filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <div className="w-full sm:w-auto">
            <StoreSelector
              selectedStore={selectedStore}
              onStoreChange={handleStoreChange}
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <DateRangePicker
              range={dateRange}
              onChange={handleDateRangeChange}
            />

            <div className="relative w-full sm:w-auto flex-grow">
              <input
                type="text"
                placeholder="Search inspections..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full py-2 px-4 pl-10 bg-gray-800/40 border border-gray-700/50 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            </div>

            {/* Export button */}
            {activeTab === "inspections" && !selectedInspection && (
              <button
                onClick={handleExportToPDF}
                disabled={exportLoading || inspections.length === 0}
                className="flex items-center px-3 py-2 bg-indigo-600/40 text-indigo-200 border border-indigo-500/30 rounded-lg hover:bg-indigo-600/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed sm:whitespace-nowrap"
              >
                {exportLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                <span className="hidden sm:inline">Export PDF</span>
                <span className="sm:hidden">PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Selected store display and total count */}
        {selectedStore !== "all" && (
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-3 mb-4 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
            <div className="flex items-center">
              <Store className="h-5 w-5 text-blue-400 mr-2" />
              <span className="text-gray-300 font-medium">
                Selected Store:{" "}
                <span className="text-white">
                  {inspections.length > 0
                    ? inspections[0].storeName
                    : getStoreName(selectedStore)}
                </span>
              </span>
            </div>
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-purple-400 mr-2" />
              <span className="text-gray-300">
                Total Records:{" "}
                <span className="text-white font-medium">
                  {totalCount || 0}
                </span>
              </span>
            </div>
          </div>
        )}

        {/* Dashboard content based on active tab */}
        {activeTab === "inspections" && (
          <div className="mb-6">
            {/* Recent inspections - MOVED TO MAIN DASHBOARD */}
            {!selectedInspection && (
              <div className="mb-6">
                <StoreInspections
                  selectedStore={selectedStore}
                  dateRange={dateRange}
                  limit={5}
                />
              </div>
            )}

            {/* Inspection data table or detail view */}
            {selectedInspection ? (
              /* Inspection detail view */
              <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
                <InspectionDetail
                  inspection={selectedInspection}
                  onBack={() => setSelectedInspection(null)}
                  onDelete={handleInspectionDelete}
                />
              </div>
            ) : (
              /* Inspection table */
              <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden">
                <InspectionTable
                  storeId={selectedStore}
                  dateRange={dateRange}
                  searchQuery={searchQuery}
                  onSelect={handleInspectionSelect}
                  onDelete={handleInspectionDelete}
                  onViewIssues={handleViewIssues}
                  onTotalCountChange={setTotalCount}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onTotalPagesChange={setTotalPages}
                />

                {/* Enhanced pagination controls */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center p-4 border-t border-gray-700/50">
                    <div className="text-sm text-gray-400">
                      Showing page {currentPage} of {totalPages} ({totalCount}{" "}
                      total items)
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="px-2 py-1 bg-gray-800 border border-gray-700 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="First page"
                      >
                        <ChevronLeft className="h-3 w-3" />
                        <ChevronLeft className="h-3 w-3 -ml-1" />
                      </button>
                      <button
                        onClick={() =>
                          handlePageChange(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-gray-800 border border-gray-700 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </button>

                      {/* Page numbers */}
                      <div className="hidden sm:flex space-x-1">
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                          // Show pages around current page
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          if (pageNum > 0 && pageNum <= totalPages) {
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`w-8 h-8 flex items-center justify-center rounded ${
                                  currentPage === pageNum
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-800 text-gray-300 border border-gray-700"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                          return null;
                        })}
                      </div>

                      <button
                        onClick={() =>
                          handlePageChange(
                            Math.min(totalPages, currentPage + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-gray-800 border border-gray-700 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="px-2 py-1 bg-gray-800 border border-gray-700 rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Last page"
                      >
                        <ChevronRight className="h-3 w-3" />
                        <ChevronRight className="h-3 w-3 -ml-1" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "analytics" && (
          <div>
            {/* Statistics cards - MOVED TO ANALYTICS PAGE */}
            <div className="mb-6">
              <InspectionStats storeId={selectedStore} dateRange={dateRange} />
            </div>

            {/* Analytics charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div className="lg:col-span-2 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
                <InspectionTrends
                  storeId={selectedStore}
                  dateRange={dateRange}
                />
              </div>
              <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
                <CommonIssuesChart
                  storeId={selectedStore}
                  dateRange={dateRange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
                <StorePerformance dateRange={dateRange} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Settings</h2>
            <p className="text-gray-400 mb-6">
              Configure dashboard settings and preferences here.
            </p>

            {/* Settings form */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Default Date Range
                  </label>
                  <select
                    defaultValue="30"
                    className="w-full py-2 px-3 bg-gray-800/60 border border-gray-700/50 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="365">Last year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Items Per Page
                  </label>
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="w-full py-2 px-3 bg-gray-800/60 border border-gray-700/50 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Default View
                  </label>
                  <select
                    defaultValue="inspections"
                    className="w-full py-2 px-3 bg-gray-800/60 border border-gray-700/50 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="inspections">Inspections</option>
                    <option value="analytics">Analytics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Notifications
                  </label>
                  <div className="space-y-2 mt-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={true}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-300 text-sm">
                        Show success notifications
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={true}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-300 text-sm">
                        Show error notifications
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Export Settings
                </label>
                <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-3">
                    Configure PDF export settings for inspection reports
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Include Inspection Details
                      </label>
                      <select
                        defaultValue="summary"
                        className="w-full py-2 px-3 bg-gray-700/60 border border-gray-600/50 rounded-lg text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="summary">Summary only</option>
                        <option value="basic">Basic details</option>
                        <option value="full">Full details</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Paper Size
                      </label>
                      <select
                        defaultValue="a4"
                        className="w-full py-2 px-3 bg-gray-700/60 border border-gray-600/50 rounded-lg text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="a4">A4</option>
                        <option value="letter">Letter</option>
                        <option value="legal">Legal</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={true}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-300 text-sm">
                        Include company logo
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4"
                onClick={() => {
                  // Save settings
                  showNotification("Settings saved successfully", "success");
                }}
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
