import { getAnalytics, logEvent, isSupported } from 'firebase/analytics';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from './firebaseAuth';
import app from './firebaseAuth'; // Import the initialized Firebase app

// ============================================================================
// SERVICE: SYSTEM ANALYTICS & TELEMETRY ENGINE
// Captures critical business intelligence: Bookings, Revenue, Drop-offs.
// Pushes events natively to Firebase Analytics and mirrors complex structured
// data to Firestore for custom dashboard aggregations.
// ============================================================================

const db = getFirestore(app);

// Safely initialize Analytics (Prevents crashes if blocked by ad-blockers)
let analyticsInstance = null;
isSupported().then((supported) => {
  if (supported) {
    analyticsInstance = getAnalytics(app);
  }
}).catch(console.error);

// ============================================================================
// SECTION 1: CORE TELEMETRY LOGGER (FIRESTORE MIRROR)
// ============================================================================

/**
 * Internal helper to push structured telemetry data to Firestore.
 * Ensures data is captured even if third-party analytics scripts fail.
 * @param {string} eventCategory - e.g., 'booking', 'revenue', 'user_action'
 * @param {string} eventName - e.g., 'booking_completed'
 * @param {Object} eventData - Granular data payload
 */
const pushToFirestoreTelemetry = async (eventCategory, eventName, eventData) => {
  try {
    const user = auth.currentUser;
    const telemetryRef = collection(db, 'system_analytics');
    
    await addDoc(telemetryRef, {
      category: eventCategory,
      event: eventName,
      payload: eventData,
      userId: user ? user.uid : 'anonymous',
      userAgent: navigator.userAgent,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    // Fail silently to prevent interrupting the user experience
    console.warn("Firestore Telemetry Warning:", error);
  }
};

// ============================================================================
// SECTION 2: BUSINESS INTELLIGENCE TRACKING
// ============================================================================

/**
 * Tracks when a user successfully completes the checkout flow and dispatches a booking.
 * @param {Object} bookingDetails - Must include { orderId, vehicleType, totalFare, distanceKm }
 */
export const logBookingCreated = async (bookingDetails) => {
  const { orderId, vehicleType, totalFare, distanceKm } = bookingDetails;
  
  // 1. Send to Google Analytics
  if (analyticsInstance) {
    logEvent(analyticsInstance, 'purchase', {
      transaction_id: orderId,
      value: totalFare,
      currency: 'INR',
      items: [{ item_id: vehicleType, item_name: `Delivery - ${vehicleType}`, price: totalFare }]
    });
    logEvent(analyticsInstance, 'booking_created', { vehicleType, distanceKm });
  }

  // 2. Mirror to Firestore Telemetry
  await pushToFirestoreTelemetry('booking', 'booking_created', {
    orderId,
    vehicleType,
    totalFare,
    distanceKm,
    revenueImpact: totalFare // Tracked for financial dashboards
  });
};

/**
 * Tracks when a driver successfully marks a package as Delivered/Dropped off.
 * @param {Object} deliveryDetails - Must include { orderId, driverId, actualDurationSeconds }
 */
export const logDropoffCompleted = async (deliveryDetails) => {
  const { orderId, driverId, actualDurationSeconds } = deliveryDetails;

  if (analyticsInstance) {
    logEvent(analyticsInstance, 'delivery_completed', { orderId, driverId });
  }

  await pushToFirestoreTelemetry('logistics', 'delivery_completed', {
    orderId,
    driverId,
    actualDurationSeconds,
    completionStatus: 'success'
  });
};

// ============================================================================
// SECTION 3: USER BEHAVIOR & FUNNEL TRACKING
// ============================================================================

/**
 * Logs generic user actions to analyze UI/UX funnels.
 * @param {string} actionName - e.g., 'clicked_add_stop', 'viewed_pricing'
 * @param {Object} metadata - Contextual data (e.g., { screen: 'SetLocation' })
 */
export const logUserAction = async (actionName, metadata = {}) => {
  if (analyticsInstance) {
    logEvent(analyticsInstance, 'user_action', { action: actionName, ...metadata });
  }

  await pushToFirestoreTelemetry('behavior', actionName, metadata);
};

// ============================================================================
// SECTION 4: SYSTEM INTEGRITY & ERROR LOGGING
// ============================================================================

/**
 * Tracks deep system errors, API failures, or route optimization crashes.
 * @param {string} errorContext - The function or component where it failed.
 * @param {Error|string} errorObj - The caught error object.
 */
export const logSystemError = async (errorContext, errorObj) => {
  const errorMessage = errorObj?.message || String(errorObj);
  
  if (analyticsInstance) {
    logEvent(analyticsInstance, 'exception', {
      description: `${errorContext}: ${errorMessage}`,
      fatal: false
    });
  }

  await pushToFirestoreTelemetry('system', 'error_caught', {
    context: errorContext,
    message: errorMessage,
    stack: errorObj?.stack || 'No stack trace available'
  });
};