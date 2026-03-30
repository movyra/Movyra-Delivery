import { 
  getFirestore, 
  collection, 
  addDoc, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp, 
  updateDoc 
} from 'firebase/firestore';
import { auth } from './firebaseAuth';

// Initialize Firestore instance
export const db = getFirestore();

// ============================================================================
// SECTION 1: USER PROFILE & B2B MANAGEMENT
// ============================================================================

/**
 * Updates the authenticated user's profile data, including toggling B2B business profiles.
 * @param {Object} profileData - The data to merge into the user's document.
 */
export const updateUserProfile = async (profileData) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required to update profile.");

  try {
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Firestore Error [updateUserProfile]:", error);
    throw error;
  }
};

// ============================================================================
// SECTION 2: SAVED ADDRESSES (ADDRESS BOOK)
// ============================================================================

/**
 * Saves a new custom map pin/address to the user's secure address book.
 * @param {Object} addressData - { type: 'home'|'work'|'custom', address, lat, lng, name }
 */
export const saveAddressPin = async (addressData) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required to save addresses.");

  try {
    const addressRef = collection(db, 'saved_addresses');
    const newDoc = await addDoc(addressRef, {
      ...addressData,
      userId: user.uid,
      createdAt: serverTimestamp()
    });
    return newDoc.id;
  } catch (error) {
    console.error("Firestore Error [saveAddressPin]:", error);
    throw error;
  }
};

/**
 * Fetches all saved addresses exclusively for the authenticated user.
 */
export const fetchUserAddresses = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required to fetch addresses.");

  try {
    const addressQuery = query(
      collection(db, 'saved_addresses'),
      where("userId", "==", user.uid)
    );
    const snapshot = await getDocs(addressQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Firestore Error [fetchUserAddresses]:", error);
    throw error;
  }
};

// ============================================================================
// SECTION 3: DISPUTE & SUPPORT SYSTEM
// ============================================================================

/**
 * Creates a formal dispute ticket for a specific order.
 * @param {Object} disputeData - { orderId, issueType, description, attachedImages }
 */
export const createDispute = async (disputeData) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required to create a dispute.");

  try {
    const disputeRef = collection(db, 'disputes');
    const newTicket = await addDoc(disputeRef, {
      ...disputeData,
      userId: user.uid,
      status: 'open',
      priority: 'high',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return newTicket.id;
  } catch (error) {
    console.error("Firestore Error [createDispute]:", error);
    throw error;
  }
};

// ============================================================================
// SECTION 4: DRIVER TRANSPARENCY & BEHAVIORAL STATS
// ============================================================================

/**
 * Fetches real-time behavioral transparency stats for a matched driver.
 * @param {string} driverId - The unique ID of the assigned driver.
 */
export const fetchDriverStats = async (driverId) => {
  if (!driverId) throw new Error("Driver ID is required to fetch stats.");

  try {
    const driverRef = doc(db, 'drivers', driverId);
    const driverDoc = await getDoc(driverRef);
    
    if (driverDoc.exists()) {
      const data = driverDoc.data();
      return {
        rating: data.rating || 0,
        totalTrips: data.totalTrips || 0,
        cancellationRate: data.cancellationRate || '0%',
        onTimePercentage: data.onTimePercentage || '100%',
        joinedDate: data.createdAt
      };
    } else {
      throw new Error("Driver profile not found in database.");
    }
  } catch (error) {
    console.error("Firestore Error [fetchDriverStats]:", error);
    throw error;
  }
};

// ============================================================================
// SECTION 5: SYSTEM LOGGING & TELEMETRY
// ============================================================================

/**
 * Secretly logs critical system failures, unhandled exceptions, and strict telemetry
 * to the backend for engineering review.
 * @param {string} context - Where the error occurred (e.g., 'BookingEngine').
 * @param {Error|string} error - The actual error payload.
 */
export const logSystemError = async (context, error) => {
  try {
    const user = auth.currentUser;
    const logsRef = collection(db, 'system_logs');
    
    await addDoc(logsRef, {
      context,
      errorMessage: error?.message || String(error),
      errorStack: error?.stack || null,
      userId: user ? user.uid : 'unauthenticated',
      userAgent: navigator.userAgent,
      timestamp: serverTimestamp(),
      severity: 'error'
    });
  } catch (loggingError) {
    // Failsafe: If the logging system itself fails, fall back to hard console logging
    // to prevent infinite loops or cascading failures.
    console.error("CRITICAL: Failed to log system error to Firestore.", loggingError);
  }
};