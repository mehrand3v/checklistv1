// components/dashboard/DashboardFilters.jsx
import React from "react";
import { Search, Download, RefreshCw } from "lucide-react";
import StoreSelector from "./StoreSelector";
import DateRangePicker from "./DateRangePicker";

const DashboardFilters = ({
  selectedStore,
  onStoreChange,
  dateRange,
  onDateRangeChange,
  searchQuery,
  onSearchChange,
  activeTab,
  selectedInspection,
  exportPdf,
  exportLoading,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
      <div className="w-full sm:w-auto">
        <StoreSelector
          selectedStore={selectedStore}
          onStoreChange={onStoreChange}
        />
      </div>

      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
        <DateRangePicker range={dateRange} onChange={onDateRangeChange} />

        <div className="relative w-full sm:w-auto flex-grow">
          <input
            type="text"
            placeholder="Search inspections..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full py-2 px-4 pl-10 bg-gray-800/40 border border-gray-700/50 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        </div>

        {/* Export button - only on inspections tab and when no inspection is selected */}
        {activeTab === "inspections" && !selectedInspection && exportPdf && (
          <button
            onClick={exportPdf}
            disabled={exportLoading}
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
  );
};

export default DashboardFilters;
