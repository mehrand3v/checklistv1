// components/inspection/InspectionSwipeCards.jsx - Optimized for mobile
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";

// Import subcomponents
import InspectionHeader from "./InspectionHeader";
import InspectionCard from "./InspectionCard";
import InspectionFailModal from "./InspectionFailModal";
import InspectionResults from "./InspectionResults";
import InspectionComplete from "./InspectionComplete";
import SubmissionModal from "./SubmissionModal";
import { inspectionData } from "./inspectionData";

// Import services
import {
  logInspectionStarted,
  logInspectionCompleted,
  logInspectionSubmitted,
  logCustomEvent,
} from "@/services/analytics";
import { submitInspection } from "@/services/inspections/inspectionService";

const InspectionSwipeCards = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get inspector name and store information from location state
  const inspectorName = location.state?.inspectorName || "Anonymous";
  const storeId = location.state?.storeId || null;
  const storeName = location.state?.storeName || "Unknown Store";

  // Redirect if essential information is missing
  useEffect(() => {
    if (!inspectorName || !storeId) {
      navigate("/");
    }
  }, [inspectorName, storeId, navigate]);

  const [inspectionItems, setInspectionItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [failReason, setFailReason] = useState("");
  const [failReasonError, setFailReasonError] = useState("");
  const [isFixed, setIsFixed] = useState(false);
  const [inspectionResults, setInspectionResults] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState("inspection"); // "inspection", "history", "detail"
  const [processingCard, setProcessingCard] = useState(false);
  const [selectedResultId, setSelectedResultId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);

  // Initialize inspection data
  useEffect(() => {
    const sortedItems = [...inspectionData].sort((a, b) => a.id - b.id);
    setInspectionItems(sortedItems);
    logInspectionStarted(inspectorName, { storeId, storeName });
  }, [inspectorName, storeId, storeName]);

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

    return {
      passCount,
      failCount,
      total,
      completed,
      remaining: total - completed,
      percentComplete: total > 0 ? Math.round((completed / total) * 100) : 0,
      passRate: completed > 0 ? Math.round((passCount / completed) * 100) : 0,
    };
  }, [inspectionResults]);

  // Check if all items have been inspected
  useEffect(() => {
    if (stats.completed === stats.total && stats.total > 0) {
      setIsCompleted(true);
      showNotification("Inspection complete! 🎉", "success");
      logInspectionCompleted({
        total_items: stats.total,
        pass_count: stats.passCount,
        fail_count: stats.failCount,
        pass_rate: stats.passRate,
        storeId,
        storeName,
      });
    }
  }, [stats, storeId, storeName]);

  // Custom notification function
  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2000);
  };

  // Trigger confetti animation
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Submit inspection results
  const handleSubmitInspection = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const inspectionId = await submitInspection(
        inspectionResults,
        inspectorName,
        storeId,
        storeName
      );

      logInspectionSubmitted(inspectionId, {
        total_items: stats.total,
        pass_count: stats.passCount,
        fail_count: stats.failCount,
        pass_rate: stats.passRate,
        inspector_name: inspectorName,
        store_id: storeId,
        store_name: storeName,
      });

      triggerConfetti();
      showNotification("Report submitted successfully! 👍", "success");
      setShowSubmitModal(false);

      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error("Error submitting report:", error);
      setSubmissionError(
        error.message || "Failed to submit report. Please try again."
      );
      showNotification("Error submitting report. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open submission modal
  const handleOpenSubmitModal = () => {
    setShowSubmitModal(true);
    setSubmissionError(null);
  };

  // Handle the swipe left (fail) action
  const handleFail = useCallback(
    (item) => {
      setCurrentItem({ ...item });
      setProcessingCard(true);
      setShowModal(true);
      setFailReason("");
      setFailReasonError("");
      setIsFixed(false);

      logCustomEvent("inspection_item_failed_swipe", {
        item_id: item.id,
        item_description: item.description,
        store_id: storeId,
        store_name: storeName,
      });
    },
    [storeId, storeName]
  );

  // Handle the swipe right (pass) action
  const handlePass = useCallback(
    (item) => {
      setProcessingCard(true);

      const result = {
        id: item.id,
        description: item.description,
        status: "pass",
        timestamp: new Date().toISOString(),
      };

      setInspectionResults((prev) => [...prev, result]);
      removeItemFromQueue(item.id);
      showNotification("Item passed! ✅", "success");

      logCustomEvent("inspection_item_passed", {
        item_id: item.id,
        item_description: item.description,
        store_id: storeId,
        store_name: storeName,
      });

      setProcessingCard(false);
    },
    [storeId, storeName]
  );

  // Add quick buttons to pass/fail without swiping
  const handleQuickAction = useCallback(
    (action, item) => {
      if (action === "pass") {
        handlePass(item);
        logCustomEvent("inspection_item_passed_button", {
          item_id: item.id,
          item_description: item.description,
          store_id: storeId,
          store_name: storeName,
        });
      } else if (action === "fail") {
        handleFail(item);
        logCustomEvent("inspection_item_failed_button", {
          item_id: item.id,
          item_description: item.description,
          store_id: storeId,
          store_name: storeName,
        });
      }
    },
    [handleFail, handlePass, storeId, storeName]
  );

  // Remove item from the queue after action
  const removeItemFromQueue = useCallback((itemId) => {
    setInspectionItems((prev) => prev.filter((v) => v.id !== itemId));
  }, []);

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
      isFixed: isFixed,
      timestamp: new Date().toISOString(),
    };

    setInspectionResults((prev) => [...prev, result]);
    setFailReason("");
    setIsFixed(false);
    setShowModal(false);
    removeItemFromQueue(currentItem.id);

    showNotification(
      isFixed ? "Issue noted and marked as fixed ✓" : "Issue noted ✓",
      isFixed ? "success" : "warning"
    );

    logCustomEvent("inspection_item_failed_details", {
      item_id: currentItem.id,
      item_description: currentItem.description,
      fail_reason: failReason,
      is_fixed: isFixed,
      store_id: storeId,
      store_name: storeName,
    });

    setProcessingCard(false);
  }, [
    currentItem,
    failReason,
    isFixed,
    removeItemFromQueue,
    storeId,
    storeName,
  ]);

  // Handle cancel from fail modal
  const handleCancelFail = () => {
    setShowModal(false);
    setFailReason("");
    setFailReasonError("");
    setProcessingCard(false);
  };

  // Handle updates to inspection results
  const handleUpdateResults = (updatedResults) => {
    setInspectionResults(updatedResults);
    showNotification("Inspection item updated", "success");
    logCustomEvent("inspection_item_updated", {
      item_count: updatedResults.length,
      store_id: storeId,
      store_name: storeName,
    });
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
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto min-h-screen bg-gradient-to-b from-gray-900 via-indigo-950 to-purple-950 p-1">
      {/* Store indicator - more compact */}
      <div className="w-full bg-indigo-900/30 rounded-lg px-2 py-1 mb-1 flex items-center justify-between text-xs">
        <div className="flex items-center">
          <span className="text-gray-300">Store:</span>
          <span className="ml-1 text-blue-300 font-medium">{storeName}</span>
        </div>
        <div className="text-gray-400">{inspectorName}</div>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`fixed bottom-4 z-50 px-3 py-1 rounded-lg shadow-lg text-white text-xs flex items-center ${
            notification.type === "success"
              ? "bg-green-600"
              : notification.type === "error"
              ? "bg-red-600"
              : notification.type === "warning"
              ? "bg-amber-600"
              : "bg-blue-600"
          }`}
        >
          {notification.type === "success" && (
            <CheckCircle className="w-3 h-3 mr-1" />
          )}
          {notification.type === "error" && (
            <XCircle className="w-3 h-3 mr-1" />
          )}
          {notification.type === "warning" && (
            <AlertCircle className="w-3 h-3 mr-1" />
          )}
          {notification.message}
        </div>
      )}

      {/* Header - more compact */}
      <div className="w-full">
        <InspectionHeader
          stats={stats}
          viewMode={viewMode}
          setView={setView}
          hasResults={inspectionResults.length > 0}
          onStartNew={() => {}} // Removed this feature to simplify
          isCompleted={isCompleted || inspectionItems.length === 0}
        />
      </div>

      {/* Main Content Area - taller with less padding */}
      <motion.div
        className="relative h-[calc(100vh-120px)] w-full my-1 overflow-hidden flex items-center justify-center"
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
                  onStartNew={() => {}} // Removed this feature to simplify
                  onSubmitInspection={handleOpenSubmitModal}
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
                onUpdateResults={handleUpdateResults}
                isDetailView={true}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Swipe instructions - only show during active inspection, more compact */}
      {viewMode === "inspection" && inspectionItems.length > 0 && (
        <div className="w-full flex justify-between text-xs text-gray-400 px-2 py-1 bg-gray-800/50 rounded-lg mb-1">
          <div className="text-red-400 font-medium">← Swipe LEFT to FAIL</div>
          <div className="text-green-400 font-medium">
            Swipe RIGHT to PASS →
          </div>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showModal && (
          <InspectionFailModal
            currentItem={currentItem}
            failReason={failReason}
            failReasonError={failReasonError}
            isFixed={isFixed}
            onCancel={handleCancelFail}
            onSubmit={submitFailReason}
            onChangeReason={(value) => {
              setFailReason(value);
              if (value.trim()) setFailReasonError("");
            }}
            onChangeFixed={(value) => setIsFixed(value)}
          />
        )}

        {showSubmitModal && (
          <SubmissionModal
            onSubmit={handleSubmitInspection}
            onCancel={() => setShowSubmitModal(false)}
            isSubmitting={isSubmitting}
            error={submissionError}
            storeName={storeName}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default InspectionSwipeCards;
