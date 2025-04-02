// components/dashboard/ui/Notification.jsx
import React from "react";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

const Notification = ({ notification }) => {
  if (!notification) return null;

  return (
    <div
      className={`fixed left-1/2 bottom-6 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm flex items-center ${
        notification.type === "success"
          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 border border-emerald-300"
          : notification.type === "error"
          ? "bg-gradient-to-r from-red-500 to-red-600 border border-red-300"
          : notification.type === "warning"
          ? "bg-gradient-to-r from-amber-500 to-amber-600 border border-amber-300"
          : "bg-gradient-to-r from-blue-500 to-blue-600 border border-blue-300"
      }`}
    >
      {notification.type === "success" && (
        <CheckCircle className="w-4 h-4 mr-2" />
      )}
      {notification.type === "error" && <XCircle className="w-4 h-4 mr-2" />}
      {notification.type === "warning" && (
        <AlertCircle className="w-4 h-4 mr-2" />
      )}
      {notification.message}
    </div>
  );
};

export default Notification;
