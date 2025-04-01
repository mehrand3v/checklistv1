// components/inspection/SubmissionModal.jsx - Optimized for mobile
import React from "react";
import { motion } from "framer-motion";
import { Send, X, CheckCircle, AlertCircle, Store } from "lucide-react";

const SubmissionModal = ({
  onSubmit,
  onCancel,
  isSubmitting,
  error,
  storeName,
}) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-gray-900/90 p-4 rounded-xl w-full max-w-md shadow-xl border border-indigo-500/30"
      >
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 bg-indigo-900/50 rounded-full flex items-center justify-center border border-indigo-500/50">
            <CheckCircle className="h-6 w-6 text-indigo-400" />
          </div>
        </div>

        <h3 className="text-lg font-bold text-white text-center mb-1">
          Inspection Complete!
        </h3>
        <p className="text-gray-300 text-center text-sm mb-3">
          Ready to submit your inspection?
        </p>

        {/* Store information */}
        <div className="mb-3 p-2 bg-indigo-900/30 border border-indigo-500/30 rounded-lg flex items-center">
          <Store className="h-4 w-4 text-indigo-400 mr-2 flex-shrink-0" />
          <div>
            <p className="text-xs text-indigo-300">Store</p>
            <p className="text-sm text-white font-medium">{storeName}</p>
          </div>
        </div>

        {error && (
          <div className="mb-3 p-2 bg-red-900/30 border border-red-500/30 rounded-lg flex items-start">
            <AlertCircle className="h-4 w-4 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-xs">{error}</p>
          </div>
        )}

        <div className="flex justify-center space-x-3">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700 flex items-center text-sm"
            disabled={isSubmitting}
          >
            <X className="h-3.5 w-3.5 mr-1.5" />
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md flex items-center text-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Submit
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SubmissionModal;
