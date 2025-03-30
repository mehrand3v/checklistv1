// components/dashboard/StoreSelector.jsx
import React, { useState, useEffect, useRef } from "react";
import { getStores } from "@/services/inspections/inspectionService";
import {
  Store,
  ChevronDown,
  Search,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const StoreSelector = ({ selectedStore, onStoreChange }) => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        setError(null);
        const storesList = await getStores();
        setStores(storesList);
      } catch (error) {
        console.error("Error fetching stores:", error);
        setError("Failed to load stores");
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

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

  // Filter stores based on search
  const filteredStores = searchValue
    ? stores.filter((store) =>
        store.name.toLowerCase().includes(searchValue.toLowerCase())
      )
    : stores;

  const getSelectedStoreName = () => {
    if (selectedStore === "all") return "All Stores";

    const store = stores.find((s) => s.id === selectedStore);
    return store ? store.name : "Select Store";
  };

  const handleRetry = async () => {
    try {
      setLoading(true);
      setError(null);
      const storesList = await getStores();
      setStores(storesList);
    } catch (error) {
      console.error("Error retrying store fetch:", error);
      setError("Failed to load stores");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        Select Store
      </label>
      <div
        className="flex items-center justify-between bg-gray-800/60 px-4 py-2.5 rounded-lg border border-gray-700/50 cursor-pointer hover:border-blue-500/30 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <Store className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-gray-200">
            {loading
              ? "Loading stores..."
              : error
              ? "Error loading stores"
              : getSelectedStoreName()}
          </span>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-gray-800/95 backdrop-blur-sm border border-gray-700/70 rounded-md shadow-lg max-h-60 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-700/50">
            <div className="relative">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search stores..."
                className="w-full py-2 px-3 pl-9 bg-gray-700/50 border border-gray-600/50 rounded text-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                onClick={(e) => e.stopPropagation()}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Store list */}
          <div className="overflow-y-auto max-h-52">
            {error ? (
              <div className="px-3 py-4 text-center">
                <AlertCircle className="h-5 w-5 text-red-400 mx-auto mb-1" />
                <p className="text-red-300 text-sm mb-2">{error}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRetry();
                  }}
                  className="px-3 py-1 bg-gray-700/80 text-gray-300 rounded text-sm hover:bg-gray-600/80 inline-flex items-center"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </button>
              </div>
            ) : loading ? (
              <div className="px-4 py-3 text-gray-400 text-sm flex items-center justify-center">
                <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-blue-400 rounded-full mr-2"></div>
                Loading stores...
              </div>
            ) : (
              <ul>
                <li
                  className={`px-4 py-2 hover:bg-gray-700/50 cursor-pointer flex items-center ${
                    selectedStore === "all"
                      ? "bg-blue-600/30 text-blue-300"
                      : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStoreChange("all");
                    setIsOpen(false);
                    setSearchValue("");
                  }}
                >
                  <Store className="h-4 w-4 mr-2 text-gray-400" />
                  All Stores
                </li>

                {filteredStores.length > 0 ? (
                  filteredStores.map((store) => (
                    <li
                      key={store.id}
                      className={`px-4 py-2 hover:bg-gray-700/50 cursor-pointer flex items-center ${
                        selectedStore === store.id
                          ? "bg-blue-600/30 text-blue-300"
                          : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onStoreChange(store.id);
                        setIsOpen(false);
                        setSearchValue("");
                      }}
                    >
                      <Store className="h-4 w-4 mr-2 text-gray-400" />
                      {store.name}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-3 text-gray-400 text-sm text-center">
                    No stores match your search
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreSelector;
