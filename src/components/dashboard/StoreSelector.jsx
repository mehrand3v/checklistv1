// components/dashboard/StoreSelector.jsx
import React, { useState, useEffect } from "react";
import { getStores } from "@/services/inspections/inspectionService";
import { Store, ChevronDown } from "lucide-react";

const StoreSelector = ({ selectedStore, onStoreChange }) => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const storesList = await getStores();
        setStores(storesList);
      } catch (error) {
        console.error("Error fetching stores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Select Store
      </label>
      <div
        className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-gray-200 cursor-pointer shadow-sm hover:border-blue-300 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <Store className="h-5 w-5 text-gray-500 mr-2" />
          <span>
            {loading
              ? "Loading stores..."
              : selectedStore === "all"
              ? "All Stores"
              : stores.find((store) => store.id === selectedStore)?.name ||
                "Select Store"}
          </span>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-gray-500 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          <ul className="py-1">
            <li
              className={`px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center ${
                selectedStore === "all" ? "bg-blue-50 text-blue-700" : ""
              }`}
              onClick={() => {
                onStoreChange("all");
                setIsOpen(false);
              }}
            >
              <Store className="h-4 w-4 mr-2 text-gray-500" />
              All Stores
            </li>

            {loading ? (
              <li className="px-4 py-3 text-gray-500 text-sm">
                Loading stores...
              </li>
            ) : (
              stores.map((store) => (
                <li
                  key={store.id}
                  className={`px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center ${
                    selectedStore === store.id ? "bg-blue-50 text-blue-700" : ""
                  }`}
                  onClick={() => {
                    onStoreChange(store.id);
                    setIsOpen(false);
                  }}
                >
                  <Store className="h-4 w-4 mr-2 text-gray-500" />
                  {store.name}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StoreSelector;
