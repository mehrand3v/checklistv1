// components/dashboard/Dashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "@/services/auth";
import { logPageView, logCustomEvent } from "@/services/analytics";

// Import dashboard components
import DashboardHeader from "./DashboardHeader";
import DashboardMobileMenu from "./DashboardMobileMenu";
import DashboardFilters from "./DashboardFilters";
import DashboardTabs from "./DashboardTabs";
import InspectionsTab from "./tabs/InspectionsTab";
import AnalyticsTab from "./tabs/AnalyticsTab";
import SettingsTab from "./tabs/SettingsTab";
import Notification from "./ui/Notification";

const Dashboard = () => {
  const navigate = useNavigate();
  const dashboardRef = useRef(null);

  // State variables
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("inspections");
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Settings state
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showSuccessNotifications, setShowSuccessNotifications] =
    useState(true);
  const [showErrorNotifications, setShowErrorNotifications] = useState(true);
  const [includeLogo, setIncludeLogo] = useState(true);
  const [exportDetailLevel, setExportDetailLevel] = useState("summary");
  const [paperSize, setPaperSize] = useState("a4");

  // Custom notification function
  const showNotification = (message, type = "info") => {
    // Skip if notifications are disabled in settings
    if (type === "success" && !showSuccessNotifications) return;
    if (type === "error" && !showErrorNotifications) return;

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
    logCustomEvent("store_filter_changed", { store_id: storeId });
  };

  const handleInspectionSelect = (inspection) => {
    setSelectedInspection(inspection);
    setActiveTab("inspections"); // Switch to inspections tab when selecting an inspection

    // Fix: Add null check before accessing inspection.id
    if (inspection && inspection.id !== undefined) {
      logCustomEvent("inspection_selected", { inspection_id: inspection.id });
    } else {
      console.warn(
        "Attempted to select an undefined inspection or one without an ID"
      );
      showNotification("Unable to load inspection details", "warning");
    }
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    logCustomEvent("date_range_changed", {
      start: range.start.toISOString(),
      end: range.end.toISOString(),
    });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    logCustomEvent("inspection_search", { query });
  };

  const clearError = () => {
    setError(null);
  };

  const handleSaveSettings = () => {
    // In a real app, save settings to localStorage or backend
    showNotification("Settings saved successfully", "success");
    logCustomEvent("settings_saved", {
      itemsPerPage,
      showSuccessNotifications,
      showErrorNotifications,
      includeLogo,
      exportDetailLevel,
      paperSize,
    });
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

  const getFilteredStoreName = () => {
    return selectedStore === "all" ? "All Stores" : getStoreName(selectedStore);
  };

  return (
    <div
      ref={dashboardRef}
      className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 text-gray-200 overflow-auto touch-auto"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {/* Header */}
      <DashboardHeader
        user={user}
        onLogout={handleLogout}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        mobileMenuOpen={mobileMenuOpen}
        navigate={navigate}
      />

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <DashboardMobileMenu user={user} onLogout={handleLogout} />
      )}

      {/* Error notification */}
      {error && (
        <div className="container mx-auto px-4 py-2">
          <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3 flex items-start">
            <div className="flex-1">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-gray-400 hover:text-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Toast notification system */}
      {notification && <Notification notification={notification} />}

      {/* Tab Navigation */}
      <div className="container mx-auto px-4 py-4">
        <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Common filters */}
        <DashboardFilters
          selectedStore={selectedStore}
          onStoreChange={handleStoreChange}
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          activeTab={activeTab}
          selectedInspection={selectedInspection}
        />

        {/* Selected store display and total count */}
        {selectedStore !== "all" && totalCount > 0 && (
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-3 mb-4 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-400 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span className="text-gray-300 font-medium">
                Selected Store:{" "}
                <span className="text-white">{getFilteredStoreName()}</span>
              </span>
            </div>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-purple-400 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span className="text-gray-300">
                Total Records:{" "}
                <span className="text-white font-medium">
                  {totalCount || 0}
                </span>
              </span>
            </div>
          </div>
        )}

        {/* Tab content */}
        {activeTab === "inspections" && (
          <InspectionsTab
            selectedStore={selectedStore}
            dateRange={dateRange}
            searchQuery={searchQuery}
            selectedInspection={selectedInspection}
            onSelectInspection={handleInspectionSelect}
            itemsPerPage={itemsPerPage}
            onTotalCountChange={setTotalCount}
            showNotification={showNotification}
            dashboardRef={dashboardRef}
            exportOptions={{
              detailLevel: exportDetailLevel,
              paperSize,
              includeLogo,
            }}
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsTab selectedStore={selectedStore} dateRange={dateRange} />
        )}

        {activeTab === "settings" && (
          <SettingsTab
            settings={{
              itemsPerPage,
              showSuccessNotifications,
              showErrorNotifications,
              includeLogo,
              exportDetailLevel,
              paperSize,
            }}
            onChangeSettings={{
              setItemsPerPage,
              setShowSuccessNotifications,
              setShowErrorNotifications,
              setIncludeLogo,
              setExportDetailLevel,
              setPaperSize,
            }}
            onSave={handleSaveSettings}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
