// components/dashboard/DashboardTabs.jsx
import React from "react";
import { FileText, BarChart2, Settings } from "lucide-react";

const DashboardTabs = ({ activeTab, setActiveTab }) => {
  return (
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
  );
};

export default DashboardTabs;
