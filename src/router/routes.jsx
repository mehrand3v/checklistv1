// src/router/routes.js
import React from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "@/services/auth";

// Import components
import HomePage from "@/components/HomePage";
import LoginPage from "@/components/auth/LoginPage";
import Dashboard from "@/components/dashboard/Dashboard";
import InspectionSwipeCards from "@/components/inspection/InspectionSwipeCards";

// PrivateRoute wrapper component
const PrivateRoute = ({ children }) => {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
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
    element: <InspectionSwipeCards onComplete={() => {}} />,
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
    path: "*",
    element: <Navigate to="/" replace />,
  },
];

export default routes;
