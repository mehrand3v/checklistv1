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
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white p-4 rounded-xl w-full max-w-md shadow-xl border border-red-100"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Failed Item</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg mb-3 text-sm border border-gray-200">
          <div className="flex mb-1">
            <span className="text-blue-600 font-bold mr-1">
              #{currentItem?.id}
            </span>
            <span className="text-gray-500">Inspection Item</span>
          </div>
          <p className="text-gray-800 font-medium">
            {currentItem?.description}
          </p>
        </div>

        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          What's the issue?
        </label>
        <textarea
          value={failReason}
          onChange={(e) => onChangeReason(e.target.value)}
          className={`w-full p-3 border ${
            failReasonError ? "border-red-500" : "border-gray-300"
          } rounded-lg mb-1.5 h-24 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm transition-all`}
          placeholder="Describe the issue in detail..."
        />
        {failReasonError && (
          <p className="text-red-500 text-xs mb-2 flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {failReasonError}
          </p>
        )}

        <div className="flex justify-end space-x-2 mt-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center"
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
