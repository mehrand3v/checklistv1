// InspectionHeader.jsx - Header with progress information, modern design
import React from "react";
import {
  CheckCircle,
  XCircle,
  ChevronLeft,
  ClipboardCheck,
  BarChart2,
  Plus,
} from "lucide-react";

const InspectionHeader = ({
  stats,
  viewMode,
  setView,
  hasResults,
  onStartNew,
  isCompleted,
}) => {
  return (
    <header className="w-full max-w-md bg-white rounded-xl shadow-md p-3 mb-3 border border-gray-100">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          {viewMode !== "inspection" && (
            <button
              onClick={() => setView("inspection")}
              className="mr-2 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <h1
            className={`text-lg font-bold ${
              viewMode === "inspection" ? "text-blue-600" : "text-gray-800"
            }`}
          >
            {viewMode === "inspection" ? (
              <>Quality Check</>
            ) : viewMode === "history" ? (
              <>Inspection Summary</>
            ) : (
              <>Item Details</>
            )}
          </h1>
        </div>
        <div className="flex space-x-2">
          {hasResults && viewMode === "inspection" && (
            <button
              onClick={() => setView("history")}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-sm hover:shadow transition-all duration-200 flex items-center text-xs font-medium"
            >
              <ClipboardCheck className="w-3.5 h-3.5 mr-1" />
              Results
            </button>
          )}

          {/* New Inspection button */}
          {isCompleted && (
            <button
              onClick={onStartNew}
              className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full shadow-sm hover:shadow transition-all duration-200 flex items-center text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              New
            </button>
          )}
        </div>
      </div>

      {/* Only show progress in inspection view */}
      {viewMode === "inspection" && (
        <>
          {/* Progress indicator */}
          <div className="flex justify-between items-center text-xs mb-2 px-1">
            <div className="text-sm font-medium text-gray-700">
              {stats.completed}/{stats.total} Items
            </div>
            <div className="flex space-x-3">
              <div className="flex items-center bg-green-50 px-2 py-1 rounded-md border border-green-100">
                <CheckCircle className="w-3.5 h-3.5 text-green-600 mr-1" />
                <span className="text-green-700 font-medium">
                  {stats.passCount}
                </span>
              </div>
              <div className="flex items-center bg-red-50 px-2 py-1 rounded-md border border-red-100">
                <XCircle className="w-3.5 h-3.5 text-red-600 mr-1" />
                <span className="text-red-700 font-medium">
                  {stats.failCount}
                </span>
              </div>
            </div>
          </div>

          {/* Modern progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner">
            <div
              className="h-2.5 rounded-full transition-all duration-300 ease-in-out bg-gradient-to-r from-blue-400 to-blue-600"
              style={{ width: `${stats.percentComplete}%` }}
            ></div>
          </div>

          {/* Percentage display */}
          <div className="text-right text-xs text-blue-600 font-medium mt-1">
            <BarChart2 className="w-3 h-3 inline mr-1" />
            {stats.percentComplete}% complete
          </div>
        </>
      )}
    </header>
  );
};

export default InspectionHeader;
