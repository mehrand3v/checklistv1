// InspectionFailModal.jsx - Modal for entering failure reason, modern design
import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, XCircle, X, Send } from "lucide-react";

const InspectionFailModal = ({
  currentItem,
  failReason,
  failReasonError,
  onCancel,
  onSubmit,
  onChangeReason,
}) => {
  return (
   

    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-gray-900/90 p-5 rounded-xl w-full max-w-md shadow-xl border border-red-500/30"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-red-900/50 border border-red-500/30 flex items-center justify-center mr-3">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-red-300">Failed Item</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-gray-800/70 rounded-lg mb-4 text-sm border border-gray-700/50">
          <div className="flex mb-1">
            <span className="text-indigo-400 font-bold mr-1">
              #{currentItem?.id}
            </span>
            <span className="text-gray-400">Inspection Item</span>
          </div>
          <p className="text-gray-200 font-medium">
            {currentItem?.description}
          </p>
        </div>

        <label className="block mb-2 text-sm font-medium text-gray-300">
          What's the issue?
        </label>
        <textarea
          value={failReason}
          onChange={(e) => onChangeReason(e.target.value)}
          className="w-full p-3 border bg-gray-800/60 border-gray-700/50 rounded-lg mb-2 h-24 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm transition-all text-white placeholder-gray-500"
          placeholder="Describe the issue in detail..."
        />
        {failReasonError && (
          <p className="text-red-400 text-xs mb-3 flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {failReasonError}
          </p>
        )}

        <div className="flex justify-end space-x-3 mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 text-sm bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md hover:shadow-lg flex items-center border border-red-500/30"
          >
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Submit
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default InspectionFailModal;
