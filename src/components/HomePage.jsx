// components/HomePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useMotionTemplate,
  useMotionValue,
  motion,
  animate,
} from "framer-motion";
import { ClipboardCheck, ChevronRight, User, Lock } from "lucide-react";
import StoreSelector from "./inspection/StoreSelector";

const COLORS = ["#3B82F6", "#10B981", "#6366F1", "#8B5CF6"];

const HomePage = () => {
  const navigate = useNavigate();
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [showStoreSelector, setShowStoreSelector] = useState(false);
  const [inspectorName, setInspectorName] = useState("");
  const [formError, setFormError] = useState("");

  const color = useMotionValue(COLORS[0]);

  useEffect(() => {
    animate(color, COLORS, {
      ease: "easeInOut",
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, []);

  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #1E293B 30%, ${color})`;
  const border = useMotionTemplate`1px solid ${color}`;
  const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;

  const handleStartInspection = () => {
    setShowInspectionForm(true);
  };

  const handleSubmitInspection = (e) => {
    e.preventDefault();

    if (!inspectorName.trim()) {
      setFormError("Please enter your name");
      return;
    }

    // Instead of navigating directly to inspection, show store selector
    setShowInspectionForm(false);
    setShowStoreSelector(true);
  };

  const handleAdminLogin = () => {
    navigate("/login");
  };

  return (
    <motion.section
      style={{
        backgroundImage,
      }}
      className="relative min-h-screen overflow-hidden px-4 py-24 text-gray-200"
    >
      {/* Admin login button - positioned in the top-right corner with theme colors */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        onClick={handleAdminLogin}
        className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-primary/80 border border-primary/30 hover:bg-primary/90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-md"
        aria-label="Admin Login"
      >
        <Lock className="h-4 w-4 text-primary-foreground" />
      </motion.button>

      <div className="relative z-10 flex flex-col items-center justify-center ">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6 rounded-full bg-primary/20 p-4 border border-primary/30 shadow-md"
        >
          <ClipboardCheck className="h-12 w-12 text-primary" />
        </motion.div>





        {!showInspectionForm && !showStoreSelector ? (
          <motion.button
            style={{
              border,
              boxShadow,
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
            onClick={handleStartInspection}
            className="group relative flex w-fit items-center gap-1.5 rounded-full bg-primary px-6 py-3 mt-6 text-primary-foreground font-medium transition-colors hover:bg-primary/90"
          >
            Start Inspection
            <ChevronRight className="transition-transform group-hover:translate-x-1" />
          </motion.button>
        ) : showInspectionForm ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md mt-4 bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20"
          >
            <h2 className="text-xl font-bold mb-4 text-white">Your Name</h2>

            {formError && (
              <div className="mb-4 p-3 bg-destructive/20 border border-destructive/50 rounded-lg text-white text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitInspection} className="space-y-4">
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-primary/80" />
                  </div>
                  <input
                    type="text"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-gray-800/60 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/70 focus:border-primary/70 text-white placeholder-gray-400"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInspectionForm(false)}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  Back
                </button>

                <motion.button
                  type="submit"
                  style={{
                    boxShadow,
                  }}
                  whileHover={{
                    scale: 1.03,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  className="flex-1 px-4 py-2 bg-primary rounded-lg text-primary-foreground font-medium hover:bg-primary/90 transition-all duration-300 flex items-center justify-center"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </motion.button>
              </div>
            </form>
          </motion.div>
        ) : (
          // Store Selector
          <StoreSelector
            inspectorName={inspectorName}
            onBack={() => {
              setShowStoreSelector(false);
              setShowInspectionForm(true);
            }}
          />
        )}
      </div>

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl"></div>
        <div className="absolute top-40 -left-40 h-80 w-80 rounded-full bg-secondary/20 blur-3xl"></div>
        <div className="absolute -bottom-40 left-40 h-80 w-80 rounded-full bg-accent/20 blur-3xl"></div>
      </div>
    </motion.section>
  );
};

export default HomePage;
