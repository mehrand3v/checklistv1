// components/dashboard/DateRangePicker.jsx
import React, { useState } from "react";
import { Calendar } from "lucide-react";

const DateRangePicker = ({ range, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState(range);

  const formatDate = (date) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const handleApply = () => {
    onChange(tempRange);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempRange(range);
    setIsOpen(false);
  };

  const presetRanges = [
    { label: "Last 7 days", days: 7 },
    { label: "Last 30 days", days: 30 },
    { label: "Last 90 days", days: 90 },
    { label: "This year", days: 365 },
  ];

  const setPresetRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setTempRange({ start, end });
  };

  return (
    <div className="relative">
      <button
        className="flex items-center px-3 py-2 bg-gray-800/40 border border-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-700/40 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Calendar className="h-4 w-4 mr-2" />
        <span>
          {formatDate(range.start)} - {formatDate(range.end)}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
          <div className="p-3 border-b border-gray-700">
            <h3 className="font-medium text-gray-300">Select Date Range</h3>
          </div>

          <div className="p-3">
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={
                      tempRange.start
                        ? tempRange.start.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setTempRange({
                        ...tempRange,
                        start: e.target.value ? new Date(e.target.value) : null,
                      })
                    }
                    className="w-full py-1 px-2 bg-gray-700 border border-gray-600 rounded text-gray-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={
                      tempRange.end
                        ? tempRange.end.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setTempRange({
                        ...tempRange,
                        end: e.target.value ? new Date(e.target.value) : null,
                      })
                    }
                    className="w-full py-1 px-2 bg-gray-700 border border-gray-600 rounded text-gray-200 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-xs text-gray-400 mb-2">Presets</h4>
              <div className="grid grid-cols-2 gap-2">
                {presetRanges.map((preset) => (
                  <button
                    key={preset.days}
                    onClick={() => setPresetRange(preset.days)}
                    className="py-1 px-2 text-sm bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-gray-700">
              <button
                onClick={handleCancel}
                className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
