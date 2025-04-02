// components/dashboard/DashboardMobileMenu.jsx
import React from "react";
import { LogOut } from "lucide-react";

const DashboardMobileMenu = ({ user, onLogout }) => {
  return (
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
          onClick={onLogout}
          className="w-full flex items-center px-3 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default DashboardMobileMenu;
