// components/inspection/InspectionCard.jsx - Optimized for mobile with integrated progress
import React from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
} from "framer-motion";
import {
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ClipboardList,
} from "lucide-react";

const InspectionCard = ({
  item,
  onFail,
  onPass,
  onQuickAction,
  stats, // Added stats prop
  viewMode,
  setView,
  hasResults,
}) => {
  const x = useMotionValue(0);
  const controls = useAnimation();
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Transform values for visual feedback
  const rotateRaw = useTransform(x, [-150, 0, 150], [-15, 0, 15]);
  const background = useTransform(
    x,
    [-150, -50, 0, 50, 150],
    [
      "rgba(239, 68, 68, 0.2)",
      "rgba(239, 68, 68, 0.1)",
      "rgba(17, 24, 39, 0.7)",
      "rgba(34, 197, 94, 0.1)",
      "rgba(34, 197, 94, 0.2)",
    ]
  );

  // Direction indicators
  const failOpacity = useTransform(x, [-150, -20, 0], [1, 0.5, 0]);
  const passOpacity = useTransform(x, [0, 20, 150], [0, 0.5, 1]);

  // Track swipe direction
  const [swipeDirection, setSwipeDirection] = React.useState(null);

  React.useEffect(() => {
    const unsubscribe = x.on("change", (latest) => {
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

  // Handle drag end
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

  // Animation for card exit
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

  // Handle keyboard/accessibility
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

  // Handle button actions
  const handleButtonAction = (action) => {
    if (isProcessing) return;
    setIsProcessing(true);
    onQuickAction(action, item);
  };

  return (
    <motion.div
      className="absolute h-full w-full flex items-center justify-center px-1"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      style={{
        marginTop: "40px", // Push card down to avoid address bar
      }}
    >
      <motion.div
        className="relative w-full h-5/6 bg-gray-900/70 rounded-xl overflow-hidden hover:cursor-grab active:cursor-grabbing shadow-xl backdrop-blur-sm"
        style={{
          x,
          rotate: rotateRaw,
          background,
        }}
        animate={controls}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.9}
        dragMomentum={true}
        onDragEnd={handleDragEnd}
        whileTap={{ cursor: "grabbing" }}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* Integrated Header with Progress - New! */}
        <div className="w-full bg-gray-800/40 p-1.5">
          <div className="flex items-center justify-between gap-1">
            {/* Left side - Counter */}
            <div className="text-xs font-medium text-gray-300 whitespace-nowrap">
              {stats.completed}/{stats.total} Items
            </div>

            {/* Center - Back button for non-inspection views */}
            {viewMode !== "inspection" && (
              <button
                onClick={() => setView("inspection")}
                className="p-1 hover:bg-gray-700 rounded-full transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-300" />
              </button>
            )}

            {/* Right side - Stats */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center bg-green-900/20 px-1 py-0.5 rounded-md">
                <CheckCircle className="w-3 h-3 text-green-400 mr-1" />
                <span className="text-xs text-green-300 font-medium">
                  {stats.passCount}
                </span>
              </div>
              <div className="flex items-center bg-red-900/20 px-1 py-0.5 rounded-md">
                <XCircle className="w-3 h-3 text-red-400 mr-1" />
                <span className="text-xs text-red-300 font-medium">
                  {stats.failCount}
                </span>
              </div>
              {hasResults && (
                <button
                  onClick={() => setView("history")}
                  className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                  title="View history"
                >
                  <ClipboardList className="w-4 h-4 text-indigo-300" />
                </button>
              )}
            </div>
          </div>

          {/* Compact progress bar */}
          <div className="w-full bg-gray-700/30 rounded-full h-1.5 mt-1 overflow-hidden">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-indigo-400/80 to-purple-500/80"
              style={{ width: `${stats.percentComplete}%` }}
            ></div>
          </div>
        </div>

        {/* Card content */}
        <div className="flex flex-col h-[calc(100%-48px)] p-2 pt-2">
          {/* Item number badge */}
          <div className="self-center mb-1">
            <motion.div
              className="w-10 h-10 bg-gradient-to-br from-indigo-500/90 to-purple-600/90 rounded-full flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1 }}
            >
              <span className="text-white text-base font-bold">{item.id}</span>
            </motion.div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center px-3 pt-2">
            <h2 className="text-base font-semibold mb-6 text-white/90 transition-all duration-300 hover:text-white">
              {item.description}
            </h2>
          </div>

          {/* Action buttons */}
          <div className="mt-auto mb-2 flex justify-center space-x-4 py-1">
            <button
              onClick={() => handleButtonAction("fail")}
              className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-red-600/90 to-red-700/90 text-white rounded-full hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 text-sm font-medium"
              aria-label="Fail inspection item"
              disabled={isProcessing}
            >
              <svg
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                width="18px"
                height="18px"
                className="mr-1"
              >
                <path
                  fill="#FFFFFF"
                  d="M206 140v36c0 25.13-8.28 42-8.64 42.68a6 6 0 1 1-10.73-5.36c.07-.14 7.37-15.19 7.37-37.32v-36a14 14 0 0 0-28 0v4a6 6 0 0 1-12 0v-20a14 14 0 0 0-28 0v12a6 6 0 0 1-12 0V68a14 14 0 0 0-28 0v108a6 6 0 0 1-11.09 3.17l-18.68-30a1 1 0 0 1-.1-.17a14 14 0 0 0-24.25 14l29.29 50a6 6 0 1 1-10.36 6l-29.32-50a26 26 0 0 1 45-26.13L74 155V68a26 26 0 0 1 52 0v34.1a26 26 0 0 1 39.42 16.39A26 26 0 0 1 206 140m34-90h-57.52l21.76-21.76a6 6 0 0 0-8.49-8.48l-32 32a6 6 0 0 0 0 8.48l32 32a6 6 0 0 0 8.49-8.48L182.48 62H240a6 6 0 0 0 0-12"
                />
              </svg>
              FAIL
            </button>
            <button
              onClick={() => handleButtonAction("pass")}
              className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-600/90 to-green-700/90 text-white rounded-full hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 text-sm font-medium"
              aria-label="Pass inspection item"
              disabled={isProcessing}
            >
              PASS
              <svg
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                width="18px"
                height="18px"
                className="ml-1"
              >
                <path
                  fill="#FFFFFF"
                  d="M206 140v36c0 25.13-8.28 42-8.64 42.68A6 6 0 0 1 192 222a5.87 5.87 0 0 1-2.68-.64a6 6 0 0 1-2.68-8c.07-.14 7.37-15.19 7.37-37.32V140a14 14 0 0 0-28 0v4a6 6 0 0 1-12 0v-20a14 14 0 0 0-28 0v12a6 6 0 0 1-12 0V68a14 14 0 0 0-28 0v108a6 6 0 0 1-11.09 3.17l-18.68-30a1 1 0 0 1-.1-.17a14 14 0 0 0-24.25 14l29.29 50a6 6 0 1 1-10.37 6l-29.32-50a26 26 0 0 1 45-26.13L74 155V68a26 26 0 0 1 52 0v34.1a26 26 0 0 1 39.42 16.39A26 26 0 0 1 206 140m38.24-88.24l-32-32a6 6 0 0 0-8.48 8.48L225.51 50H168a6 6 0 1 0 0 12h57.51l-21.75 21.76a6 6 0 1 0 8.48 8.48l32-32a6 6 0 0 0 0-8.48"
                />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InspectionCard;
