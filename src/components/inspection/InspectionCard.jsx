// components/inspection/InspectionCard.jsx - Optimized for mobile
import React from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
} from "framer-motion";
import { ThumbsUp, ThumbsDown, ArrowRight, ArrowLeft } from "lucide-react";

const InspectionCard = ({ item, onFail, onPass, onQuickAction }) => {
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
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.9}
        dragMomentum={true}
        onDragEnd={handleDragEnd}
        whileTap={{ cursor: "grabbing" }}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* Card content */}
        <div className="flex flex-col h-full p-2 pt-2">
          {/* Item number badge */}
          <div className="self-center mb-1">
            <motion.div
              className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md border border-indigo-400/30"
              whileHover={{ scale: 1.1 }}
            >
              <span className="text-white text-base font-bold">{item.id}</span>
            </motion.div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center px-3 pt-2">
            <h2 className="text-base font-semibold mb-4 text-indigo-200 transition-all duration-300 hover:text-white">
              {item.description}
            </h2>

            {/* Swipe indicators */}
            <div className="absolute inset-x-0 bottom-20 flex justify-between px-3">
              <motion.div
                style={{ opacity: failOpacity }}
                className="flex items-center space-x-1 bg-red-500/20 rounded-full px-2 py-0.5 shadow-sm border border-red-500/30"
              >
                <ArrowLeft className="h-3 w-3 text-red-400" />
                <span className="font-bold text-xs text-red-400">FAIL</span>
              </motion.div>

              <motion.div
                style={{ opacity: passOpacity }}
                className="flex items-center space-x-1 bg-green-500/20 rounded-full px-2 py-0.5 shadow-sm border border-green-500/30"
              >
                <span className="font-bold text-xs text-green-400">PASS</span>
                <ArrowRight className="h-3 w-3 text-green-400" />
              </motion.div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-auto mb-2 flex justify-center space-x-4 py-1">
            <button
              onClick={() => handleButtonAction("fail")}
              className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md transform hover:-translate-y-0.5 active:translate-y-0 text-sm font-medium border border-red-500/30"
              aria-label="Fail inspection item"
              disabled={isProcessing}
            >
              <ThumbsDown className="h-3 w-3 mr-1" />
              FAIL
            </button>
            <button
              onClick={() => handleButtonAction("pass")}
              className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md transform hover:-translate-y-0.5 active:translate-y-0 text-sm font-medium border border-green-500/30"
              aria-label="Pass inspection item"
              disabled={isProcessing}
            >
              PASS
              <ThumbsUp className="h-3 w-3 ml-1" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InspectionCard;
