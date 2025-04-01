// components/inspection/InspectionComplete.jsx - Optimized for mobile
import React from "react";
import { CheckCircle, XCircle, Send } from "lucide-react";

const InspectionComplete = ({ stats, onSubmitInspection }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-center p-4 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl shadow-lg w-full max-w-xs border border-indigo-500/30">
        <div className="relative">
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg border border-indigo-400/30">
            <CheckCircle className="h-7 w-7 text-white" />
          </div>
        </div>

        <h3 className="text-lg font-bold mt-6 mb-1 text-indigo-200">
          Awesome Job! 🎉
        </h3>
        <p className="text-gray-300 text-sm mb-3">
          You've completed all {stats.completed} inspection items
        </p>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-green-900/30 p-2 rounded-lg border border-green-500/30">
            <div className="flex flex-col items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mb-0.5" />
              <span className="text-lg font-bold text-green-300">
                {stats.passCount}
              </span>
              <span className="text-xs text-green-400">Satisfactory</span>
            </div>
          </div>
          <div className="bg-red-900/30 p-2 rounded-lg border border-red-500/30">
            <div className="flex flex-col items-center">
              <XCircle className="w-5 h-5 text-red-400 mb-0.5" />
              <span className="text-lg font-bold text-red-300">
                {stats.failCount}
              </span>
              <span className="text-xs text-red-400">Issues Found</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={onSubmitInspection}
            className="px-5 py-2 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center"
          >
            <Send className="w-4 h-4 mr-2" />
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default InspectionComplete;
