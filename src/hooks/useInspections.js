// src/hooks/useInspections.js
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import { auth } from "@/services/firebase";

// Real authentication functions
const getCurrentUser = () => auth.currentUser;

// Analytics function
const logCustomEvent = (eventName, data) => {
  console.log(`[Analytics Event]: ${eventName}`, data);
};

/**
 * Custom hook for managing inspection data with Firestore
 */
const useInspections = (options = {}) => {
  // Configure hook options with defaults
  const { limitCount = 50, autoFetch = true, cacheResults = true } = options;

  // State management
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  // Fetch inspections from Firestore - updated to get all inspections without filtering by userId
  const fetchInspections = useCallback(
    async (forceRefresh = false) => {
      // Don't fetch if we're already loading
      if (loading) {
        console.log("Already loading, skipping fetch");
        return inspections;
      }

      // Check if we can use cached data
      const now = new Date();
      const cacheStillValid =
        lastFetchTime &&
        now.getTime() - lastFetchTime.getTime() < 5 * 60 * 1000;

      if (
        cacheStillValid &&
        !forceRefresh &&
        cacheResults &&
        inspections.length > 0
      ) {
        console.log("Using cached data");
        return inspections;
      }

      setLoading(true);
      setError(null);

      try {
        // Create a query to get all inspections sorted by timestamp
        const inspectionsQuery = query(
          collection(db, "inspections"),
          orderBy("timestamp", "desc"),
          limit(limitCount)
        );

        const querySnapshot = await getDocs(inspectionsQuery);
        const inspectionsData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate(),
            // Convert timestamps in inspection items if they exist
            items: data.items?.map((item) => ({
              ...item,
              timestamp:
                item.timestamp instanceof Timestamp
                  ? item.timestamp.toDate()
                  : item.timestamp,
            })),
          };
        });

        setInspections(inspectionsData);
        setLastFetchTime(new Date());
        setLoading(false);
        return inspectionsData;
      } catch (err) {
        console.error("Error fetching inspections:", err);
        setError(`Failed to fetch inspections: ${err.message}`);
        setLoading(false);
        return [];
      }
    },
    [loading, lastFetchTime, inspections, cacheResults, limitCount]
  );

  // Get a single inspection by ID
  const getInspection = useCallback(
    async (inspectionId) => {
      try {
        // Check if we already have this inspection in our state
        const cachedInspection = inspections.find((i) => i.id === inspectionId);
        if (cachedInspection && cacheResults) {
          return cachedInspection;
        }

        const docRef = doc(db, "inspections", inspectionId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const formattedData = {
            id: docSnap.id,
            ...data,
            timestamp: data.timestamp?.toDate(),
            items: data.items?.map((item) => ({
              ...item,
              timestamp:
                item.timestamp instanceof Timestamp
                  ? item.timestamp.toDate()
                  : item.timestamp,
            })),
          };

          return formattedData;
        } else {
          return null;
        }
      } catch (err) {
        console.error("Error getting inspection:", err);
        throw new Error(`Failed to get inspection details: ${err.message}`);
      }
    },
    [inspections, cacheResults]
  );

  // Submit a new inspection with improved error handling and validation
  const submitInspection = useCallback(
    async (inspectionResults, inspectorName = null) => {
      if (submitting) return null;

      if (
        !inspectionResults ||
        !Array.isArray(inspectionResults) ||
        inspectionResults.length === 0
      ) {
        throw new Error("Invalid inspection data");
      }

      setSubmitting(true);
      setError(null);

      try {
        // Get current user if logged in (admin)
        const user = getCurrentUser();

        // Calculate summary data
        const satisfactoryItems = inspectionResults.filter(
          (item) => item.status === "pass"
        ).length;
        const issueItems = inspectionResults.filter(
          (item) => item.status === "fail"
        ).length;
        const totalItems = inspectionResults.length;

        // Prepare inspection data
        const inspectionData = {
          // Information about who submitted it
          submittedBy: inspectorName || "Anonymous Inspector",

          // Admin information if an admin is logged in
          adminId: user ? user.uid : null,
          adminEmail: user ? user.email : null,
          isAdminSubmission: !!user,

          // Timestamp information
          timestamp: serverTimestamp(),
          completedAt: new Date().toISOString(),

          // Inspection data
          items: inspectionResults,
          totalItems,
          satisfactoryItems, // Renamed from passedItems
          issueItems, // Renamed from failedItems

          // Device info
          deviceInfo: {
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            language: navigator.language,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
          },
        };

        console.log("Submitting inspection data:", inspectionData);

        // Add to inspections collection
        const inspectionRef = await addDoc(
          collection(db, "inspections"),
          inspectionData
        );

        // Log analytics event
        logCustomEvent("inspection_completed", {
          inspection_id: inspectionRef.id,
          total_items: totalItems,
          satisfactory_count: satisfactoryItems,
          issue_count: issueItems,
          inspector_name: inspectorName || "Anonymous",
        });

        // Optimistically update local state
        const newInspection = {
          id: inspectionRef.id,
          ...inspectionData,
          timestamp: new Date(), // Use local date until server timestamp comes back
        };

        setInspections((prev) => [newInspection, ...prev]);
        setSubmitting(false);

        // Force refresh to get the server timestamp
        setTimeout(() => {
          fetchInspections(true);
        }, 1000);

        return inspectionRef.id;
      } catch (err) {
        console.error("Error submitting inspection:", err);
        setError(`Failed to submit inspection: ${err.message}`);
        setSubmitting(false);
        throw new Error(`Failed to submit inspection: ${err.message}`);
      }
    },
    [submitting, fetchInspections]
  );

  // Update an existing inspection - only for admins
  const updateInspection = useCallback(async (inspectionId, updates) => {
    try {
      const user = getCurrentUser();

      // Only allow authenticated users (admins) to update
      if (!user) {
        throw new Error("You must be logged in to update inspections");
      }

      const inspectionRef = doc(db, "inspections", inspectionId);
      const inspectionSnap = await getDoc(inspectionRef);

      if (!inspectionSnap.exists()) {
        throw new Error("Inspection not found");
      }

      // Add metadata about the update
      const updateData = {
        ...updates,
        lastUpdated: serverTimestamp(),
        lastUpdatedBy: user.uid,
        lastUpdatedByEmail: user.email,
      };

      await updateDoc(inspectionRef, updateData);

      // Optimistically update local state
      setInspections((prev) =>
        prev.map((inspection) =>
          inspection.id === inspectionId
            ? { ...inspection, ...updates, lastUpdated: new Date() }
            : inspection
        )
      );

      return inspectionId;
    } catch (err) {
      console.error("Error updating inspection:", err);
      throw new Error(`Failed to update inspection: ${err.message}`);
    }
  }, []);

  // Delete an inspection - only for admins
  const deleteInspection = useCallback(async (inspectionId) => {
    try {
      const user = getCurrentUser();

      // Only allow authenticated users (admins) to delete
      if (!user) {
        throw new Error("You must be logged in to delete inspections");
      }

      const inspectionRef = doc(db, "inspections", inspectionId);
      const inspectionSnap = await getDoc(inspectionRef);

      if (!inspectionSnap.exists()) {
        throw new Error("Inspection not found");
      }

      await deleteDoc(inspectionRef);

      // Update local state
      setInspections((prev) =>
        prev.filter((inspection) => inspection.id !== inspectionId)
      );

      return true;
    } catch (err) {
      console.error("Error deleting inspection:", err);
      throw new Error(`Failed to delete inspection: ${err.message}`);
    }
  }, []);

  // Calculate statistics from inspection data - updated terminology
  const stats = useMemo(() => {
    // Define time periods
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Filter inspections by time period
    const todayInspections = inspections.filter(
      (insp) => insp.timestamp && insp.timestamp > oneDayAgo
    );
    const weekInspections = inspections.filter(
      (insp) => insp.timestamp && insp.timestamp > oneWeekAgo
    );
    const monthInspections = inspections.filter(
      (insp) => insp.timestamp && insp.timestamp > oneMonthAgo
    );

    // Get most common issues across all inspections
    const issueItemsMap = new Map();
    inspections.forEach((insp) => {
      if (insp.items && Array.isArray(insp.items)) {
        insp.items
          .filter((item) => item.status === "fail")
          .forEach((item) => {
            const count = issueItemsMap.get(item.id) || 0;
            issueItemsMap.set(item.id, count + 1);
          });
      }
    });

    // Convert to array and sort to find most common issues
    const mostCommonIssues = Array.from(issueItemsMap.entries())
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total: inspections.length,
      today: todayInspections.length,
      thisWeek: weekInspections.length,
      thisMonth: monthInspections.length,
      mostCommonIssues, // Renamed from mostCommonFailures
    };
  }, [inspections]);

  // Initialize data fetching on mount if autoFetch is enabled
  useEffect(() => {
    let mounted = true;

    if (autoFetch) {
      const doFetch = async () => {
        try {
          await fetchInspections();
        } catch (err) {
          console.error("Error in auto-fetch:", err);
        }
      };

      doFetch();
    }

    return () => {
      mounted = false;
    };
  }, [autoFetch, fetchInspections]);

  return {
    inspections,
    stats,
    loading,
    submitting,
    error,
    fetchInspections,
    getInspection,
    submitInspection,
    updateInspection,
    deleteInspection,
    // Derived data methods
    getIssueStats: () => stats.mostCommonIssues, // Renamed from getFailureStats
    getRecentInspections: (count = 5) => inspections.slice(0, count),
  };
};

export default useInspections;
