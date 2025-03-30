// components/inspection/InspectionSwipeCards.jsx
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

// Import analytics service
import {
  logInspectionStarted,
  logInspectionCompleted,
  logInspectionSubmitted,
  logCustomEvent,
} from "@/services/analytics";

// Import Firebase services
import { submitInspection } from "@/services/inspections/inspectionService";

const InspectionSwipeCards = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const inspectorName = location.state?.inspectorName || "Anonymous Inspector";

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
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);

  // Initialize inspection data
  useEffect(() => {
    // Sort by ID to ensure items are in correct order
    const sortedItems = [...inspectionData].sort((a, b) => a.id - b.id);
    setInspectionItems(sortedItems);

    // Log inspection started event
    logInspectionStarted(inspectorName);
  }, [inspectorName]);

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
      showNotification("Inspection complete! 🎉", "success");

      // Log inspection completed event with stats
      logInspectionCompleted({
        total_items: stats.total,
        pass_count: stats.passCount,
        fail_count: stats.failCount,
        pass_rate: stats.passRate,
      });
    }
  }, [
    stats.completed,
    stats.total,
    stats.passCount,
    stats.failCount,
    stats.passRate,
  ]);

  // Custom notification function
  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 2000);
  };

  // Trigger confetti animation
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
    }, 250);

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 400);
  };

  // Submit inspection results to Firebase
  const handleSubmitInspection = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      // Submit to Firebase
      const inspectionId = await submitInspection(
        inspectionResults,
        inspectorName
      );

      // Log analytics event
      logInspectionSubmitted(inspectionId, {
        total_items: stats.total,
        pass_count: stats.passCount,
        fail_count: stats.failCount,
        pass_rate: stats.passRate,
        inspector_name: inspectorName,
      });

      // Trigger confetti animation
      triggerConfetti();

      showNotification("Report submitted successfully! 👍", "success");
      setShowSubmitModal(false);

      // Reset and navigate with delay
      setTimeout(() => {
        setInspectionItems([...inspectionData].sort((a, b) => a.id - b.id));
        setInspectionResults([]);
        setIsCompleted(false);
        setActiveIndex(0);
        setViewMode("inspection");

        navigate("/");
      }, 2000);
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

  // Start a new inspection (reset everything)
  const handleStartNewInspection = () => {
    setInspectionItems([...inspectionData].sort((a, b) => a.id - b.id));
    setInspectionResults([]);
    setIsCompleted(false);
    setActiveIndex(0);
    setViewMode("inspection");
    showNotification("Started new inspection 🚀", "info");

    // Log analytics event
    logInspectionStarted(inspectorName);
  };

  // Handle the swipe left (fail) action
  const handleFail = useCallback((item) => {
    // Save the item before opening modal
    setCurrentItem({ ...item });
    setProcessingCard(true);
    setShowModal(true);
    setFailReason("");
    setFailReasonError("");

    // Log analytics event
    logCustomEvent("inspection_item_failed_swipe", {
      item_id: item.id,
      item_description: item.description,
    });
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
    showNotification("Item passed! ✅", "success");

    // Log analytics event
    logCustomEvent("inspection_item_passed", {
      item_id: item.id,
      item_description: item.description,
    });

    setProcessingCard(false);
  }, []);

  // Add quick buttons to pass/fail without swiping
  const handleQuickAction = useCallback(
    (action, item) => {
      if (action === "pass") {
        handlePass(item);

        // Log analytics event
        logCustomEvent("inspection_item_passed_button", {
          item_id: item.id,
          item_description: item.description,
        });
      } else if (action === "fail") {
        handleFail(item);

        // Log analytics event
        logCustomEvent("inspection_item_failed_button", {
          item_id: item.id,
          item_description: item.description,
        });
      }
    },
    [handleFail, handlePass]
  );

  // Remove item from the queue after action
  const removeItemFromQueue = useCallback((itemId) => {
    setInspectionItems((prev) => {
      const newItems = prev.filter((v) => v.id !== itemId);
      return newItems;
    });
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
      timestamp: new Date().toISOString(),
    };

    setInspectionResults((prev) => [...prev, result]);
    setFailReason("");
    setShowModal(false);
    removeItemFromQueue(currentItem.id);
    showNotification("Issue noted ✓", "warning");

    // Log analytics event with fail reason
    logCustomEvent("inspection_item_failed_details", {
      item_id: currentItem.id,
      item_description: currentItem.description,
      fail_reason: failReason,
    });

    setProcessingCard(false);
  }, [currentItem, failReason, removeItemFromQueue]);

  // Handle cancel from fail modal - don't remove the item
  const handleCancelFail = () => {
    setShowModal(false);
    setFailReason("");
    setFailReasonError("");
    setProcessingCard(false);
  };

  // Handle updates to inspection results from edited items
  const handleUpdateResults = (updatedResults) => {
    setInspectionResults(updatedResults);
    showNotification("Inspection item updated", "success");

    // Log analytics event
    logCustomEvent("inspection_item_updated", {
      item_count: updatedResults.length,
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
      {/* Custom notification system */}
      {notification && (
        <div
          className={`fixed left-1/2 bottom-6 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm flex items-center ${
            notification.type === "success"
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 border border-emerald-300"
              : notification.type === "error"
              ? "bg-gradient-to-r from-red-500 to-red-600 border border-red-300"
              : notification.type === "warning"
              ? "bg-gradient-to-r from-amber-500 to-amber-600 border border-amber-300"
              : "bg-gradient-to-r from-blue-500 to-blue-600 border border-blue-300"
          }`}
        >
          {notification.type === "success" && (
            <CheckCircle className="w-4 h-4 mr-2" />
          )}
          {notification.type === "error" && (
            <XCircle className="w-4 h-4 mr-2" />
          )}
          {notification.type === "warning" && (
            <AlertCircle className="w-4 h-4 mr-2" />
          )}
          {notification.message}
        </div>
      )}

      {/* Header Component */}
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

      {/* Main Content Area */}
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

      {/* Submission Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <SubmissionModal
            onSubmit={handleSubmitInspection}
            onCancel={() => setShowSubmitModal(false)}
            isSubmitting={isSubmitting}
            error={submissionError}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default InspectionSwipeCards;
