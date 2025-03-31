import React from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";

/**
 * Root layout component that wraps all pages with common elements
 * Provides the basic structure for the application
 */
const RootLayout = () => {
  return (
    <div className="bg-background text-foreground flex flex-col">
      {/* Toast notifications */}
      <Toaster position="top-right" />

      {/* Main content area */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;
