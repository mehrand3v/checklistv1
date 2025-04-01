// components/inspection/InspectionHeader.jsx - Ultra compact version
import React from "react";
import { CheckCircle, XCircle, ChevronLeft, ClipboardList } from "lucide-react";

const InspectionHeader = ({ stats, viewMode, setView, hasResults }) => {
  return (
    <div className="w-full bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700/50 p-1.5 mb-1">
      <div className="flex items-center justify-between gap-1">
        {/* Left side - Counter */}
        {viewMode === "inspection" && (
          <div className="text-xs font-medium text-gray-300 whitespace-nowrap">
            {stats.completed}/{stats.total} Items
          </div>
        )}

        {/* Center - Back button for non-inspection views */}
        {viewMode !== "inspection" && (
          <button
            onClick={() => setView("inspection")}
            className="p-1 hover:bg-gray-700 rounded-full transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-300" />
          </button>
        )}

        {/* Right side - Stats */}
        <div className="flex items-center gap-1.5">
          {viewMode === "inspection" && (
            <>
              <div className="flex items-center bg-green-900/30 px-1 py-0.5 rounded-md border border-green-500/30">
                <CheckCircle className="w-3 h-3 text-green-400 mr-1" />
                <span className="text-xs text-green-300 font-medium">
                  {stats.passCount}
                </span>
              </div>
              <div className="flex items-center bg-red-900/30 px-1 py-0.5 rounded-md border border-red-500/30">
                <XCircle className="w-3 h-3 text-red-400 mr-1" />
                <span className="text-xs text-red-300 font-medium">
                  {stats.failCount}
                </span>
              </div>
              {hasResults && (
                <button
                  onClick={() => setView("history")}
                  className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                  title="View history"
                >
                  <ClipboardList className="w-4 h-4 text-indigo-300" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Compact progress bar only */}
      {viewMode === "inspection" && (
        <div className="w-full bg-gray-700/50 rounded-full h-1 mt-1 overflow-hidden">
          <div
            className="h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
            style={{ width: `${stats.percentComplete}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default InspectionHeader;
