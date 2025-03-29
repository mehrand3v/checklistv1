// components/inspection/InspectionSwipeCards.jsx - Main component with modern design
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
// Import subcomponents
import InspectionHeader from "./InspectionHeader";
import InspectionCard from "./InspectionCard";
import InspectionFailModal from "./InspectionFailModal";
import InspectionResults from "./InspectionResults";
import InspectionComplete from "./InspectionComplete";
import { inspectionData } from "./inspectionData";

// Import custom hook
import useInspections from "@/hooks/useInspections";

const InspectionSwipeCards = ({ onComplete }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const inspectorName = location.state?.inspectorName || "Unknown";

  const [inspectionItems, setInspectionItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [failReason, setFailReason] = useState("");
  const [failReasonError, setFailReasonError] = useState("");
  const [inspectionResults, setInspectionResults] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState("inspection"); // "inspection", "history", "detail"
  const [processingCard, setProcessingCard] = useState(false);
  const [selectedResultId, setSelectedResultId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Get the inspection hook
  const { submitInspection, loading: submissionLoading } = useInspections({
    autoFetch: false,
  });

  // Initialize inspection data
  useEffect(() => {
    const sortedItems = [...inspectionData].sort((a, b) => a.id - b.id);
    setInspectionItems(sortedItems);
  }, []);

  // Calculate stats for display
  const stats = useMemo(() => {
    const passCount = inspectionResults.filter(
      (item) => item.status === "pass"
    ).length;
    const failCount = inspectionResults.filter(
      (item) => item.status === "fail"
    ).length;
    const total = inspectionData.length;
    const completed = inspectionResults.length;
    const remaining = total - completed;

    return {
      passCount,
      failCount,
      total,
      completed,
      remaining,
      percentComplete: total > 0 ? Math.round((completed / total) * 100) : 0,
      passRate: completed > 0 ? Math.round((passCount / completed) * 100) : 0,
    };
  }, [inspectionResults]);

  // Check if all items have been inspected
  useEffect(() => {
    if (stats.completed === stats.total && stats.total > 0) {
      setIsCompleted(true);
      toast.success("Inspection complete! 🎉");
    }
  }, [stats.completed, stats.total]);
const handleUpdateResults = (updatedResults) => {
  setInspectionResults(updatedResults);
};
  // Submit all inspection results to Firebase
const handleSubmitInspection = async () => {
  if (isSubmitting) return;

  setIsSubmitting(true);
  try {
    // Add inspector name to the inspection data
    const submissionData = {
      results: inspectionResults,
      inspectorName: inspectorName,
      timestamp: new Date().toISOString(),
    };

    await submitInspection(submissionData);
    toast.success("Inspection submitted successfully! 👍");

    // Reset and redirect
    setInspectionItems([...inspectionData]);
    setInspectionResults([]);
    setIsCompleted(false);
    setActiveIndex(0);
    setViewMode("inspection");

    // Navigate back to home page after submission
    navigate("/");

    // Notify parent component that inspection is complete
    if (onComplete && typeof onComplete === "function") {
      onComplete();
    }
  } catch (error) {
    console.error("Error submitting inspection:", error);
    toast.error("Error submitting inspection. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};

  // Start a new inspection (reset everything)
  const handleStartNewInspection = () => {
    setInspectionItems([...inspectionData]);
    setInspectionResults([]);
    setIsCompleted(false);
    setActiveIndex(0);
    setViewMode("inspection");
    toast.info("Started new inspection 🚀");
  };

  // Handle the swipe left (fail) action
  const handleFail = useCallback((item) => {
    // Save the item before opening modal
    setCurrentItem({ ...item });
    setProcessingCard(true);
    setShowModal(true);
    setFailReason("");
    setFailReasonError("");
  }, []);

  // Handle the swipe right (pass) action
  const handlePass = useCallback((item) => {
    setProcessingCard(true);

    const result = {
      id: item.id,
      description: item.description,
      status: "pass",
      timestamp: new Date().toISOString(),
    };

    setInspectionResults((prev) => [...prev, result]);
    removeItemFromQueue(item.id);
    toast.success("Item passed! ✅");

    setProcessingCard(false);
  }, []);

  // Add quick buttons to pass/fail without swiping
  const handleQuickAction = useCallback(
    (action, item) => {
      if (action === "pass") {
        handlePass(item);
      } else if (action === "fail") {
        handleFail(item);
      }
    },
    [handleFail, handlePass]
  );

  // Remove item from the queue after action
  const removeItemFromQueue = useCallback(
    (itemId) => {
      setInspectionItems((prev) => {
        const newItems = prev.filter((v) => v.id !== itemId);

        return newItems;
      });
    },
    []
  );

  // Submit fail reason from modal
  const submitFailReason = useCallback(() => {
    if (!failReason.trim()) {
      setFailReasonError("Please describe the issue before submitting");
      return;
    }

    const result = {
      id: currentItem.id,
      description: currentItem.description,
      status: "fail",
      failReason: failReason,
      timestamp: new Date().toISOString(),
    };

    setInspectionResults((prev) => [...prev, result]);
    setFailReason("");
    setShowModal(false);
    removeItemFromQueue(currentItem.id);
    toast.info("Item failed and documented 📝");
    setProcessingCard(false);
  }, [currentItem, failReason, removeItemFromQueue]);

  // Handle cancel from fail modal - don't remove the item
  const handleCancelFail = () => {
    setShowModal(false);
    setFailReason("");
    setFailReasonError("");
    setProcessingCard(false);
  };

  // Toggle between views
  const setView = (view, resultId = null) => {
    setViewMode(view);
    if (resultId !== null) {
      setSelectedResultId(resultId);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto relative min-h-[100dvh] bg-gradient-to-b from-gray-900 via-indigo-950 to-purple-950 py-2 px-4">
      {/* Header Component - reduced margin */}
      <div className="w-full mt-1 mb-1">
        <InspectionHeader
          stats={stats}
          viewMode={viewMode}
          setView={setView}
          hasResults={inspectionResults.length > 0}
          onStartNew={handleStartNewInspection}
          isCompleted={isCompleted || inspectionItems.length === 0}
        />
      </div>

      {/* Main Content Area - Positioned further up the page */}
      <motion.div
        className="relative h-[calc(100dvh-150px)] w-full my-1 overflow-hidden flex items-center justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <AnimatePresence mode="wait">
          {viewMode === "inspection" && (
            <motion.div
              key="inspection-view"
              className="w-full h-full"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {inspectionItems.length > 0 ? (
                !processingCard && (
                  <InspectionCard
                    key={inspectionItems[0].id}
                    item={inspectionItems[0]}
                    onFail={handleFail}
                    onPass={handlePass}
                    onQuickAction={handleQuickAction}
                  />
                )
              ) : (
                <InspectionComplete
                  stats={stats}
                  onStartNew={handleStartNewInspection}
                />
              )}
            </motion.div>
          )}

          {viewMode === "history" && (
            <motion.div
              key="history-view"
              className="w-full h-full"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <InspectionResults
                results={inspectionResults}
                onSelectResult={(id) => setView("detail", id)}
                onBack={() => setView("inspection")}
                onUpdateResults={handleUpdateResults}
              />
            </motion.div>
          )}

          {viewMode === "detail" && (
            <motion.div
              key="detail-view"
              className="w-full h-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <InspectionResults
                results={inspectionResults.filter(
                  (r) => r.id === selectedResultId
                )}
                onBack={() => setView("history")}
                isDetailView={true}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Swipe instructions - only show during active inspection */}
      {viewMode === "inspection" && inspectionItems.length > 0 && (
        <div className="w-full flex justify-between text-xs text-gray-400 px-2 py-1 bg-gray-800/50 rounded-lg border border-gray-700/50 mb-1">
          <div className="flex items-center text-red-400 font-medium">
            <span>← Swipe LEFT to FAIL</span>
          </div>
          <div className="flex items-center text-green-400 font-medium">
            <span>Swipe RIGHT to PASS →</span>
          </div>
        </div>
      )}

      {/* Submit button - only show when all items are inspected */}
      {isCompleted && viewMode === "inspection" && (
        <motion.button
          onClick={handleSubmitInspection}
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center text-sm mt-1 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0 transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit Inspection
            </>
          )}
        </motion.button>
      )}

      {/* Fail Modal Component */}
      <AnimatePresence>
        {showModal && (
          <InspectionFailModal
            currentItem={currentItem}
            failReason={failReason}
            failReasonError={failReasonError}
            onCancel={handleCancelFail}
            onSubmit={submitFailReason}
            onChangeReason={(value) => {
              setFailReason(value);
              if (value.trim()) setFailReasonError("");
            }}
          />
        )}
      </AnimatePresence>

      {/* Toast container - more modern for mobile */}
      <ToastContainer
        position="bottom-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        closeButton={false}
        progressStyle={{ backgroundColor: "#3B82F6" }}
        toastStyle={{
          fontSize: "13px",
          padding: "10px 16px",
          minHeight: "50px",
          borderRadius: "10px",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          backgroundColor: "#fff",
          border: "1px solid rgba(0, 0, 0, 0.05)",
        }}
      />
    </div>
  );
};

export default InspectionSwipeCards;
