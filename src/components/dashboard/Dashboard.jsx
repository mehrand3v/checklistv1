// components/dashboard/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "@/services/auth";
import {
  logPageView,
  logCustomEvent,
  ANALYTICS_EVENTS,
} from "@/services/analytics";
import {
  ClipboardCheck,
  LogOut,
  Menu,
  X,
  Home,
  BarChart2,
  Clock,
  AlertTriangle,
} from "lucide-react";

// Import dashboard components
import InspectionStats from "./InspectionStats";
import StoreSelector from "./StoreSelector";
import InspectionTrends from "./InspectionTrends";
import RecentInspections from "./RecentInspections";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
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

    // Set up screen width listener
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
    logCustomEvent(ANALYTICS_EVENTS.FEATURE_USED, {
      feature: "store_filter",
      store_id: storeId,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
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
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900">
      {/* Mobile notice for small screens */}
      {screenWidth < 768 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 md:hidden">
          <div className="flex">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <p className="text-sm text-yellow-700">
                This dashboard is optimized for larger screens. For the best
                experience, please use a tablet or desktop.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-gray-800/40 backdrop-blur-sm border-b border-gray-700/50 shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <ClipboardCheck className="h-7 w-7 text-blue-600 mr-2" />
            <h1 className="text-xl font-bold text-gray-800">
              Inspection Dashboard
            </h1>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
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
            <div className="text-gray-700 flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
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
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3 space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="text-gray-700 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm">{user.email}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Dashboard content */}
      <div className="container mx-auto px-4 py-6">
        {/* Store selector */}
        <div className="mb-6">
          <StoreSelector
            selectedStore={selectedStore}
            onStoreChange={handleStoreChange}
          />
        </div>

        {/* Statistics cards */}
        <div className="mb-6">
          <InspectionStats storeId={selectedStore} />
        </div>

        {/* Charts and tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <InspectionTrends storeId={selectedStore} />
          </div>
          <div>
            <RecentInspections storeId={selectedStore} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
