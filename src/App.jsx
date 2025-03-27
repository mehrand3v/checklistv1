// src/App.jsx
import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
// import { ThemeProvider } from "@/components/theme-provider";
import router from "@/router/appRouter";
import { onAuthStateChange } from "@/services/auth";
import { logPageView } from "@/services/analytics";

function App() {
  // Handle authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      // You can implement user state management here
      // For example, using a global state management solution like Redux or Context API
      console.log(
        "Auth state changed:",
        user ? "User logged in" : "User logged out"
      );
    });

    // Track initial page view
    logPageView("app_loaded");

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  return (
    // <ThemeProvider defaultTheme="light" storageKey="store-inspect-theme">
      <RouterProvider router={router} />
    // </ThemeProvider>
  );
}

export default App;
