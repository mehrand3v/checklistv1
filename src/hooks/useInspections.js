// src/hooks/useInspections.js
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import { getCurrentUser } from "@/services/auth";
import { logCustomEvent } from "@/services/analytics";

/**
 * Custom hook for managing inspection data with Firestore
 * Enhanced with caching, optimistic updates, and comprehensive stats
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

  // Fetch inspections from Firestore
  const fetchInspections = useCallback(
    async (forceRefresh = false) => {
      // Don't fetch if we're already loading
      if (loading) return [];

      // Check if we can use cached data (within the last 5 minutes)
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
        return inspections;
      }

      setLoading(true);
      setError(null);

      try {
        const user = getCurrentUser();
        if (!user) {
          throw new Error("User not authenticated");
        }

        // Create a query to get inspections for the current user
        const inspectionsQuery = query(
          collection(db, "inspections"),
          where("userId", "==", user.uid),
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
    async (inspectionResults) => {
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
        const user = getCurrentUser();
        if (!user) {
          throw new Error("No authenticated user found");
        }

        // Calculate summary data
        const passedItems = inspectionResults.filter(
          (item) => item.status === "pass"
        ).length;
        const failedItems = inspectionResults.filter(
          (item) => item.status === "fail"
        ).length;
        const totalItems = inspectionResults.length;
        const passRate = totalItems > 0 ? (passedItems / totalItems) * 100 : 0;

        // Prepare inspection data with standardized timestamps
        const inspectionData = {
          userId: user.uid,
          userName: user.displayName || "Anonymous User",
          userEmail: user.email,
          timestamp: serverTimestamp(),
          completedAt: new Date().toISOString(),
          items: inspectionResults,
          totalItems,
          passedItems,
          failedItems,
          passRate: Math.round(passRate * 100) / 100, // Round to 2 decimal places
          deviceInfo: {
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            language: navigator.language,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
          },
        };

        // Add to inspections collection
        const inspectionRef = await addDoc(
          collection(db, "inspections"),
          inspectionData
        );

        // Log analytics event
        logCustomEvent("inspection_completed", {
          inspection_id: inspectionRef.id,
          total_items: totalItems,
          pass_count: passedItems,
          fail_count: failedItems,
          pass_rate: passRate,
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

  // Update an existing inspection
  const updateInspection = useCallback(async (inspectionId, updates) => {
    try {
      const user = getCurrentUser();
      if (!user) {
        throw new Error("No authenticated user found");
      }

      const inspectionRef = doc(db, "inspections", inspectionId);
      const inspectionSnap = await getDoc(inspectionRef);

      if (!inspectionSnap.exists()) {
        throw new Error("Inspection not found");
      }

      const inspectionData = inspectionSnap.data();

      // Verify ownership
      if (inspectionData.userId !== user.uid) {
        throw new Error("Not authorized to update this inspection");
      }

      // Add metadata about the update
      const updateData = {
        ...updates,
        lastUpdated: serverTimestamp(),
        lastUpdatedBy: user.uid,
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

  // Delete an inspection
  const deleteInspection = useCallback(async (inspectionId) => {
    try {
      const user = getCurrentUser();
      if (!user) {
        throw new Error("No authenticated user found");
      }

      // First verify ownership
      const inspectionRef = doc(db, "inspections", inspectionId);
      const inspectionSnap = await getDoc(inspectionRef);

      if (!inspectionSnap.exists()) {
        throw new Error("Inspection not found");
      }

      const inspectionData = inspectionSnap.data();

      if (inspectionData.userId !== user.uid) {
        throw new Error("Not authorized to delete this inspection");
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

  // Calculate statistics from inspection data
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

    // Calculate pass rates for different time periods
    const calcPassRate = (inspGroup) => {
      const totalPassed = inspGroup.reduce(
        (sum, insp) => sum + (insp.passedItems || 0),
        0
      );
      const totalItems = inspGroup.reduce(
        (sum, insp) => sum + (insp.totalItems || 0),
        0
      );
      return totalItems > 0 ? (totalPassed / totalItems) * 100 : 0;
    };

    // Get most failed items across all inspections
    const failedItemsMap = new Map();
    inspections.forEach((insp) => {
      if (insp.items && Array.isArray(insp.items)) {
        insp.items
          .filter((item) => item.status === "fail")
          .forEach((item) => {
            const count = failedItemsMap.get(item.id) || 0;
            failedItemsMap.set(item.id, count + 1);
          });
      }
    });

    // Convert to array and sort to find most common failures
    const mostCommonFailures = Array.from(failedItemsMap.entries())
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total: inspections.length,
      today: todayInspections.length,
      thisWeek: weekInspections.length,
      thisMonth: monthInspections.length,
      totalPassRate: calcPassRate(inspections),
      todayPassRate: calcPassRate(todayInspections),
      weekPassRate: calcPassRate(weekInspections),
      monthPassRate: calcPassRate(monthInspections),
      mostCommonFailures,
    };
  }, [inspections]);

  // Initialize data fetching on mount if autoFetch is enabled
  useEffect(() => {
    if (autoFetch) {
      fetchInspections();
    }
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
    getFailureStats: () => stats.mostCommonFailures,
    getRecentInspections: (count = 5) => inspections.slice(0, count),
  };
};

export default useInspections;
