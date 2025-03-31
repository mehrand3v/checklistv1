import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "sonner";

/**
 * Root layout component that wraps all pages with common elements
 * Provides the basic structure for the application
 * Applies auto-scaling for inspection pages to fit content without scrolling
 */
const RootLayout = () => {
  const location = useLocation();

  // Check if we're on an inspection-related page
  const isInspectionPage = location.pathname.includes("/inspection");

  return (
    <div className="wrapper bg-background text-foreground flex flex-col">
      {/* Toast notifications */}
      <Toaster position="top-right" />

      {/* Main content area - apply viewport height and scaling for inspection pages */}
      <main
        className={`flex-1 ${
          isInspectionPage ? "flex items-center justify-center" : ""
        }`}
        style={
          isInspectionPage
            ? {
                height: "100vh",
                overflow: "hidden",
                touchAction: "none", // Disable browser touch actions on inspection pages
              }
            : {}
        }
      >
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;
