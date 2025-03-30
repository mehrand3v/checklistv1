// src/services/firebase.js

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED,
  enableIndexedDbPersistence,
  connectFirestoreEmulator,
} from "firebase/firestore";

// Firebase configuration
// For a real app, these values should come from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-auth-domain",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-storage-bucket",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    "your-messaging-sender-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id",
  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "your-measurement-id",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore with offline persistence
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED, // Enable unlimited cache size for offline persistence
});

// Enable offline persistence for Firestore when not in development
if (import.meta.env.MODE !== "development") {
  enableIndexedDbPersistence(db).catch((err) => {
    console.error("Firebase persistence error:", err.code);
  });
}

// Connect to Firestore emulator if in development
if (
  import.meta.env.DEV &&
  import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true"
) {
  console.log("Using Firestore emulator");
  connectFirestoreEmulator(db, "localhost", 8080);
}

// Initialize Authentication
const auth = getAuth(app);

// Connect to Auth emulator if in development
if (
  import.meta.env.DEV &&
  import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true"
) {
  console.log("Using Auth emulator");
  connectAuthEmulator(auth, "http://localhost:9099");
}

// Initialize Firebase Analytics only in production
let analytics = null;
try {
  if (import.meta.env.PROD) {
    analytics = getAnalytics(app);
    console.log("Firebase Analytics initialized");
  }
} catch (error) {
  console.warn("Firebase Analytics initialization failed:", error.message);
}

// Export the initialized services
export { app, db, auth, analytics };
