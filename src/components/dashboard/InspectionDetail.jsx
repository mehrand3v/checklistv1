// components/dashboard/InspectionDetail.jsx
import React, { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  Store,
  Trash2,
  FileText,
  Smartphone,
  Globe,
  Monitor,
  RefreshCw,
  Save,
} from "lucide-react";

const InspectionDetail = ({ inspection, onBack, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const formatDate = (timestamp) => {
    if (!timestamp) return "—";

    try {
      // Handle different timestamp formats
      let date;
      if (timestamp?.toDate) {
        date = timestamp.toDate();
      } else if (typeof timestamp === "string") {
        date = new Date(timestamp);
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        return "Invalid date";
      }

      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (e) {
      console.error("Date formatting error:", e);
      return "Invalid date";
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(inspection.id);
      // onBack will be called by parent component
    } catch (error) {
      console.error("Error deleting inspection:", error);
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (!inspection) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-10 w-10 text-gray-500 mx-auto mb-3" />
        <p className="text-lg font-medium text-gray-300 mb-1">
          No inspection selected
        </p>
        <p className="text-gray-400 mb-4">
          Select an inspection from the list to view details
        </p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors inline-flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to list
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-300 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to inspections
        </button>

        {confirmDelete ? (
          <div className="flex items-center space-x-2">
            <span className="text-red-300 text-sm mr-2">Are you sure?</span>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center px-3 py-1 bg-red-600/30 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-600/50 transition-colors text-sm disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-3 w-3 mr-1" />
                  Confirm
                </>
              )}
            </button>
          </div>
        ) : (
          <button
            onClick={handleDelete}
            className="flex items-center px-3 py-1 bg-red-600/30 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-600/50 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete inspection
          </button>
        )}
      </div>

      {/* Inspection header */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700/50">
          <div className="flex items-center mb-1 text-gray-400 text-sm">
            <Store className="h-4 w-4 mr-1" />
            Store
          </div>
          <div className="text-lg font-medium">
            {inspection.storeName || "Unknown Store"}
          </div>
        </div>

        <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700/50">
          <div className="flex items-center mb-1 text-gray-400 text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            Date / Time
          </div>
          <div className="text-lg font-medium">
            {formatDate(inspection.timestamp)}
          </div>
        </div>

        <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700/50">
          <div className="flex items-center mb-1 text-gray-400 text-sm">
            <User className="h-4 w-4 mr-1" />
            Inspector
          </div>
          <div className="text-lg font-medium">
            {inspection.submittedBy || "Unknown"}
          </div>
        </div>
      </div>

      {/* Inspection summary */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700/50 flex items-center">
          <div className="w-12 h-12 rounded-full bg-gray-700/50 flex items-center justify-center mr-3">
            <CheckCircle className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <div className="text-sm text-gray-400">Satisfactory Items</div>
            <div className="text-2xl font-bold text-green-400">
              {inspection.satisfactoryItems || 0}
            </div>
          </div>
        </div>

        <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700/50 flex items-center">
          <div className="w-12 h-12 rounded-full bg-gray-700/50 flex items-center justify-center mr-3">
            <AlertCircle className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <div className="text-sm text-gray-400">Issues Found</div>
            <div className="text-2xl font-bold text-amber-400">
              {inspection.issueItems || 0}
            </div>
          </div>
        </div>

        <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700/50 flex items-center">
          <div className="w-12 h-12 rounded-full bg-gray-700/50 flex items-center justify-center mr-3">
            <FileText className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <div className="text-sm text-gray-400">Total Items</div>
            <div className="text-2xl font-bold text-blue-400">
              {inspection.totalItems || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Inspection items */}
      <div className="bg-gray-800/60 rounded-lg border border-gray-700/50 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-700/50 flex justify-between items-center">
          <h3 className="font-medium text-lg flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-400" />
            Inspection Items
          </h3>
          {inspection.issueItems > 0 && (
            <span className="px-3 py-1 bg-amber-900/30 text-amber-400 border border-amber-500/30 rounded-full text-xs">
              {inspection.issueItems} issues found
            </span>
          )}
        </div>

        <div className="divide-y divide-gray-700/30">
          {inspection.items && inspection.items.length > 0 ? (
            inspection.items.map((item, index) => (
              <div
                key={index}
                className={`p-4 ${
                  item.status === "fail" ? "bg-red-900/10" : ""
                }`}
              >
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5">
                    {item.status === "pass" ? (
                      <div className="w-6 h-6 rounded-full bg-green-900/30 border border-green-500/30 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-red-900/30 border border-red-500/30 flex items-center justify-center">
                        <AlertCircle className="h-4 w-4 text-red-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-gray-200">
                        Item #{item.id}: {item.description}
                      </span>
                      <span className="text-sm text-gray-400 ml-3 flex-shrink-0">
                        {formatDate(item.timestamp)}
                      </span>
                    </div>

                    {item.status === "fail" && item.failReason && (
                      <div className="mt-2 p-3 bg-red-900/20 border border-red-500/30 rounded-md text-red-300 text-sm">
                        <div className="font-medium mb-1 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Issue Details:
                        </div>
                        <p>{item.failReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-400">
              <FileText className="h-10 w-10 mx-auto mb-2 text-gray-500" />
              <p className="text-gray-300 font-medium mb-1">
                No inspection items found
              </p>
              <p className="text-gray-400 text-sm">
                This inspection doesn't contain any individual item data
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Device information */}
      {inspection.deviceInfo && (
        <div className="bg-gray-800/60 rounded-lg border border-gray-700/50 overflow-hidden">
          <div className="p-4 border-b border-gray-700/50">
            <h3 className="font-medium text-lg flex items-center">
              <Smartphone className="h-5 w-5 mr-2 text-purple-400" />
              Device Information
            </h3>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700/30 flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-700/40 flex items-center justify-center mr-3">
                  <Monitor className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Platform</div>
                  <div className="text-sm font-medium text-gray-300">
                    {inspection.deviceInfo.platform || "Unknown"}
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700/30 flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-700/40 flex items-center justify-center mr-3">
                  <Globe className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Language</div>
                  <div className="text-sm font-medium text-gray-300">
                    {inspection.deviceInfo.language || "Unknown"}
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700/30 flex items-center md:col-span-2">
                <div className="w-10 h-10 rounded-full bg-gray-700/40 flex items-center justify-center mr-3">
                  <Smartphone className="h-5 w-5 text-green-400" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs text-gray-400">Screen Resolution</div>
                  <div className="text-sm font-medium text-gray-300 truncate">
                    {inspection.deviceInfo.screenWidth &&
                    inspection.deviceInfo.screenHeight
                      ? `${inspection.deviceInfo.screenWidth} × ${inspection.deviceInfo.screenHeight}`
                      : "Unknown"}
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700/30 md:col-span-2">
                <div className="text-xs text-gray-400 mb-1">User Agent</div>
                <div className="text-sm text-gray-300 break-words">
                  {inspection.deviceInfo.userAgent || "Unknown"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionDetail;
