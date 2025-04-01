// components/inspection/InspectionFailModal.jsx - Optimized for mobile
import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, X, Send, CheckSquare } from "lucide-react";

const InspectionFailModal = ({
  currentItem,
  failReason,
  failReasonError,
  isFixed,
  onCancel,
  onSubmit,
  onChangeReason,
  onChangeFixed,
}) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-gray-900/90 p-3 rounded-xl w-full max-w-md shadow-xl border border-red-500/30"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="w-7 h-7 rounded-full bg-red-900/50 border border-red-500/30 flex items-center justify-center mr-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </div>
            <h3 className="text-base font-bold text-red-300">Failed Item</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-2 bg-gray-800/70 rounded-lg mb-2 text-xs border border-gray-700/50">
          <div className="flex mb-0.5">
            <span className="text-indigo-400 font-bold mr-1">
              #{currentItem?.id}
            </span>
            <span className="text-gray-400">Inspection Item</span>
          </div>
          <p className="text-gray-200 font-medium">
            {currentItem?.description}
          </p>
        </div>

        <label className="block mb-1 text-xs font-medium text-gray-300">
          What's the issue?
        </label>
        <textarea
          value={failReason}
          onChange={(e) => onChangeReason(e.target.value)}
          className="w-full p-2 border bg-gray-800/60 border-gray-700/50 rounded-lg mb-1 h-16 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm transition-all text-white placeholder-gray-500"
          placeholder="Describe the issue in detail..."
        />
        {failReasonError && (
          <p className="text-red-400 text-xs mb-2 flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {failReasonError}
          </p>
        )}

        {/* Fixed issue checkbox */}
        <div className="mt-2 mb-3">
          <label className="flex items-center space-x-2 cursor-pointer">
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center ${
                isFixed
                  ? "bg-green-600 border-green-500"
                  : "bg-gray-800 border-gray-600"
              }`}
            >
              {isFixed && <CheckSquare className="h-3 w-3 text-white" />}
            </div>
            <input
              type="checkbox"
              className="hidden"
              checked={isFixed}
              onChange={(e) => onChangeFixed(e.target.checked)}
            />
            <span className="text-xs text-gray-300">Issue has been fixed</span>
          </label>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-3 py-1.5 text-xs bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md flex items-center border border-red-500/30"
          >
            <Send className="h-3 w-3 mr-1" />
            Submit
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default InspectionFailModal;
