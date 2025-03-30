// components/StoreSelector.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStores } from "@/services/inspections/inspectionService";
import {
  Search,
  Store,
  ChevronDown,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";

const StoreSelector = ({ inspectorName, onBack }) => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      setError(null);
      try {
        const storesList = await getStores();
        setStores(storesList);
      } catch (error) {
        console.error("Error fetching stores:", error);
        setError("Failed to load stores. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  const handleStoreSelect = (store) => {
    setSelectedStore(store);
    setIsDropdownOpen(false);
  };

  const handleBeginInspection = () => {
    if (!selectedStore) {
      // Show validation error
      setError("Please select a store before proceeding");
      return;
    }

    // Navigate to inspection page with both inspector name and store information
    navigate("/inspection", {
      state: {
        inspectorName,
        storeId: selectedStore.id,
        storeName: selectedStore.name,
      },
    });
  };

  // Filter stores based on search query
  const filteredStores = searchQuery
    ? stores.filter(
        (store) =>
          store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : stores;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-full max-w-md mt-4 bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20"
    >
      <h2 className="text-xl font-bold mb-2 text-white">Select Store</h2>
      <p className="text-gray-300 text-sm mb-4">
        Hi {inspectorName}, please select the store you're inspecting today.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-400/20 border border-red-500/50 rounded-lg text-white text-sm flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Store selection dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`w-full p-3 flex items-center justify-between bg-gray-800/60 border ${
              selectedStore ? "border-blue-500/50" : "border-gray-700"
            } rounded-lg text-white`}
          >
            <div className="flex items-center">
              <Store className="h-5 w-5 mr-2 text-gray-400" />
              {selectedStore ? (
                <span className="text-blue-300">{selectedStore.name}</span>
              ) : (
                <span className="text-gray-400">Select a store</span>
              )}
            </div>
            <ChevronDown
              className={`h-5 w-5 text-gray-400 transition-transform ${
                isDropdownOpen ? "transform rotate-180" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-gray-800/95 backdrop-blur-sm border border-gray-700/70 rounded-md shadow-lg max-h-60 overflow-hidden">
              {/* Search input */}
              <div className="p-2 border-b border-gray-700/50">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search stores..."
                    className="w-full py-2 px-3 pl-9 bg-gray-700/50 border border-gray-600/50 rounded text-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Store list */}
              <div className="overflow-y-auto max-h-52">
                {loading ? (
                  <div className="px-4 py-3 text-gray-400 text-sm flex items-center justify-center">
                    <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-blue-400 rounded-full mr-2"></div>
                    Loading stores...
                  </div>
                ) : filteredStores.length > 0 ? (
                  <ul>
                    {filteredStores.map((store) => (
                      <li
                        key={store.id}
                        className={`px-4 py-2 hover:bg-gray-700/50 cursor-pointer ${
                          selectedStore?.id === store.id
                            ? "bg-blue-600/30 text-blue-300"
                            : "text-gray-300"
                        }`}
                        onClick={() => handleStoreSelect(store)}
                      >
                        <div className="flex items-center">
                          <Store className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{store.name}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-3 text-gray-400 text-sm text-center">
                    {searchQuery
                      ? "No stores match your search"
                      : "No stores available"}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back
          </button>

          <motion.button
            onClick={handleBeginInspection}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Begin Inspection"
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default StoreSelector;
