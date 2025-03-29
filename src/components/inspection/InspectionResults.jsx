// InspectionResults.jsx - Results view with item navigation, modern design
import React from "react";
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  ChevronRight,
  Calendar,
  Clock,
  AlertCircle,
  File,
} from "lucide-react";
import { motion } from "framer-motion";

const InspectionResults = ({
  results,
  onSelectResult,
  onBack,
  isDetailView = false,
}) => {
  // Animation variants for list items
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="w-full h-full bg-white rounded-xl p-4 overflow-auto">
      {!isDetailView && results.length > 0 ? (
        <motion.div
          className="space-y-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <div className="text-sm text-gray-600 mb-3 flex items-center">
            <File className="w-4 h-4 mr-1.5" />
            Tap on an item to view details
          </div>

          {results.map((result) => (
            <motion.div
              key={result.id}
              variants={item}
              className={`p-3 rounded-lg text-sm ${
                result.status === "pass"
                  ? "bg-gradient-to-r from-green-50 to-green-100 border border-green-200"
                  : "bg-gradient-to-r from-red-50 to-red-100 border border-red-200"
              } cursor-pointer hover:shadow-md transition-all duration-200 transform hover:-translate-y-1`}
              onClick={() => onSelectResult(result.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                  {result.status === "pass" ? (
                    <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-900 mr-1">
                        Item {result.id}
                      </span>
                      <span className="text-xs text-gray-500">
                        •{" "}
                        {new Date(result.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-0.5">{result.description}</p>
                    {result.status === "fail" && result.failReason && (
                      <div className="mt-2 text-xs bg-white bg-opacity-50 p-2 rounded border border-red-200 text-red-700">
                        <span className="font-medium flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" /> Issue:
                        </span>
                        <p className="mt-0.5 text-gray-700">
                          {result.failReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 self-center ml-2" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : isDetailView && results.length > 0 ? (
        // Detailed view of a single result
        <motion.div
          className="p-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center mb-4">
            <button
              onClick={onBack}
              className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h3 className="text-xl font-bold text-gray-800">
              Item #{results[0].id}
            </h3>
          </div>

          <div className="mb-5">
            <div className="text-sm font-medium text-gray-500 mb-1.5 flex items-center">
              <File className="w-4 h-4 mr-1.5" />
              Description
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 font-medium">
              {results[0].description}
            </div>
          </div>

          <div className="mb-5">
            <div className="text-sm font-medium text-gray-500 mb-1.5 flex items-center">
              <Clock className="w-4 h-4 mr-1.5" />
              Status
            </div>
            <div
              className={`inline-flex items-center py-2 px-4 rounded-lg text-sm ${
                results[0].status === "pass"
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}
            >
              {results[0].status === "pass" ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Passed Inspection
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 mr-2" />
                  Failed Inspection
                </>
              )}
            </div>
          </div>

          {results[0].status === "fail" && results[0].failReason && (
            <div className="mb-5">
              <div className="text-sm font-medium text-gray-500 mb-1.5 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1.5" />
                Issue Details
              </div>
              <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-gray-700">
                {results[0].failReason}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 mt-6 flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            Inspected on {new Date(results[0].timestamp).toLocaleString()}
          </div>
        </motion.div>
      ) : (
        <div className="text-center p-5 bg-gray-50 rounded-lg text-gray-600 border border-gray-200 flex flex-col items-center justify-center h-4/5">
          <File className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-lg font-medium">No inspection results yet</p>
          <p className="text-sm mt-1">
            Complete some inspection items to see them listed here
          </p>
        </div>
      )}
    </div>
  );
};

export default InspectionResults;
