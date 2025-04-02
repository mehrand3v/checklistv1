// components/dashboard/DashboardHeader.jsx
import React from "react";
import { ClipboardCheck, LogOut, Menu, X, Home } from "lucide-react";

const DashboardHeader = ({
  user,
  onLogout,
  onToggleMobileMenu,
  mobileMenuOpen,
  navigate,
}) => {
  return (
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
              onClick={onLogout}
              className="flex items-center px-3 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-300 hover:bg-gray-700"
            onClick={onToggleMobileMenu}
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
  );
};

export default DashboardHeader;
