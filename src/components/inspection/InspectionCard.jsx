// components/inspection/InspectionCard.jsx - Swipeable card component with modern design
import React, { useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  AnimatePresence,
} from "framer-motion";
import {
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  ArrowLeft,
  CheckSquare,
  AlertCircle,
} from "lucide-react";
import styles from "./bubble.module.css";

const BubbleText = ({ text }) => {
  return (
    <span className="text-center">
      {text.split("").map((child, idx) => (
        <span className={styles.hoverText} key={idx}>
          {child}
        </span>
      ))}
    </span>
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
      "rgba(17, 24, 39, 0.7)",
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
        className="relative w-full h-5/6 bg-gray-900/80 rounded-xl overflow-hidden hover:cursor-grab active:cursor-grabbing border border-gray-700/50 shadow-lg backdrop-blur-sm"
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
        {/* Glass card content */}
        <div className="flex flex-col h-full p-5 pt-3">
          {/* Item number badge */}
          <div className="self-center mb-3">
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-5 shadow-md border border-indigo-400/30"
              whileHover={{
                scale: 1.1,
                boxShadow: "0 0 20px rgba(129, 140, 248, 0.5)",
              }}
            >
              <span className="text-white text-xl font-bold">{item.id}</span>
            </motion.div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h2 className="text-lg font-semibold mb-6 text-indigo-200 px-2 transition-all duration-300 hover:text-white hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]">
              {item.description}
            </h2>

            {/* Swipe indicators with new design */}
            <div className="absolute inset-x-0 bottom-28 flex justify-between px-6">
              <motion.div
                style={{ opacity: failOpacity }}
                className="flex items-center space-x-1 bg-red-500/20 rounded-full px-3 py-1 shadow-sm border border-red-500/30"
              >
                <ArrowLeft className="h-5 w-5 text-red-400" />
                <span className="font-bold text-sm text-red-400">
                  SWIPE TO FAIL
                </span>
              </motion.div>

              <motion.div
                style={{ opacity: passOpacity }}
                className="flex items-center space-x-1 bg-green-500/20 rounded-full px-3 py-1 shadow-sm border border-green-500/30"
              >
                <span className="font-bold text-sm text-green-400">
                  SWIPE TO PASS
                </span>
                <ArrowRight className="h-5 w-5 text-green-400" />
              </motion.div>
            </div>
          </div>

          {/* Action buttons with neon-style design */}
          <div className="mt-auto mb-2 flex justify-center space-x-4 py-2">
            <button
              onClick={() => handleButtonAction("fail")}
              className="flex items-center justify-center px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0 font-medium border border-red-500/30"
              aria-label="Fail inspection item"
              disabled={isProcessing}
            >
              <ThumbsDown className="h-4 w-4 mr-2 text-white" />
              FAIL
            </button>
            <button
              onClick={() => handleButtonAction("pass")}
              className="flex items-center justify-center px-5 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0 font-medium border border-green-500/30"
              aria-label="Pass inspection item"
              disabled={isProcessing}
            >
              PASS
              <ThumbsUp className="h-4 w-4 ml-2 text-white" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InspectionCard;
