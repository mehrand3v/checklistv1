// src/hooks/useInspections.js
import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import { getCurrentUser } from "@/services/auth";
import { logCustomEvent } from "@/services/analytics";

const useInspections = () => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    passRate: 0,
  });

  // Fetch all inspections for the current user
  const fetchInspections = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = getCurrentUser();
      if (!user) {
        setError("User not authenticated");
        setLoading(false);
        return [];
      }

      const q = query(
        collection(db, "inspections"),
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc")
      );

      const querySnapshot = await getDocs(q);
      const inspectionsData = [];
      let totalPass = 0;
      let totalItems = 0;
      let thisWeekCount = 0;

      // Get current date for calculating this week's inspections
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        inspectionsData.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate(),
        });

        // Calculate stats
        totalPass += data.passedItems || 0;
        totalItems += data.totalItems || 0;

        // Check if inspection is from this week
        if (data.timestamp && data.timestamp.toDate() > oneWeekAgo) {
          thisWeekCount++;
        }
      });

      setInspections(inspectionsData);
      setStats({
        total: inspectionsData.length,
        thisWeek: thisWeekCount,
        passRate:
          totalItems > 0 ? Math.round((totalPass / totalItems) * 100) : 0,
      });

      setLoading(false);
      return inspectionsData;
    } catch (err) {
      console.error("Error fetching inspections:", err);
      setError("Failed to fetch inspections");
      setLoading(false);
      return [];
    }
  };

  // Get a single inspection by ID
  const getInspection = async (inspectionId) => {
    try {
      const docRef = doc(db, "inspections", inspectionId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          timestamp: data.timestamp?.toDate(),
        };
      } else {
        return null;
      }
    } catch (err) {
      console.error("Error getting inspection:", err);
      throw new Error("Failed to get inspection details");
    }
  };

  // Submit a new inspection
  const submitInspection = async (inspectionResults) => {
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

      // Add to inspections collection
      const inspectionRef = await addDoc(collection(db, "inspections"), {
        userId: user.uid,
        timestamp: serverTimestamp(),
        items: inspectionResults,
        totalItems,
        passedItems,
        failedItems,
      });

      // Log analytics event
      logCustomEvent("inspection_completed", {
        inspection_id: inspectionRef.id,
        total_items: totalItems,
        pass_count: passedItems,
        fail_count: failedItems,
      });

      // Refresh the inspection list
      await fetchInspections();

      return inspectionRef.id;
    } catch (err) {
      console.error("Error submitting inspection:", err);
      throw new Error("Failed to submit inspection");
    }
  };

  // Load inspections on initial mount
  useEffect(() => {
    fetchInspections();
  }, []);

  return {
    inspections,
    stats,
    loading,
    error,
    fetchInspections,
    getInspection,
    submitInspection,
  };
};

export default useInspections;
