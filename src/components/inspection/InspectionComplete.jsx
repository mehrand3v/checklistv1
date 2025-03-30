// components/inspection/InspectionComplete.jsx
import React from "react";
import { CheckCircle, XCircle, Award, TrendingUp, Send } from "lucide-react";
import confetti from "canvas-confetti";

const InspectionComplete = ({ stats, onStartNew, onSubmitInspection }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
  <div className="text-center p-6 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl shadow-lg w-full max-w-xs border border-indigo-500/30">
      <div className="relative">
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg border border-indigo-400/30">
          <CheckCircle className="h-10 w-10 text-white" />
        </div>
      </div>

      <h3 className="text-xl font-bold mt-8 mb-2 text-indigo-200">
        Awesome Job! 🎉
      </h3>
      <p className="text-gray-300 mb-4">
        You've completed all {stats.completed} inspection items
      </p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-green-900/30 p-3 rounded-lg border border-green-500/30">
          <div className="flex flex-col items-center">
            <CheckCircle className="w-6 h-6 text-green-400 mb-1" />
            <span className="text-xl font-bold text-green-300">
              {stats.passCount}
            </span>
            <span className="text-xs text-green-400">Passed</span>
          </div>
        </div>
        <div className="bg-red-900/30 p-3 rounded-lg border border-red-500/30">
          <div className="flex flex-col items-center">
            <XCircle className="w-6 h-6 text-red-400 mb-1" />
            <span className="text-xl font-bold text-red-300">
              {stats.failCount}
            </span>
            <span className="text-xs text-red-400">Failed</span>
          </div>
        </div>
      </div>

      <div className="mb-5"></div>

      <div className="mt-6 flex justify-center space-x-3">
        <button
          onClick={onStartNew}
          className="px-4 py-2 text-sm bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700 flex items-center"
        >
          <Award className="w-4 h-4 mr-2" />
          New Inspection
        </button>

        <button
          onClick={onSubmitInspection}
          className="px-4 py-2 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center"
        >
          <Send className="w-4 h-4 mr-2" />
          Submit
        </button>
      </div>
          </div>
          </div>
  );
};

export default InspectionComplete;
