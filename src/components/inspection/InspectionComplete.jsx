// InspectionComplete.jsx - Completion screen with confetti animation
import React, { useEffect } from "react";
import { CheckCircle, XCircle, Award, TrendingUp } from "lucide-react";
import confetti from "canvas-confetti";

const InspectionComplete = ({ stats, onStartNew }) => {
  // Trigger confetti animation when component mounts
  useEffect(() => {
    // First burst of confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Second burst after a short delay
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
    }, 250);

    // Third burst from the opposite side
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 400);
  }, []);

  return (
    <div className="text-center p-6 bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg w-full max-w-xs border border-blue-100">
      <div className="relative">
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
          <CheckCircle className="h-10 w-10 text-white" />
        </div>
      </div>

      <h3 className="text-xl font-bold mt-8 mb-2 text-gray-800">
        🎉 Awesome Job! 🎉
      </h3>
      <p className="text-gray-600 mb-4">
        You've completed all {stats.completed} inspection items
      </p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
          <div className="flex flex-col items-center">
            <CheckCircle className="w-6 h-6 text-green-500 mb-1" />
            <span className="text-xl font-bold text-green-700">
              {stats.passCount}
            </span>
            <span className="text-xs text-green-600">Passed</span>
          </div>
        </div>
        <div className="bg-red-50 p-3 rounded-lg border border-red-100">
          <div className="flex flex-col items-center">
            <XCircle className="w-6 h-6 text-red-500 mb-1" />
            <span className="text-xl font-bold text-red-700">
              {stats.failCount}
            </span>
            <span className="text-xs text-red-600">Failed</span>
          </div>
        </div>
      </div>

      {stats.passRate > 0 && (
        <div className="flex items-center justify-center space-x-2 mb-5">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <div className="text-sm font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
            {stats.passRate}% Pass Rate
          </div>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={onStartNew}
          className="px-6 py-3 text-sm bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center mx-auto"
        >
          <Award className="w-4 h-4 mr-2" />
          Start New Inspection
        </button>
      </div>
    </div>
  );
};

export default InspectionComplete;
