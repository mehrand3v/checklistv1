// components/inspection/InspectionHeader.jsx - Header with progress information, modern design
import React from "react";
import {
  CheckCircle,
  XCircle,
  ChevronLeft,
  ClipboardCheck,
  BarChart2,
    Plus,
  ClipboardList
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
    <header className="w-full max-w-md bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-3 mb-2 shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          {viewMode !== "inspection" && (
            <button
              onClick={() => setView("inspection")}
              className="mr-2 p-1.5 hover:bg-gray-700 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-300" />
            </button>
          )}
          <h1
            className={`text-lg font-bold ${
              viewMode === "inspection" ? "text-blue-400" : "text-gray-200"
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
              className="px-3 py-1.5 bg-indigo-500/40 hover:bg-indigo-600/50 text-indigo-200 rounded-full transition-colors flex items-center text-xs font-medium border border-indigo-500/40"
            >
              <ClipboardList className="w-3.5 h-3.5 mr-1 text-indigo-300" />
              Checklist
            </button>
          )}
        </div>
      </div>

      {/* Only show progress in inspection view */}
      {viewMode === "inspection" && (
        <>
          {/* Progress indicator */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              {viewMode !== "inspection" && (
                <button
                  onClick={() => setView("inspection")}
                  className="mr-2 p-1.5 hover:bg-gray-700 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-300" />
                </button>
              )}
              <h1
                className={`text-lg font-bold ${
                  viewMode === "inspection" ? "text-blue-400" : "text-gray-200"
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
                  className="w-9 h-9 flex items-center justify-center bg-indigo-600/60 hover:bg-indigo-500 text-white rounded-full transition-colors border border-indigo-400 shadow-md"
                  title="View Checklist"
                >
                  <ClipboardList className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
          </div>

          {/* Modern progress bar */}
          <div className="w-full bg-gray-700/50 rounded-full h-2.5 overflow-hidden shadow-inner">
            <div
              className="h-2.5 rounded-full transition-all duration-300 ease-in-out bg-gradient-to-r from-blue-500 to-purple-600"
              style={{ width: `${stats.percentComplete}%` }}
            ></div>
          </div>

          {/* Percentage display */}
          <div className="text-right text-xs text-blue-300 font-medium mt-1">
            <BarChart2 className="w-3 h-3 inline mr-1" />
            {stats.percentComplete}% complete
          </div>
        </>
      )}
    </header>
  );
};

export default InspectionHeader;
