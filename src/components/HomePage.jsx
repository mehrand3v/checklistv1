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
      className="relative grid min-h-screen place-content-center overflow-hidden px-4 py-24 text-gray-200"
    >
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6 rounded-full bg-white/10 p-3"
        >
          <ClipboardCheck className="h-12 w-12 text-white" />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-3xl bg-gradient-to-br from-white to-gray-300 bg-clip-text text-center text-3xl font-bold leading-tight text-transparent sm:text-5xl"
        >
          Store Quality Inspection
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="my-6 max-w-xl text-center text-base leading-relaxed text-gray-300 md:text-lg"
        >
          Maintain high standards and ensure quality compliance across all store
          locations with our easy-to-use inspection tool.
        </motion.p>

        {!showInspectionForm && !showStoreSelector ? (
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
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
              className="group relative flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-6 py-3 text-gray-50 font-medium transition-colors hover:bg-white/20"
            >
              Start Inspection
              <ChevronRight className="transition-transform group-hover:translate-x-1" />
            </motion.button>

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
              onClick={handleAdminLogin}
              className="group relative flex w-fit items-center gap-1.5 rounded-full bg-gray-800/60 border border-gray-700 px-6 py-3 text-gray-300 font-medium transition-colors hover:bg-gray-800"
            >
              <Lock className="h-4 w-4 mr-2" />
              Admin Login
            </motion.button>
          </div>
        ) : showInspectionForm ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md mt-4 bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20"
          >
            <h2 className="text-xl font-bold mb-4 text-white">Your Name</h2>

            {formError && (
              <div className="mb-4 p-3 bg-red-400/20 border border-red-500/50 rounded-lg text-white text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitInspection} className="space-y-4">
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-gray-800/60 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInspectionForm(false)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>

                <motion.button
                  type="submit"
                  style={{
                    border,
                    boxShadow,
                  }}
                  whileHover={{
                    scale: 1.03,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  className="flex-1 px-4 py-2 bg-white/10 rounded-lg text-white font-medium hover:bg-white/20 transition-colors flex items-center justify-center"
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
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute top-40 -left-40 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl"></div>
        <div className="absolute -bottom-40 left-40 h-80 w-80 rounded-full bg-green-500/20 blur-3xl"></div>
      </div>
    </motion.section>
  );
};

export default HomePage;
