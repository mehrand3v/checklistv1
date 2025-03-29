import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  AnimatePresence,
} from "framer-motion";
import useInspections from "@/hooks/useInspections";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  ChevronLeft,
} from "lucide-react";

const InspectionSwipeCards = ({ onComplete }) => {
  const [inspectionItems, setInspectionItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [failReason, setFailReason] = useState("");
  const [failReasonError, setFailReasonError] = useState("");
  const [inspectionResults, setInspectionResults] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [historicalView, setHistoricalView] = useState(false);
  const [processingCard, setProcessingCard] = useState(false);

  // Get the inspection hook
  const { submitInspection, loading: submissionLoading } = useInspections({
    autoFetch: false,
  });

  // Initialize inspection data
  useEffect(() => {
    setInspectionItems([...inspectionData]);
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
      toast.success("Inspection complete!");
    }
  }, [stats.completed, stats.total]);

  // Submit all inspection results to Firebase
  const handleSubmitInspection = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await submitInspection(inspectionResults);
      toast.success("Inspection submitted successfully!");

      // Reset the form for a new inspection
      setInspectionItems([...inspectionData]);
      setInspectionResults([]);
      setIsCompleted(false);
      setActiveIndex(0);
      setHistoricalView(false);

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
    setHistoricalView(false);
    toast.info("Started new inspection");
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
    toast.success("Item passed!");

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
        if (newItems.length > 0) {
          setActiveIndex(Math.min(activeIndex, newItems.length - 1));
        }
        return newItems;
      });
    },
    [activeIndex]
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
    toast.info("Item failed and documented");
    setProcessingCard(false);
  }, [currentItem, failReason, removeItemFromQueue]);

  // Handle cancel from fail modal - don't remove the item
  const handleCancelFail = () => {
    setShowModal(false);
    setFailReason("");
    setFailReasonError("");
    setProcessingCard(false);
  };

  // Toggle history view
  const toggleHistoryView = () => {
    setHistoricalView((prev) => !prev);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Compact header with minimal spacing */}
      <header className="w-full max-w-md bg-white rounded-lg shadow-sm p-2 mb-2">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <h1 className="text-base font-bold text-gray-900">
              Inspection {stats.completed}/{stats.total}
            </h1>
          </div>
          <div className="flex space-x-1">
            {inspectionResults.length > 0 && (
              <button
                onClick={toggleHistoryView}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors flex items-center"
              >
                {historicalView ? (
                  <>
                    <ChevronLeft className="w-3 h-3 mr-1" />
                    Back
                  </>
                ) : (
                  <>
                    <FileText className="w-3 h-3 mr-1" />
                    Results
                  </>
                )}
              </button>
            )}

            {/* Compact New Inspection button */}
            {(inspectionItems.length === 0 || isCompleted) && (
              <button
                onClick={handleStartNewInspection}
                className="px-2 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors flex items-center"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                New
              </button>
            )}
          </div>
        </div>

        {/* Compact stats display */}
        <div className="flex justify-between items-center text-xs mb-2">
          <div className="flex space-x-3">
            <div className="flex items-center">
              <CheckCircle className="w-3 h-3 text-green-600 mr-1" />
              <span>{stats.passCount}</span>
            </div>
            <div className="flex items-center">
              <XCircle className="w-3 h-3 text-red-600 mr-1" />
              <span>{stats.failCount}</span>
            </div>
          </div>
          <div className="text-xs text-gray-600">
            {stats.percentComplete}% complete
          </div>
        </div>

        {/* Streamlined progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${stats.percentComplete}%` }}
          ></div>
        </div>
      </header>

      {!historicalView ? (
        <>
          {/* Card display area - maximized height for mobile */}
          <div className="relative h-[calc(100vh-160px)] w-full max-w-md mb-1 bg-gray-50 rounded-lg shadow-sm overflow-hidden flex items-center justify-center">
            {inspectionItems.length > 0 ? (
              <AnimatePresence mode="wait">
                {!processingCard && (
                  <InspectionCard
                    key={inspectionItems[inspectionItems.length - 1].id}
                    item={inspectionItems[inspectionItems.length - 1]}
                    onFail={handleFail}
                    onPass={handlePass}
                    onQuickAction={handleQuickAction}
                  />
                )}
              </AnimatePresence>
            ) : (
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <h3 className="text-base font-bold mb-1">
                  Inspection Complete
                </h3>
                <p className="text-sm">All {stats.completed} items reviewed</p>
                <div className="mt-2 flex justify-center space-x-3 text-sm">
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    <span>{stats.passCount}</span>
                  </div>
                  <div className="flex items-center text-red-600">
                    <XCircle className="w-3 h-3 mr-1" />
                    <span>{stats.failCount}</span>
                  </div>
                </div>
                {stats.passRate > 0 && (
                  <div className="mt-1 text-xs text-blue-600 font-medium">
                    Pass rate: {stats.passRate}%
                  </div>
                )}

                <div className="mt-3">
                  <button
                    onClick={handleStartNewInspection}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Start New
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Ultra-compact instructions */}
          {inspectionItems.length > 0 && (
            <div className="w-full max-w-md flex justify-between text-xs text-gray-600 px-2 py-1">
              <div className="flex items-center">
                <XCircle className="w-3 h-3 mr-1 text-red-500" />
                <span>Swipe LEFT to FAIL</span>
              </div>
              <div className="flex items-center">
                <span>Swipe RIGHT to PASS</span>
                <CheckCircle className="w-3 h-3 ml-1 text-green-500" />
              </div>
            </div>
          )}
        </>
      ) : (
        /* Compact Results View */
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-3 mb-2 h-[calc(100vh-120px)] overflow-auto">
          <h2 className="text-sm font-bold mb-2">Inspection Results</h2>
          {inspectionResults.length > 0 ? (
            <div className="space-y-2">
              {inspectionResults.map((result) => (
                <div
                  key={result.id}
                  className={`p-2 rounded text-xs ${
                    result.status === "pass" ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <div className="flex items-start">
                    {result.status === "pass" ? (
                      <CheckCircle className="h-3 w-3 mr-1 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium">
                        Item {result.id}: {result.description}
                      </p>
                      {result.status === "fail" && result.failReason && (
                        <div className="mt-1 text-xs text-gray-700">
                          <span className="font-medium">Issue: </span>
                          {result.failReason}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-3 bg-gray-50 rounded text-sm">
              <p>No inspection results yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Submit button - only show when all items are inspected */}
      {isCompleted && (
        <button
          onClick={handleSubmitInspection}
          disabled={isSubmitting}
          className="w-full max-w-md px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center text-sm mt-1"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              Submitting...
            </>
          ) : (
            <>Submit Inspection</>
          )}
        </button>
      )}

      {/* Compact Fail reason modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white p-3 rounded-lg w-full max-w-md shadow-lg"
          >
            <div className="flex items-center mb-2 text-red-600">
              <AlertTriangle className="h-4 w-4 mr-1" />
              <h3 className="text-base font-bold">Failed Item</h3>
            </div>

            <div className="p-2 bg-gray-50 rounded mb-2 text-sm">
              <p>{currentItem?.description}</p>
            </div>

            <label className="block mb-1 text-sm font-medium text-gray-700">
              Describe the issue:
            </label>
            <textarea
              value={failReason}
              onChange={(e) => {
                setFailReason(e.target.value);
                if (e.target.value.trim()) setFailReasonError("");
              }}
              className={`w-full p-2 border ${
                failReasonError ? "border-red-500" : "border-gray-300"
              } rounded mb-1 h-20 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none`}
              placeholder="Enter issue details..."
            />
            {failReasonError && (
              <p className="text-red-500 text-xs mb-2">{failReasonError}</p>
            )}

            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={handleCancelFail}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitFailReason}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center"
              >
                <XCircle className="h-3 w-3 mr-1" />
                Submit
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toast container - more compact for mobile */}
      <ToastContainer
        position="bottom-center"
        autoClose={2000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        closeButton={false}
        toastStyle={{
          fontSize: "12px",
          padding: "8px 12px",
          minHeight: "40px",
        }}
      />
    </div>
  );
};

const InspectionCard = ({ item, onFail, onPass, onQuickAction }) => {
  const x = useMotionValue(0);
  const controls = useAnimation();
  const [isProcessing, setIsProcessing] = useState(false);

  // Using smaller values in the transform ranges for more responsive visual feedback
  const rotateRaw = useTransform(x, [-150, 0, 150], [-15, 0, 15]);
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);
  const background = useTransform(
    x,
    [-150, -50, 0, 50, 150],
    [
      "rgba(239, 68, 68, 0.2)",
      "rgba(239, 68, 68, 0.1)",
      "rgba(255, 255, 255, 1)",
      "rgba(34, 197, 94, 0.1)",
      "rgba(34, 197, 94, 0.2)",
    ]
  );

  // More sensitive visual indicators for swipe direction
  const failOpacity = useTransform(x, [-150, -20, 0], [1, 0.5, 0]);
  const passOpacity = useTransform(x, [0, 20, 150], [0, 0.5, 1]);

  // Track swipe direction for visual feedback
  const [swipeDirection, setSwipeDirection] = useState(null);

  useEffect(() => {
    const unsubscribe = x.on("change", (latest) => {
      // Provide immediate visual feedback during swipe
      if (latest < -15 && swipeDirection !== "left") {
        setSwipeDirection("left");
      } else if (latest > 15 && swipeDirection !== "right") {
        setSwipeDirection("right");
      } else if (latest > -10 && latest < 10 && swipeDirection !== null) {
        setSwipeDirection(null);
      }
    });

    return () => unsubscribe();
  }, [x, swipeDirection]);

  // Simplified drag handling
  const handleDragEnd = (_, info) => {
    if (isProcessing) return;

    const swipeVelocity = Math.abs(info.velocity.x);
    const currentX = x.get();

    if (currentX < -100 || (currentX < 0 && swipeVelocity > 300)) {
      // Swiped Left - Fail
      setIsProcessing(true);
      animateCardExit("left");
      onFail && onFail(item);
    } else if (currentX > 100 || (currentX > 0 && swipeVelocity > 300)) {
      // Swiped Right - Pass
      setIsProcessing(true);
      animateCardExit("right");
      onPass && onPass(item);
    } else {
      // Return to center if not swiped far enough
      controls.start({
        x: 0,
        transition: {
          type: "spring",
          stiffness: 500,
          damping: 25,
        },
      });
    }
  };

  // Simplified animation for consistent behavior
  const animateCardExit = (direction) => {
    const xTarget = direction === "left" ? -1000 : 1000;

    controls.start({
      x: xTarget,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    });
  };

  // Helper for keyboard/accessibility support
  const handleKeyDown = (e) => {
    if (isProcessing) return;

    if (e.key === "ArrowLeft") {
      setIsProcessing(true);
      onQuickAction("fail", item);
    } else if (e.key === "ArrowRight") {
      setIsProcessing(true);
      onQuickAction("pass", item);
    }
  };

  // Handle quick action buttons
  const handleButtonAction = (action) => {
    if (isProcessing) return;

    setIsProcessing(true);
    onQuickAction(action, item);
  };

  return (
    <motion.div
      className="absolute h-full w-full flex items-center justify-center px-2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="relative w-full h-5/6 bg-white rounded-lg shadow-sm overflow-hidden hover:cursor-grab active:cursor-grabbing"
        style={{
          x,
          rotate: rotateRaw,
          background,
        }}
        animate={controls}
        drag="x"
        dragConstraints={{
          left: 0,
          right: 0,
        }}
        dragElastic={0.9}
        dragMomentum={true}
        onDragEnd={handleDragEnd}
        whileTap={{ cursor: "grabbing" }}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* Card Content - more compact */}
        <div className="flex flex-col h-full p-4">
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
              <span className="text-blue-600 text-lg font-bold">{item.id}</span>
            </div>
            <h2 className="text-base font-medium mb-4 text-gray-800">
              {item.description}
            </h2>

            {/* Swipe indicators */}
            <div className="absolute inset-x-0 bottom-16 flex justify-between px-4">
              <motion.div
                style={{ opacity: failOpacity }}
                className="flex items-center text-red-600"
              >
                <XCircle className="h-6 w-6 mr-1" />
                <span className="font-bold text-sm">FAIL</span>
              </motion.div>

              <motion.div
                style={{ opacity: passOpacity }}
                className="flex items-center text-green-600"
              >
                <span className="font-bold text-sm">PASS</span>
                <CheckCircle className="h-6 w-6 ml-1" />
              </motion.div>
            </div>
          </div>

          {/* Action buttons - smaller and more compact */}
          <div className="mt-auto flex justify-center space-x-4 py-2">
            <button
              onClick={() => handleButtonAction("fail")}
              className="flex items-center justify-center px-4 py-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors shadow-sm active:shadow-none active:translate-y-0.5 text-sm"
              aria-label="Fail inspection item"
              disabled={isProcessing}
            >
              <XCircle className="h-4 w-4 mr-1" />
              FAIL
            </button>
            <button
              onClick={() => handleButtonAction("pass")}
              className="flex items-center justify-center px-4 py-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors shadow-sm active:shadow-none active:translate-y-0.5 text-sm"
              aria-label="Pass inspection item"
              disabled={isProcessing}
            >
              PASS
              <CheckCircle className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InspectionSwipeCards;

// Your inspection data
const inspectionData = [
  { id: 1, description: "Is the hotdog/Grill Area clean ?" },
  {
    id: 2,
    description:
      "Are there product Tags/IDs available for each product on roller grill ?",
  },
  { id: 3, description: "Hotdog Buns labeled and are in date ?" },
  { id: 4, description: "Are tongs clean ? Are Tongs in place ?" },
  { id: 5, description: "Fresh Condiments and Bottle Condiments labeled ?" },
  { id: 6, description: "Under Counter Hotdog Containers labeled properly ?" },
  { id: 7, description: "Is fountain area clean ?" },
  { id: 8, description: "Are fountain machine nozzles free of any buildup ?" },
  {
    id: 9,
    description:
      "Are top of coffee machine and container tops free of beans and dust ?",
  },
  { id: 10, description: "Is coffee area clean ?" },
  {
    id: 11,
    description:
      "Do cold creamers have expiration labels on them and machine free from buildup ?",
  },
  {
    id: 12,
    description: "Pizza Warmer / Flexserve free of any expired products ?",
  },
  {
    id: 13,
    description:
      "Does bakery case has all labels/tags that include calories information",
  },
  { id: 14, description: 'Only "Approved" chemicals in chemical area ?' },
  { id: 15, description: "Any chemical bottle without lid ?" },
  { id: 16, description: "Santizer Bucket prepared and labeled ?" },
  { id: 17, description: "Santizer Sink Prepared and labeled ?" },
  { id: 18, description: "Sanitizer bottle prepared and labeled ?" },
  {
    id: 19,
    description: "Handwashing Sink free of any clutter and Employee Cups/Mugs",
  },
  {
    id: 20,
    description: "Ecosure Logs are in Conspicuous and visible place ?",
  },
  {
    id: 21,
    description:
      "Restrooms Clean and stocked with Handwashing soap,tissue and paper towels ?",
  },
  { id: 22, description: "Dumspter Lid Closed ?" },
  { id: 23, description: "Paper Towels available near handwashing sink ?" },
  { id: 24, description: "Mops Stored properly ?" },
  { id: 25, description: "Cashier knows about 6 food allergens ?" },
  { id: 26, description: "Microwaves clean ?" },
];
