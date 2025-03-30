// components/dashboard/DateRangePicker.jsx
import React, { useState, useEffect, useRef } from "react";
import { Calendar, ChevronDown, CalendarDays } from "lucide-react";

const DateRangePicker = ({ range, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState(range);
  const dropdownRef = useRef(null);

  // Update temp range when range prop changes
  useEffect(() => {
    setTempRange(range);
  }, [range]);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Remove event listener on cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatDate = (date) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const handleApply = () => {
    // Validate dates before applying
    if (!tempRange.start || !tempRange.end) {
      // Show error or alert user
      return;
    }

    // Ensure end date is not before start date
    if (tempRange.start > tempRange.end) {
      const swapped = {
        start: tempRange.end,
        end: tempRange.start,
      };
      onChange(swapped);
    } else {
      onChange(tempRange);
    }

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

  const handleChange = (type, value) => {
    try {
      const date = value ? new Date(value) : null;
      setTempRange((prev) => ({
        ...prev,
        [type]: date,
      }));
    } catch (error) {
      console.error("Invalid date:", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center px-3 py-2 bg-gray-800/40 border border-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-700/40 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Calendar className="h-4 w-4 mr-2" />
        <span className="truncate">
          {formatDate(range.start)} - {formatDate(range.end)}
        </span>
        <ChevronDown
          className={`h-4 w-4 ml-2 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-800/95 backdrop-blur-sm border border-gray-700/70 rounded-lg shadow-xl z-10">
          <div className="p-3 border-b border-gray-700/50">
            <div className="flex items-center">
              <CalendarDays className="h-5 w-5 text-blue-400 mr-2" />
              <h3 className="font-medium text-gray-300">Select Date Range</h3>
            </div>
          </div>

          <div className="p-4">
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-3">
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
                    onChange={(e) => handleChange("start", e.target.value)}
                    className="w-full py-1.5 px-2 bg-gray-700/50 border border-gray-600/50 rounded text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
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
                    onChange={(e) => handleChange("end", e.target.value)}
                    className="w-full py-1.5 px-2 bg-gray-700/50 border border-gray-600/50 rounded text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-xs text-gray-400 mb-2">Quick Presets</h4>
              <div className="grid grid-cols-2 gap-2">
                {presetRanges.map((preset) => (
                  <button
                    key={preset.days}
                    onClick={() => setPresetRange(preset.days)}
                    className="py-1.5 px-2 text-sm bg-gray-700/60 hover:bg-gray-600/70 rounded text-gray-300 transition-colors border border-gray-600/30"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-gray-700/50">
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 text-sm bg-gray-700/70 hover:bg-gray-600/70 rounded text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-3 py-1.5 text-sm bg-blue-600/60 hover:bg-blue-600/70 rounded text-white transition-colors"
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
