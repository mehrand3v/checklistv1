// components/inspection/InspectionResults.jsx - Results view with item navigation, modern design
import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  ChevronRight,
  Calendar,
  Clock,
  AlertCircle,
  File,
  Save,
  X,
} from "lucide-react";
import { motion } from "framer-motion";

const InspectionResults = ({
  results,
  onSelectResult,
  onBack,
  onUpdateResults,
  isDetailView = false,
}) => {
  const [editingItemId, setEditingItemId] = useState(null);
  const [editReason, setEditReason] = useState("");

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

  const handleSaveEdit = (itemId, e) => {
    e.stopPropagation();
    if (!editReason.trim()) return;

    // Update the result
    const updatedResults = results.map((item) =>
      item.id === itemId ? { ...item, failReason: editReason } : item
    );

    // Pass the updated results back to the parent
    if (onUpdateResults) {
      onUpdateResults(updatedResults);
    }

    // Reset editing state
    setEditingItemId(null);
    setEditReason("");
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingItemId(null);
    setEditReason("");
  };

  const startEditing = (result, e) => {
    e.stopPropagation();
    setEditingItemId(result.id);
    setEditReason(result.failReason || "");
  };

  return (
    <div className="w-full h-full bg-gray-900/80 rounded-xl p-4 overflow-auto border border-gray-700/50 backdrop-blur-sm">
      {!isDetailView && results.length > 0 ? (
        <motion.div
          className="space-y-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <div className="text-sm text-gray-400 mb-3 flex items-center">
            <File className="w-4 h-4 mr-1.5 text-indigo-400" />
            <span className="text-indigo-300">
              Tap on an item to view or edit details
            </span>
          </div>

          {results.map((result) => (
            <motion.div
              key={result.id}
              variants={item}
              className={`p-3 rounded-lg text-sm ${
                result.status === "pass"
                  ? "bg-green-900/30 border border-green-500/30"
                  : "bg-red-900/30 border border-red-500/30"
              } cursor-pointer hover:shadow-md transition-all duration-200 transform hover:-translate-y-1`}
              onClick={() => {
                if (editingItemId !== result.id) {
                  onSelectResult(result.id);
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                  {result.status === "pass" ? (
                    <div className="w-6 h-6 rounded-full bg-green-900/50 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2 border border-green-500/30">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-red-900/50 flex items-center justify-center flex-shrink-0 mt-0.5 mr-2 border border-red-500/30">
                      <XCircle className="h-4 w-4 text-red-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-200 mr-1">
                        Item {result.id}
                      </span>
                      <span className="text-xs text-gray-400">
                        •{" "}
                        {new Date(result.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {result.status === "fail" && (
                        <button
                          onClick={(e) => startEditing(result, e)}
                          className="ml-2 p-1 bg-gray-800/60 rounded-full hover:bg-gray-700/60 text-gray-400 hover:text-indigo-300 transition-colors"
                        >
                          <AlertCircle className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-gray-300 mt-0.5">{result.description}</p>

                    {editingItemId === result.id ? (
                      <div
                        className="mt-3 space-y-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <label className="block text-xs font-medium text-indigo-300 mb-1">
                          Edit failure reason:
                        </label>
                        <textarea
                          value={editReason}
                          onChange={(e) => setEditReason(e.target.value)}
                          className="w-full p-2 bg-gray-800/80 border border-indigo-500/30 rounded text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                          placeholder="Update reason for failure..."
                        />
                        <div className="flex justify-end mt-2 space-x-2">
                          <button
                            onClick={handleCancelEdit}
                            className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded border border-gray-700 hover:bg-gray-700 transition-colors flex items-center"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Cancel
                          </button>
                          <button
                            onClick={(e) => handleSaveEdit(result.id, e)}
                            className="px-2 py-1 text-xs bg-indigo-600/60 text-white rounded border border-indigo-500/30 hover:bg-indigo-600/80 transition-colors flex items-center"
                          >
                            <Save className="w-3 h-3 mr-1" />
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      result.status === "fail" &&
                      result.failReason && (
                        <div className="mt-2 text-xs bg-gray-800/50 p-2 rounded border border-red-500/20 text-gray-300">
                          <span className="font-medium flex items-center text-red-400">
                            <AlertCircle className="w-3 h-3 mr-1" /> Issue:
                          </span>
                          <p className="mt-0.5 text-gray-300">
                            {result.failReason}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
                {editingItemId !== result.id && (
                  <ChevronRight className="h-5 w-5 text-gray-500 flex-shrink-0 self-center ml-2" />
                )}
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
              className="mr-3 p-2 rounded-full bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-indigo-300">
              Item #{results[0].id}
            </h3>
          </div>

          <div className="mb-5">
            <div className="text-sm font-medium text-gray-400 mb-1.5 flex items-center">
              <File className="w-4 h-4 mr-1.5 text-indigo-400" />
              Description
            </div>
            <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 text-gray-200 font-medium">
              {results[0].description}
            </div>
          </div>

          <div className="mb-5">
            <div className="text-sm font-medium text-gray-400 mb-1.5 flex items-center">
              <Clock className="w-4 h-4 mr-1.5 text-indigo-400" />
              Status
            </div>
            <div
              className={`inline-flex items-center py-2 px-4 rounded-lg text-sm ${
                results[0].status === "pass"
                  ? "bg-green-900/30 text-green-300 border border-green-500/30"
                  : "bg-red-900/30 text-red-300 border border-red-500/30"
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

          {results[0].status === "fail" && (
            <div className="mb-5">
              <div className="text-sm font-medium text-gray-400 mb-1.5 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1.5 text-red-400" />
                Issue Details
              </div>
              {editingItemId === results[0].id ? (
                <div className="space-y-2">
                  <textarea
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    className="w-full p-3 bg-gray-800/80 border border-indigo-500/30 rounded text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                    placeholder="Update reason for failure..."
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 text-sm bg-gray-800 text-gray-300 rounded border border-gray-700 hover:bg-gray-700 transition-colors flex items-center"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </button>
                    <button
                      onClick={(e) => handleSaveEdit(results[0].id, e)}
                      className="px-3 py-1.5 text-sm bg-indigo-600/60 text-white rounded border border-indigo-500/30 hover:bg-indigo-600/80 transition-colors flex items-center"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-red-900/20 rounded-lg border border-red-500/30 text-gray-200">
                    {results[0].failReason || "No details provided"}
                  </div>
                  <button
                    onClick={(e) => {
                      setEditingItemId(results[0].id);
                      setEditReason(results[0].failReason || "");
                    }}
                    className="mt-2 px-2 py-1 bg-gray-800/80 text-indigo-300 rounded-lg border border-indigo-500/30 text-sm flex items-center hover:bg-indigo-900/30 transition-colors"
                  >
                    <AlertCircle className="w-3.5 h-3.5 mr-1" />
                    Edit Issue Details
                  </button>
                </>
              )}
            </div>
          )}

          <div className="text-xs text-gray-400 mt-6 flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            Inspected on {new Date(results[0].timestamp).toLocaleString()}
          </div>
        </motion.div>
      ) : (
        <div className="text-center p-5 bg-gray-800/50 rounded-lg text-gray-300 border border-gray-700/50 flex flex-col items-center justify-center h-4/5">
          <File className="w-12 h-12 text-gray-600 mb-3" />
          <p className="text-lg font-medium text-indigo-300">
            No inspection results yet
          </p>
          <p className="text-sm mt-1 text-gray-400">
            Complete some inspection items to see them listed here
          </p>
        </div>
      )}
    </div>
  );
};

export default InspectionResults;
