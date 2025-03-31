import { useState, useEffect, useRef } from "react";

/**
 * Custom hook that automatically scales content to fit within the viewport
 * @param {Object} options Configuration options
 * @param {number} options.targetHeight The ideal height the content should have (e.g. 800)
 * @param {number} options.minScale Minimum scale factor to apply (default: 0.5)
 * @param {number} options.maxScale Maximum scale factor to apply (default: 1)
 * @returns {Object} Container ref and calculated scale value
 */
const useAutoScale = ({
  targetHeight = 800,
  minScale = 0.5,
  maxScale = 1,
} = {}) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;

      // Get available height (viewport height minus any margins/padding)
      const availableHeight = window.innerHeight;

      // Calculate scale factor based on target height and available height
      let scaleFactor = availableHeight / targetHeight;

      // Constrain scale factor to min/max bounds
      scaleFactor = Math.max(minScale, Math.min(maxScale, scaleFactor));

      // Update scale state
      setScale(scaleFactor);

      // Apply scale via CSS variable to the container
      if (containerRef.current) {
        containerRef.current.style.setProperty("--scale-factor", scaleFactor);
      }
    };

    // Calculate scale on mount and when window resizes
    updateScale();
    window.addEventListener("resize", updateScale);

    // Ensure content is visible without scrolling
    document.body.style.overflow = "hidden";

    // Clean up event listener and restore overflow
    return () => {
      window.removeEventListener("resize", updateScale);
      document.body.style.overflow = "";
    };
  }, [targetHeight, minScale, maxScale]);

  return { containerRef, scale };
};

export default useAutoScale;
