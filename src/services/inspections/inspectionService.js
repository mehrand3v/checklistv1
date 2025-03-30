// services/inspections/inspectionService.js
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/services/firebase";
export const getInspections = async ({
  storeId = "all",
  startDate = null,
  endDate = null,
  searchQuery = "",
  page = 1,
  itemsPerPage = 25,
  sortField = "timestamp",
  sortDirection = "desc",
}) => {
  try {
    // Build your Firestore query here
    // Using the parameters to filter and sort results

    // Return formatted data with pagination info
    return {
      data: inspections,
      total: totalCount,
    };
  } catch (error) {
    console.error("Error getting inspections:", error);
    throw error;
  }
};

// Get common issues data for analytics
export const getCommonIssues = async (storeId, dateRange) => {
  try {
    // Implement your query to get most common issues
    return commonIssuesData;
  } catch (error) {
    console.error('Error getting common issues:', error);
    throw error;
  }
};

// Get store performance data
export const getStorePerformance = async (dateRange) => {
  try {
    // Implement your query to get store performance data
    return storePerformanceData;
  } catch (error) {
    console.error('Error getting store performance:', error);
    throw error;
  }
};
// Fetch all stores
export const getStores = async () => {
  try {
    const storesRef = collection(db, "stores");
    const q = query(storesRef, orderBy("name"));
    const querySnapshot = await getDocs(q);

    const stores = [];
    querySnapshot.forEach((doc) => {
      stores.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return stores;
  } catch (error) {
    console.error("Error fetching stores:", error);
    throw error;
  }
};

// Fetch store by ID
export const getStoreById = async (storeId) => {
  try {
    const storeRef = doc(db, "stores", storeId);
    const storeSnap = await getDoc(storeRef);

    if (storeSnap.exists()) {
      return {
        id: storeSnap.id,
        ...storeSnap.data(),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching store with ID ${storeId}:`, error);
    throw error;
  }
};

// Fetch inspection statistics
export const getInspectionsStats = async (storeId = "all") => {
  try {
    const inspectionsRef = collection(db, "inspections");

    // Base query
    let q;
    if (storeId !== "all") {
      q = query(inspectionsRef, where("storeId", "==", storeId));
    } else {
      q = query(inspectionsRef);
    }

    const querySnapshot = await getDocs(q);

    let total = 0;
    let passed = 0;
    let failed = 0;
    let stores = new Set();

    querySnapshot.forEach((doc) => {
      const inspection = doc.data();
      total++;

      // Count passed/failed based on overall status
      if (inspection.overallStatus === "pass") {
        passed++;
      } else {
        failed++;
      }

      // Track unique stores
      if (inspection.storeId) {
        stores.add(inspection.storeId);
      }
    });

    // Get trends data (simplified for this example)
    // In a real application, you would compare with previous month data
    const trends = {
      total: 5, // Example: 5% increase from last month
      passed: 12, // Example: 12% increase from last month
      failed: -8, // Example: 8% decrease from last month
    };

    return {
      total,
      passed,
      failed,
      stores: stores.size,
      trends,
    };
  } catch (error) {
    console.error("Error fetching inspection stats:", error);
    throw error;
  }
};

// Fetch inspection trends data
export const getInspectionTrendsData = async (
  storeId = "all",
  timeRange = "month"
) => {
  try {
    // In a real application, you would fetch actual trend data based on timeRange
    // This is simplified example data

    let data;

    if (timeRange === "week") {
      data = [
        { date: "Monday", passed: 12, failed: 3, total: 15 },
        { date: "Tuesday", passed: 15, failed: 2, total: 17 },
        { date: "Wednesday", passed: 10, failed: 5, total: 15 },
        { date: "Thursday", passed: 8, failed: 4, total: 12 },
        { date: "Friday", passed: 11, failed: 2, total: 13 },
        { date: "Saturday", passed: 7, failed: 1, total: 8 },
        { date: "Sunday", passed: 5, failed: 0, total: 5 },
      ];
    } else if (timeRange === "month") {
      data = [
        { date: "Week 1", passed: 45, failed: 12, total: 57 },
        { date: "Week 2", passed: 40, failed: 15, total: 55 },
        { date: "Week 3", passed: 38, failed: 14, total: 52 },
        { date: "Week 4", passed: 42, failed: 10, total: 52 },
      ];
    } else if (timeRange === "quarter") {
      data = [
        { date: "Jan", passed: 150, failed: 42, total: 192 },
        { date: "Feb", passed: 145, failed: 38, total: 183 },
        { date: "Mar", passed: 162, failed: 35, total: 197 },
      ];
    }

    return data;
  } catch (error) {
    console.error("Error fetching inspection trends:", error);
    throw error;
  }
};

// Fetch recent inspections
export const getRecentInspections = async (storeId = "all", limitCount = 5) => {
  try {
    const inspectionsRef = collection(db, "inspections");

    // Base query with sorting by timestamp
    let q;
    if (storeId !== "all") {
      q = query(
        inspectionsRef,
        where("storeId", "==", storeId),
        orderBy("timestamp", "desc"),
        limit(limitCount)
      );
    } else {
      q = query(
        inspectionsRef,
        orderBy("timestamp", "desc"),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);

    const inspections = [];
    querySnapshot.forEach((doc) => {
      const inspection = doc.data();

      // Calculate pass rate
      let passCount = 0;
      if (inspection.results && inspection.results.length > 0) {
        passCount = inspection.results.filter(
          (item) => item.status === "pass"
        ).length;
        inspection.passRate = Math.round(
          (passCount / inspection.results.length) * 100
        );
      }

      inspections.push({
        id: doc.id,
        ...inspection,
      });
    });

    return inspections;
  } catch (error) {
    console.error("Error fetching recent inspections:", error);
    throw error;
  }
};

// Submit a new inspection
export const submitInspection = async (inspectionData) => {
  try {
    // For this example, we're using the db.js functions
    const { addDocument } = await import("@/services/db");

    // Add timestamp and determine overall status
    const passCount = inspectionData.filter(
      (item) => item.status === "pass"
    ).length;
    const failCount = inspectionData.filter(
      (item) => item.status === "fail"
    ).length;

    const inspection = {
      results: inspectionData,
      timestamp: new Date().toISOString(),
      storeId: inspectionData[0]?.storeId || null,
      storeName: inspectionData[0]?.storeName || "Unknown Store",
      submittedBy: inspectionData[0]?.submittedBy || null,
      overallStatus: passCount > failCount ? "pass" : "fail",
      passRate: Math.round((passCount / inspectionData.length) * 100),
    };

    const docId = await addDocument("inspections", inspection);
    return docId;
  } catch (error) {
    console.error("Error submitting inspection:", error);
    throw error;
  }
};
