// src/services/storeService.js
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/services/firebase";

// Get all stores
export const getStores = async () => {
  try {
    const storesCollection = collection(db, "stores");
    const querySnapshot = await getDocs(storesCollection);

    const stores = [];
    querySnapshot.forEach((doc) => {
      stores.push({ id: doc.id, ...doc.data() });
    });

    return stores;
  } catch (error) {
    console.error("Error fetching stores:", error);
    throw error;
  }
};

// Get store by ID
export const getStoreById = async (storeId) => {
  try {
    const storeRef = doc(db, "stores", storeId);
    const docSnap = await getDoc(storeRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching store with ID ${storeId}:`, error);
    throw error;
  }
};

// Get recent inspections for a specific store
export const getRecentInspections = async (storeNumber, limitCount = 5) => {
  try {
    const inspectionsCollection = collection(db, "inspections");
    const q = query(
      inspectionsCollection,
      where("storeNumber", "==", storeNumber),
      orderBy("date", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);

    const inspections = [];
    querySnapshot.forEach((doc) => {
      inspections.push({ id: doc.id, ...doc.data() });
    });

    return inspections;
  } catch (error) {
    console.error(
      `Error fetching recent inspections for store ${storeNumber}:`,
      error
    );
    throw error;
  }
};

// Get inspections with failed items
export const getInspectionsWithIssues = async (limitCount = 10) => {
  try {
    // This is a simplified approach. In a real app, you might want to
    // use a more efficient approach like adding a 'hasIssues' field to inspections
    const inspectionsCollection = collection(db, "inspections");
    const querySnapshot = await getDocs(inspectionsCollection);

    const inspectionsWithIssues = [];
    querySnapshot.forEach((doc) => {
      const inspection = { id: doc.id, ...doc.data() };

      // Check if any checklist item has a false status
      const hasIssues =
        inspection.checklistItems &&
        inspection.checklistItems.some((item) => item.status === false);

      if (hasIssues) {
        inspectionsWithIssues.push(inspection);
      }
    });

    // Sort by date (newest first) and limit
    return inspectionsWithIssues
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limitCount);
  } catch (error) {
    console.error("Error fetching inspections with issues:", error);
    throw error;
  }
};

// Get inspection statistics by store
export const getInspectionStatsByStore = async (storeNumber) => {
  try {
    const inspectionsCollection = collection(db, "inspections");
    const q = query(
      inspectionsCollection,
      where("storeNumber", "==", storeNumber)
    );

    const querySnapshot = await getDocs(q);

    let totalInspections = 0;
    let totalPassedItems = 0;
    let totalFailedItems = 0;
    let totalCorrectedItems = 0;

    querySnapshot.forEach((doc) => {
      const inspection = doc.data();
      totalInspections++;

      if (inspection.checklistItems) {
        inspection.checklistItems.forEach((item) => {
          if (item.status === true) {
            totalPassedItems++;
          } else if (item.status === false) {
            totalFailedItems++;
            if (item.corrected === true) {
              totalCorrectedItems++;
            }
          }
        });
      }
    });

    return {
      totalInspections,
      totalPassedItems,
      totalFailedItems,
      totalCorrectedItems,
      complianceRate:
        totalInspections > 0
          ? (
              (totalPassedItems / (totalPassedItems + totalFailedItems)) *
              100
            ).toFixed(1)
          : 0,
    };
  } catch (error) {
    console.error(
      `Error fetching inspection stats for store ${storeNumber}:`,
      error
    );
    throw error;
  }
};
