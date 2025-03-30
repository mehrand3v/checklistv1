// src/services/auth.js

import {
  getAuth,
  setPersistence,
  signOut,
  signInWithEmailAndPassword,
  browserSessionPersistence,
  onAuthStateChanged,
} from "firebase/auth";

import { app } from "@/services/firebase";

// Initialize Firebase Auth instance
const auth = getAuth(app);

// Export auth for use in other files
export { auth };

/**
 * Login a user with email and password
 * @param {string} email User's email
 * @param {string} password User's password
 * @returns {Promise<UserCredential>} Firebase user credential
 */
export const loginUser = async (email, password) => {
  try {
    // Set persistence to session (cleared when browser window is closed)
    await setPersistence(auth, browserSessionPersistence);

    // Sign in with email and password
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in:", error.message);
    throw error;
  }
};

/**
 * Log out the current user
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log("User logged out successfully");
  } catch (error) {
    console.error("Error logging out:", error.message);
    throw error;
  }
};

/**
 * Listen for authentication state changes
 * @param {function} callback Function to call when auth state changes
 * @returns {function} Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get the current authenticated user
 * @returns {User|null} Current user or null if not authenticated
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};
