// components/dashboard/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "@/services/auth";
import { logPageView, logCustomEvent } from "@/services/analytics";
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

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("inspections"); // inspections, analytics, settings
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

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
    setLoading(false);

    // Set default date range to last 30 days
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    setDateRange({ start, end });
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      logCustomEvent("user_logout");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
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
    logCustomEvent("inspection_selected", { inspection_id: inspection.id });
  };

  const handleInspectionDelete = (inspectionId) => {
    // Add your delete logic here
    console.log("Delete inspection:", inspectionId);
    // Reset selected inspection if the deleted one was selected
    if (selectedInspection && selectedInspection.id === inspectionId) {
      setSelectedInspection(null);
    }
    logCustomEvent("inspection_deleted", { inspection_id: inspectionId });
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 text-gray-200">
      {/* Header */}
      <header className="bg-gray-800/40 backdrop-blur-sm border-b border-gray-700/50 shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <ClipboardCheck className="h-7 w-7 text-blue-400 mr-2" />
            <h1 className="text-xl font-bold text-gray-200">
              Inspection Dashboard
            </h1>
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

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-gray-300 flex items-center">
              <div className="w-8 h-8 bg-blue-900/50 border border-blue-500/30 rounded-full flex items-center justify-center mr-2">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <span>{user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-800/80 border-b border-gray-700/50">
          <div className="container mx-auto px-4 py-3 space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-700/50">
              <div className="text-gray-300 flex items-center">
                <div className="w-8 h-8 bg-blue-900/50 border border-blue-500/30 rounded-full flex items-center justify-center mr-2">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm">{user.email}</span>
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

      {/* Tab Navigation */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex border-b border-gray-700/50 mb-4">
          <button
            className={`px-4 py-2 font-medium text-sm mr-2 ${
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
            className={`px-4 py-2 font-medium text-sm mr-2 ${
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
            className={`px-4 py-2 font-medium text-sm ${
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

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <DateRangePicker
              range={dateRange}
              onChange={handleDateRangeChange}
            />

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search inspections..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full py-2 px-4 pl-10 bg-gray-800/40 border border-gray-700/50 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Dashboard content based on active tab */}
        {activeTab === "inspections" && (
          <div className="mb-6">
            {/* Statistics cards */}
            <div className="mb-6">
              <InspectionStats storeId={selectedStore} dateRange={dateRange} />
            </div>

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
                />
              </div>
            )}
          </div>
        )}

        {activeTab === "analytics" && (
          <div>
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
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
              <StorePerformance dateRange={dateRange} />
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Settings</h2>
            <p className="text-gray-400 mb-4">
              Configure dashboard settings and preferences here.
            </p>

            {/* Settings form placeholder */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Default Date Range
                </label>
                <select className="w-full py-2 px-3 bg-gray-800/60 border border-gray-700/50 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="7">Last 7 days</option>
                  <option value="30" selected>
                    Last 30 days
                  </option>
                  <option value="90">Last 90 days</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Items Per Page
                </label>
                <select className="w-full py-2 px-3 bg-gray-800/60 border border-gray-700/50 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="10">10</option>
                  <option value="25" selected>
                    25
                  </option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>

              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4">
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
