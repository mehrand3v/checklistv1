// src/router/routes.js
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser, onAuthStateChange } from "@/services/auth";
import { logPageView } from "@/services/analytics";

// Import components
import HomePage from "@/components/HomePage";
import LoginPage from "@/components/auth/LoginPage";
import Dashboard from "@/components/dashboard/Dashboard";
import InspectionSwipeCards from "@/components/inspection/InspectionSwipeCards";
import NotFound from "@/pages/NotFound";

// Wrapper to enforce authentication
const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Log page view for analytics
    if (!loading) {
      logPageView(location.pathname, {
        is_authenticated: !!user,
      });
    }
  }, [loading, location.pathname, user]);

  if (loading) {
    // Show loading state while checking authentication
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-blue-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Define routes
const routes = [
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/inspection",
    element: <InspectionSwipeCards />,
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
  },
  {
    path: "/dashboard/*",
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
