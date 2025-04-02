// components/dashboard/tabs/SettingsTab.jsx
import React from "react";

const SettingsTab = ({ settings, onChangeSettings, onSave }) => {
  const {
    itemsPerPage,
    showSuccessNotifications,
    showErrorNotifications,
    includeLogo,
    exportDetailLevel,
    paperSize,
  } = settings;

  const {
    setItemsPerPage,
    setShowSuccessNotifications,
    setShowErrorNotifications,
    setIncludeLogo,
    setExportDetailLevel,
    setPaperSize,
  } = onChangeSettings;

  return (
    <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
      <h2 className="text-lg font-bold mb-4">Settings</h2>
      <p className="text-gray-400 mb-6">
        Configure dashboard settings and preferences here.
      </p>

      {/* Settings form */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Default Date Range
            </label>
            <select
              defaultValue="30"
              className="w-full py-2 px-3 bg-gray-800/60 border border-gray-700/50 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Items Per Page
            </label>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(parseInt(e.target.value, 10))}
              className="w-full py-2 px-3 bg-gray-800/60 border border-gray-700/50 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Default View
            </label>
            <select
              defaultValue="inspections"
              className="w-full py-2 px-3 bg-gray-800/60 border border-gray-700/50 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="inspections">Inspections</option>
              <option value="analytics">Analytics</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Notifications
            </label>
            <div className="space-y-2 mt-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showSuccessNotifications}
                  onChange={(e) =>
                    setShowSuccessNotifications(e.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-300 text-sm">
                  Show success notifications
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showErrorNotifications}
                  onChange={(e) => setShowErrorNotifications(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-300 text-sm">
                  Show error notifications
                </span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Export Settings
          </label>
          <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-3">
              Configure PDF export settings for inspection reports
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Include Inspection Details
                </label>
                <select
                  value={exportDetailLevel}
                  onChange={(e) => setExportDetailLevel(e.target.value)}
                  className="w-full py-2 px-3 bg-gray-700/60 border border-gray-600/50 rounded-lg text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="summary">Summary only</option>
                  <option value="basic">Basic details</option>
                  <option value="full">Full details</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Paper Size
                </label>
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value)}
                  className="w-full py-2 px-3 bg-gray-700/60 border border-gray-600/50 rounded-lg text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="a4">A4</option>
                  <option value="letter">Letter</option>
                  <option value="legal">Legal</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeLogo}
                  onChange={(e) => setIncludeLogo(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-300 text-sm">
                  Include company logo
                </span>
              </label>
            </div>
          </div>
        </div>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4"
          onClick={onSave}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;
