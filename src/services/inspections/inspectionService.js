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
  addDoc,
  serverTimestamp,
  startAt,
  endAt,
} from "firebase/firestore";
import { db } from "@/services/firebase";

// Get inspections with filtering, sorting and pagination
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
    const inspectionsRef = collection(db, "inspections");
    let constraints = [];

    // Add filters
    if (storeId !== "all") {
      constraints.push(where("storeId", "==", storeId));
    }

    // Add date range filter if provided
    if (startDate && endDate) {
      const startTimestamp = Timestamp.fromDate(new Date(startDate));
      const endTimestamp = Timestamp.fromDate(new Date(endDate));
      constraints.push(where("timestamp", ">=", startTimestamp));
      constraints.push(where("timestamp", "<=", endTimestamp));
    }

    // Add sorting
    constraints.push(orderBy(sortField, sortDirection));

    // Create query
    const q = query(inspectionsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    // Process results
    let inspections = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      inspections.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
      });
    });

    // Handle search query if provided
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      inspections = inspections.filter((inspection) => {
        const matchesStoreId = inspection.storeId
          ?.toLowerCase()
          .includes(lowerQuery);
        const matchesStoreName = inspection.storeName
          ?.toLowerCase()
          .includes(lowerQuery);
        const matchesInspector = inspection.submittedBy
          ?.toLowerCase()
          .includes(lowerQuery);

        return matchesStoreId || matchesStoreName || matchesInspector;
      });
    }

    // Calculate total count for pagination
    const totalCount = inspections.length;

    // Apply pagination
    const startIndex = (page - 1) * itemsPerPage;
    const paginatedInspections = inspections.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    return {
      data: paginatedInspections,
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
    const inspectionsRef = collection(db, "inspections");
    let constraints = [];

    // Add store filter if specified
    if (storeId !== "all") {
      constraints.push(where("storeId", "==", storeId));
    }

    // Add date range filter if provided
    if (dateRange && dateRange.start && dateRange.end) {
      const startTimestamp = Timestamp.fromDate(new Date(dateRange.start));
      const endTimestamp = Timestamp.fromDate(new Date(dateRange.end));
      constraints.push(where("timestamp", ">=", startTimestamp));
      constraints.push(where("timestamp", "<=", endTimestamp));
    }

    // Add sorting by timestamp
    constraints.push(orderBy("timestamp", "desc"));

    // Create and execute query
    const q = query(inspectionsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    // Map to count failed items
    const issueMap = new Map();

    querySnapshot.forEach((doc) => {
      const inspection = doc.data();
      if (inspection.items) {
        inspection.items.forEach((item) => {
          if (item.status === "fail") {
            // Create a unique key for the issue
            const issueKey = item.id.toString();

            if (issueMap.has(issueKey)) {
              const issue = issueMap.get(issueKey);
              issue.count += 1;
            } else {
              issueMap.set(issueKey, {
                id: item.id,
                description: item.description,
                count: 1,
              });
            }
          }
        });
      }
    });

    // Convert to array and sort by count (highest first)
    const commonIssuesData = Array.from(issueMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Get top 10 issues

    return commonIssuesData;
  } catch (error) {
    console.error("Error getting common issues:", error);
    throw error;
  }
};

// Get store performance data
export const getStorePerformance = async (dateRange) => {
  try {
    const inspectionsRef = collection(db, "inspections");
    let constraints = [];

    // Add date range filter if provided
    if (dateRange && dateRange.start && dateRange.end) {
      const startTimestamp = Timestamp.fromDate(new Date(dateRange.start));
      const endTimestamp = Timestamp.fromDate(new Date(dateRange.end));
      constraints.push(where("timestamp", ">=", startTimestamp));
      constraints.push(where("timestamp", "<=", endTimestamp));
    }

    // Add sorting by timestamp
    constraints.push(orderBy("timestamp", "desc"));

    // Create and execute query
    const q = query(inspectionsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    // Map to aggregate by store
    const storeMap = new Map();

    querySnapshot.forEach((doc) => {
      const inspection = doc.data();
      const storeId = inspection.storeId || "unknown";
      const storeName = inspection.storeName || "Unknown Store";

      if (!storeMap.has(storeId)) {
        storeMap.set(storeId, {
          id: storeId,
          name: storeName,
          inspections: 0,
          issues: 0,
          satisfactoryItems: 0,
        });
      }

      const storeData = storeMap.get(storeId);
      storeData.inspections += 1;
      storeData.issues += inspection.issueItems || 0;
      storeData.satisfactoryItems += inspection.satisfactoryItems || 0;
    });

    // Convert to array and sort alphabetically by default
    const storePerformanceData = Array.from(storeMap.values());

    return storePerformanceData;
  } catch (error) {
    console.error("Error getting store performance:", error);
    throw error;
  }
};

// Fetch all stores
export const getStores = async () => {
  try {
    // First try to get stores from dedicated collection
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

    // If no dedicated stores exist, extract unique stores from inspections
    if (stores.length === 0) {
      const inspectionsRef = collection(db, "inspections");
      const inspectionsQuery = query(inspectionsRef);
      const inspectionsSnapshot = await getDocs(inspectionsQuery);

      const storeMap = new Map();

      inspectionsSnapshot.forEach((doc) => {
        const inspection = doc.data();
        if (inspection.storeId && inspection.storeName) {
          storeMap.set(inspection.storeId, {
            id: inspection.storeId,
            name: inspection.storeName,
          });
        }
      });

      return Array.from(storeMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

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
      // If store not found in dedicated collection, look in inspections
      const inspectionsRef = collection(db, "inspections");
      const q = query(
        inspectionsRef,
        where("storeId", "==", storeId),
        limit(1)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const inspectionData = querySnapshot.docs[0].data();
        return {
          id: storeId,
          name: inspectionData.storeName || "Unknown Store",
        };
      }

      return null;
    }
  } catch (error) {
    console.error(`Error fetching store with ID ${storeId}:`, error);
    throw error;
  }
};

// Fetch inspection statistics
export const getInspectionsStats = async (
  storeId = "all",
  dateRange = null
) => {
  try {
    const inspectionsRef = collection(db, "inspections");
    let constraints = [];

    // Add store filter if specified
    if (storeId !== "all") {
      constraints.push(where("storeId", "==", storeId));
    }

    // Add date range filter if provided
    if (dateRange && dateRange.start && dateRange.end) {
      const startTimestamp = Timestamp.fromDate(new Date(dateRange.start));
      const endTimestamp = Timestamp.fromDate(new Date(dateRange.end));
      constraints.push(where("timestamp", ">=", startTimestamp));
      constraints.push(where("timestamp", "<=", endTimestamp));
    }

    // Create query
    const q = query(inspectionsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    let total = 0;
    let satisfactoryItems = 0;
    let issueItems = 0;
    let stores = new Set();

    querySnapshot.forEach((doc) => {
      const inspection = doc.data();
      total++;

      // Count satisfactory/issue items
      satisfactoryItems += inspection.satisfactoryItems || 0;
      issueItems += inspection.issueItems || 0;

      // Track unique stores
      if (inspection.storeId) {
        stores.add(inspection.storeId);
      }
    });

    return {
      total,
      satisfactoryItems,
      issueItems,
      stores: stores.size,
    };
  } catch (error) {
    console.error("Error fetching inspection stats:", error);
    throw error;
  }
};

// Fetch inspection trends data
export const getInspectionTrendsData = async (
  storeId = "all",
  dateRange = null,
  timeGrouping = "day"
) => {
  try {
    const inspectionsRef = collection(db, "inspections");
    let constraints = [];

    // Add store filter if specified
    if (storeId !== "all") {
      constraints.push(where("storeId", "==", storeId));
    }

    // Add date range filter if provided
    if (dateRange && dateRange.start && dateRange.end) {
      const startTimestamp = Timestamp.fromDate(new Date(dateRange.start));
      const endTimestamp = Timestamp.fromDate(new Date(dateRange.end));
      constraints.push(where("timestamp", ">=", startTimestamp));
      constraints.push(where("timestamp", "<=", endTimestamp));
    }

    // Add sorting by timestamp
    constraints.push(orderBy("timestamp", "asc"));

    // Create and execute query
    const q = query(inspectionsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    // Process results based on time grouping
    const trendMap = new Map();

    querySnapshot.forEach((doc) => {
      const inspection = doc.data();
      let date = inspection.timestamp?.toDate() || new Date();

      // Format date string based on grouping
      let dateKey;
      if (timeGrouping === "day") {
        dateKey = date.toISOString().split("T")[0];
      } else if (timeGrouping === "week") {
        const weekNumber = getWeekNumber(date);
        dateKey = `Week ${weekNumber}`;
      } else if (timeGrouping === "month") {
        dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
      }

      if (!trendMap.has(dateKey)) {
        trendMap.set(dateKey, {
          date: dateKey,
          satisfactoryItems: 0,
          issueItems: 0,
          total: 0,
        });
      }

      const trend = trendMap.get(dateKey);
      trend.satisfactoryItems += inspection.satisfactoryItems || 0;
      trend.issueItems += inspection.issueItems || 0;
      trend.total +=
        (inspection.satisfactoryItems || 0) + (inspection.issueItems || 0);
    });

    // Convert to array and sort by date
    const trendsData = Array.from(trendMap.values());

    // Format month data to be more readable
    if (timeGrouping === "month") {
      trendsData.forEach((trend) => {
        const [year, month] = trend.date.split("-");
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        trend.date = `${monthNames[parseInt(month) - 1]} ${year}`;
      });
    }

    return trendsData;
  } catch (error) {
    console.error("Error fetching inspection trends:", error);
    throw error;
  }
};

// Helper function to get week number
function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Submit a new inspection
export const submitInspection = async (
  inspectionResults,
  inspectorName = "Anonymous"
) => {
  try {
    // Calculate summary data
    const satisfactoryItems = inspectionResults.filter(
      (item) => item.status === "pass"
    ).length;
    const issueItems = inspectionResults.filter(
      (item) => item.status === "fail"
    ).length;
    const totalItems = inspectionResults.length;

    // Create inspection document
    const inspectionData = {
      submittedBy: inspectorName,
      timestamp: serverTimestamp(),
      items: inspectionResults,
      totalItems,
      satisfactoryItems,
      issueItems,
      deviceInfo: {
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
      },
    };

    // Add to Firestore
    const inspectionsRef = collection(db, "inspections");
    const docRef = await addDoc(inspectionsRef, inspectionData);

    return docRef.id;
  } catch (error) {
    console.error("Error submitting inspection:", error);
    throw error;
  }
};

// Fetch recent inspections
export const getRecentInspections = async (
  storeId = "all",
  limitCount = 10
) => {
  try {
    const inspectionsRef = collection(db, "inspections");
    let constraints = [orderBy("timestamp", "desc"), limit(limitCount)];

    // Add store filter if specified
    if (storeId !== "all") {
      constraints.unshift(where("storeId", "==", storeId));
    }

    // Create and execute query
    const q = query(inspectionsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    const recentInspections = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      recentInspections.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
      });
    });

    return recentInspections;
  } catch (error) {
    console.error("Error fetching recent inspections:", error);
    throw error;
  }
};
