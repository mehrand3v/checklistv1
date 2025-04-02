// components/dashboard/tabs/AnalyticsTab.jsx
import React from "react";
import InspectionStats from "../InspectionStats";
import InspectionTrends from "../InspectionTrends";
import CommonIssuesChart from "../CommonIssuesChart";
import StorePerformance from "../StorePerformance";

const AnalyticsTab = ({ selectedStore, dateRange }) => {
  return (
    <div>
      {/* Statistics cards - placed in Analytics tab */}
      <div className="mb-6">
        <InspectionStats storeId={selectedStore} dateRange={dateRange} />
      </div>

      {/* Analytics charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
          <InspectionTrends storeId={selectedStore} dateRange={dateRange} />
        </div>
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
          <CommonIssuesChart storeId={selectedStore} dateRange={dateRange} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
          <StorePerformance dateRange={dateRange} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
