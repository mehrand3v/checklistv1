// src/router/routes.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import ErrorPage from "@/pages/ErrorPage";
import InspectionDashboard from "@/components/InspectionDashboard";
import InspectionSwipeCards from "@/components/InspectionSwipeCards";
import {
  Clipboard,
  BarChart,
  Settings,
  Store,
  LogOut,
  Menu,
  X,
  PlusCircle,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

// Layout component with sidebar and main content area
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 md:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
        onClick={() => setSidebarOpen(false)}
      >
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
        <div className="fixed inset-y-0 left-0 flex max-w-xs w-full bg-white">
          <div className="flex flex-col h-full w-full">
            <div className="flex items-center justify-between h-16 px-4 border-b">
              <h1 className="text-xl font-bold text-blue-600">Store Inspect</h1>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:bg-gray-50"
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Clipboard className="mr-3 h-5 w-5" />
                Inspections
              </NavLink>
              <NavLink
                to="/inspection/new"
                className={({ isActive }) =>
                  `flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "text-green-600 bg-green-50"
                      : "text-gray-600 hover:bg-gray-50"
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <PlusCircle className="mr-3 h-5 w-5" />
                New Inspection
              </NavLink>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:bg-gray-50"
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <BarChart className="mr-3 h-5 w-5" />
                Analytics
              </NavLink>
              <NavLink
                to="/stores"
                className={({ isActive }) =>
                  `flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:bg-gray-50"
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Store className="mr-3 h-5 w-5" />
                Stores
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:bg-gray-50"
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </NavLink>
              <div className="pt-4 mt-4 border-t border-gray-200">
                <a
                  href="#"
                  className="flex items-center px-3 py-3 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Sign Out
                </a>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 md:bg-white md:shadow-md">
        <div className="flex items-center justify-center h-16 border-b">
          <h1 className="text-xl font-bold text-blue-600">Store Inspect</h1>
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto">
          <nav className="flex-1 px-4 py-6 space-y-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              <Clipboard className="mr-3 h-5 w-5" />
              Inspections
            </NavLink>
            <NavLink
              to="/inspection/new"
              className={({ isActive }) =>
                `flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "text-green-600 bg-green-50"
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              <PlusCircle className="mr-3 h-5 w-5" />
              New Inspection
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              <BarChart className="mr-3 h-5 w-5" />
              Analytics
            </NavLink>
            <NavLink
              to="/stores"
              className={({ isActive }) =>
                `flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              <Store className="mr-3 h-5 w-5" />
              Stores
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </NavLink>
          </nav>
          <div className="px-4 py-4 border-t border-gray-200">
            <a
              href="#"
              className="flex items-center px-3 py-3 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </a>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navbar */}
        <header className="bg-white shadow-sm lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-medium text-blue-600">Store Inspect</h1>
            <div className="w-6"></div> {/* Spacer to center the title */}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Placeholder component for pages under development
const ComingSoon = () => (
  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
    <h1 className="text-2xl font-semibold text-gray-800 mb-4">Coming Soon</h1>
    <p className="text-gray-600 max-w-md">
      This feature is currently under development and will be available in a
      future update.
    </p>
  </div>
);

// Home page with inspection list and "Start New Inspection" button
const InspectionHome = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inspections</h1>
        <button
          onClick={() => navigate("/inspection/new")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          New Inspection
        </button>
      </div>

      <InspectionDashboard />
    </div>
  );
};

// Define application routes
const routes = [
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <InspectionHome />,
      },
      {
        path: "inspection/new",
        element: (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <InspectionSwipeCards
              onComplete={() => (window.location.href = "/")}
            />
          </div>
        ),
      },
      {
        path: "inspection/:inspectionId",
        element: (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <InspectionDashboard view="details" />
          </div>
        ),
      },
      {
        path: "dashboard",
        element: (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Analytics Dashboard
            </h1>
            <InspectionDashboard />
          </div>
        ),
      },
      {
        path: "stores",
        element: <ComingSoon />,
      },
      {
        path: "settings",
        element: <ComingSoon />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
];

export default routes;
