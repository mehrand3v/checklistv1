// src/services/analytics.js

import { analytics } from "@/services/firebase";
import { logEvent } from "firebase/analytics";

// Event name constants
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: "page_view",
  USER_SIGN_IN: "login",
  USER_SIGN_UP: "sign_up",
  BUTTON_CLICK: "button_click",
  FORM_SUBMIT: "form_submit",
  ERROR_OCCURRED: "error_occurred",
  FEATURE_USED: "feature_used",
  INSPECTION_STARTED: "inspection_started",
  INSPECTION_COMPLETED: "inspection_completed",
  INSPECTION_ITEM_PASSED: "inspection_item_passed",
  INSPECTION_ITEM_FAILED: "inspection_item_failed",
  INSPECTION_SUBMITTED: "inspection_submitted",
};

/**
 * Safely log an event to Firebase Analytics
 * @param {string} eventName Name of the event to log
 * @param {Object} eventParams Additional parameters for the event
 * @returns {Promise<void>}
 */
const safeLogEvent = async (eventName, eventParams = {}) => {
  try {
    if (analytics) {
      await logEvent(analytics, eventName, eventParams);
      if (import.meta.env.DEV) {
        console.log(`Analytics event logged: ${eventName}`, eventParams);
      }
    }
  } catch (error) {
    console.error(`Error logging analytics event: ${eventName}`, error);
  }
};

/**
 * Log a custom event
 * @param {string} eventName Name of the event to log
 * @param {Object} eventParams Additional parameters for the event
 * @returns {Promise<void>}
 */
export const logCustomEvent = (eventName, eventParams = {}) => {
  return safeLogEvent(eventName, eventParams);
};

/**
 * Log a page view event
 * @param {string} pageName Name of the page viewed
 * @param {Object} pageParams Additional parameters for the event
 * @returns {Promise<void>}
 */
export const logPageView = (pageName, pageParams = {}) => {
  return safeLogEvent(ANALYTICS_EVENTS.PAGE_VIEW, {
    page_title: pageName,
    page_location: window.location.href,
    page_path: window.location.pathname,
    ...pageParams,
  });
};

/**
 * Log a user sign-in event
 * @param {string} method Authentication method used
 * @returns {Promise<void>}
 */
export const logUserSignIn = (method = "email") => {
  return safeLogEvent(ANALYTICS_EVENTS.USER_SIGN_IN, { method });
};

/**
 * Log when a button is clicked
 * @param {string} buttonName Name of the button clicked
 * @param {Object} buttonParams Additional parameters for the event
 * @returns {Promise<void>}
 */
export const logButtonClick = (buttonName, buttonParams = {}) => {
  return safeLogEvent(ANALYTICS_EVENTS.BUTTON_CLICK, {
    button_name: buttonName,
    ...buttonParams,
  });
};

/**
 * Log when a form is submitted
 * @param {string} formName Name of the form submitted
 * @param {Object} formParams Additional parameters for the event
 * @returns {Promise<void>}
 */
export const logFormSubmit = (formName, formParams = {}) => {
  return safeLogEvent(ANALYTICS_EVENTS.FORM_SUBMIT, {
    form_name: formName,
    ...formParams,
  });
};

/**
 * Log when an error occurs
 * @param {string} errorType Type of error that occurred
 * @param {string} errorMessage Error message
 * @param {Object} errorParams Additional parameters for the event
 * @returns {Promise<void>}
 */
export const logError = (errorType, errorMessage, errorParams = {}) => {
  return safeLogEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
    error_type: errorType,
    error_message: errorMessage,
    ...errorParams,
  });
};

/**
 * Log when an inspection is started
 * @param {string} inspectorName Name of the inspector
 * @returns {Promise<void>}
 */
export const logInspectionStarted = (inspectorName) => {
  return safeLogEvent(ANALYTICS_EVENTS.INSPECTION_STARTED, {
    inspector_name: inspectorName,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log when an inspection is completed
 * @param {Object} stats Inspection statistics
 * @returns {Promise<void>}
 */
export const logInspectionCompleted = (stats) => {
  return safeLogEvent(ANALYTICS_EVENTS.INSPECTION_COMPLETED, {
    ...stats,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log when an inspection is submitted to the server
 * @param {string} inspectionId ID of the submitted inspection
 * @param {Object} stats Inspection statistics
 * @returns {Promise<void>}
 */
export const logInspectionSubmitted = (inspectionId, stats) => {
  return safeLogEvent(ANALYTICS_EVENTS.INSPECTION_SUBMITTED, {
    inspection_id: inspectionId,
    ...stats,
    timestamp: new Date().toISOString(),
  });
};
