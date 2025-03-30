// components/dashboard/RecentInspections.jsx
import React, { useState, useEffect } from 'react';
import { getRecentInspections } from '@/services/inspections/inspectionService';
import { Clock, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const InspectionItem = ({ inspection }) => {
  const [expanded, setExpanded] = useState(false);

 const formatDate = (timestamp) => {
   if (!timestamp) return "No date";

   try {
     // Check if timestamp is a Firebase Timestamp
     if (timestamp && typeof timestamp.toDate === "function") {
       timestamp = timestamp.toDate();
     }

     // Handle string dates
     if (typeof timestamp === "string") {
       timestamp = new Date(timestamp);
     }

     // Check if date is valid before formatting
     if (timestamp instanceof Date && !isNaN(timestamp)) {
       return timestamp.toLocaleDateString(undefined, {
         month: "short",
         day: "numeric",
         year: "numeric",
       });
     } else {
       return "Invalid date";
     }
   } catch (error) {
     console.error("Error formatting date:", error);
     return "Date error";
   }
 };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getPassRate = (results) => {
    if (!results || results.length === 0) return '0%';
    const passCount = results.filter(item => item.status === 'pass').length;
    const percentage = Math.round((passCount / results.length) * 100);
    return `${percentage}%`;
  };

  return (
    <motion.div
      className="bg-white rounded-lg border border-gray-200 mb-3 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          <div className="mr-3">{getStatusIcon(inspection.overallStatus)}</div>
          <div></div>

          <div>
            <h3 className="font-medium text-gray-800">
              {inspection.storeName}
            </h3>
            <p className="text-xs text-gray-500">
              {formatDate(inspection.timestamp)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center">
        <span
          className="text-sm font-medium mr-3"
          style={{
            color: inspection.overallStatus === "pass" ? "#10B981" : "#EF4444",
          }}
        >
          {getPassRate(inspection.results)}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${
            expanded ? "transform rotate-180" : ""
          }`}
        />
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-2">Inspection Items</div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {inspection.results &&
              inspection.results.map((item, index) => (
                <div key={index} className="flex items-start">
                  <div className="mt-0.5 mr-2">
                    {item.status === "pass" ? (
                      <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-800">
                      {item.description}
                    </div>
                    {item.status === "fail" && item.failReason && (
                      <div className="text-xs text-red-500 mt-0.5">
                        {item.failReason}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
            <div className="text-xs text-gray-500">
              Completed by {inspection.submittedBy || "Unknown"}
            </div>
            {inspection.failedItems > 0 ? (
              <div className="text-xs font-medium px-2 py-1 bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                {inspection.failedItems}{" "}
                {inspection.failedItems === 1 ? "issue" : "issues"} found
              </div>
            ) : (
              <div className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full border border-green-200">
                No issues found
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const RecentInspections = ({ storeId }) => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInspections = async () => {
      setLoading(true);
      try {
        const data = await getRecentInspections(storeId, 10); // Fetch 10 recent inspections
        setInspections(data);
      } catch (error) {
        console.error('Error fetching recent inspections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInspections();
  }, [storeId]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-blue-500" />
          Recent Inspections
        </h2>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-3 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-4 w-4 bg-gray-200 rounded-full mr-3"></div>
                  <div>
                    <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="h-4 w-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : inspections.length > 0 ? (
        <div className="space-y-3">
          {inspections.map((inspection, index) => (
            <InspectionItem key={index} inspection={inspection} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <Clock className="h-8 w-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No recent inspections found</p>
          <p className="text-xs text-gray-400 mt-1">
            {storeId === 'all' ? 'Try selecting a specific store' : 'This store has no inspections yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentInspections;