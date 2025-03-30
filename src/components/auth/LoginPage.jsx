// components/auth/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, onAuthStateChange } from "@/services/auth";
import {
  logUserSignIn,
  logCustomEvent,
  ANALYTICS_EVENTS,
} from "@/services/analytics";
import {
  ClipboardCheck,
  Coffee,
  Lock,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import {
  useMotionTemplate,
  useMotionValue,
  motion,
  animate,
} from "framer-motion";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Add the same color animation as HomePage
  const COLORS = ["#3B82F6", "#10B981", "#6366F1", "#8B5CF6"];
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

  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        navigate("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginUser(email, password);
      await logUserSignIn("email"); // Log analytics event

      // Log additional event details
      logCustomEvent(ANALYTICS_EVENTS.USER_SIGN_IN, {
        method: "email",
        email_domain: email.split("@")[1],
        timestamp: new Date().toISOString(),
      });

      navigate("/dashboard");
    } catch (error) {
      // Handle specific Firebase auth errors with user-friendly messages
      let errorMessage = "Invalid email or password. Please try again.";

      if (error.code === "auth/user-not-found") {
        errorMessage =
          "No account found with this email. Please check your email address.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage =
          "Incorrect password. Please try again or reset your password.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage =
          "Access temporarily disabled due to many failed login attempts. Please try again later.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage =
          "Network error. Please check your internet connection and try again.";
      }

      setError(errorMessage);

      // Log error event
      logCustomEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
        error_type: "login_error",
        error_code: error.code,
        error_message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      style={{ backgroundImage }}
      className="flex items-center justify-center min-h-[100dvh] overflow-hidden"
    >
      <div className="w-full max-w-md p-8 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-lg mx-4">
        <div className="flex items-center mb-2">
          <button
            onClick={() => navigate("/")}
            className="p-2 mr-2 rounded-full bg-gray-700/50 hover:bg-gray-700 text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
        </div>

        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center border border-blue-500/30 mb-2">
            <ClipboardCheck className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-700 bg-gray-800/60 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white"
              placeholder="admin@company.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-700 bg-gray-800/60 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white"
                placeholder="••••••••"
                required
                disabled={loading}
              />
              <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-500" />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            style={{ border, boxShadow }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-4 py-3 bg-blue-600/20 text-white rounded-lg hover:bg-blue-700/30 transition-all duration-300 font-medium flex items-center justify-center"
          >
            {loading ? (
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
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          <Coffee className="inline-block w-4 h-4 mr-1 mb-1" />
          Administrative access only
        </div>
      </div>
    </motion.div>
  );
};

export default LoginPage;
