import { getFirestore, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { auth } from './firebaseAuth';

// ============================================================================
// SERVICE: PAYMENT & PRICING ENGINE
// Handles real UPI intent generation, time-based surge pricing algorithms,
// wallet transactions, and strict discount coupon validations.
// ============================================================================

const db = getFirestore();

// ============================================================================
// SECTION 1: DYNAMIC UPI & QR CODE GENERATION
// ============================================================================

/**
 * Generates a standard National Payments Corporation of India (NPCI) UPI Intent URI.
 * This URI can be fed directly into a QR Code generator component or used as a 
 * deep link to open apps like GPay, PhonePe, or Paytm automatically.
 * @param {number} amount - The exact transaction amount in ₹.
 * @param {string} transactionId - Unique order/tracking ID.
 * @param {string} note - Description of the transaction.
 * @returns {string} - The deeply formatted upi://pay URI.
 */
export const generateUPIIntent = (amount, transactionId, note = 'Movyra Delivery Payment') => {
  if (!amount || amount <= 0) throw new Error("Invalid payment amount.");

  // Production Merchant UPI Details (Replace with actual business VPA in production env)
  const payeeAddress = import.meta.env.VITE_MERCHANT_UPI_ID || 'merchant@upi';
  const payeeName = import.meta.env.VITE_MERCHANT_NAME || 'Movyra Logistics';
  const currency = 'INR';

  // URL encode parameters to ensure safe deep-linking
  const encodedName = encodeURIComponent(payeeName);
  const encodedNote = encodeURIComponent(note);
  const formattedAmount = Number(amount).toFixed(2);

  return `upi://pay?pa=${payeeAddress}&pn=${encodedName}&tr=${transactionId}&am=${formattedAmount}&cu=${currency}&tn=${encodedNote}`;
};

// ============================================================================
// SECTION 2: SURGE PRICING ALGORITHM (Time & Demand Based)
// ============================================================================

/**
 * Calculates real-time surge multiplier based on the current hour of the day.
 * Implements strict peak-hour logistics logic to ensure driver availability.
 * Peak Hours: 08:00 - 11:00 (Morning Rush) | 17:00 - 21:00 (Evening Rush)
 * Night Owl: 23:00 - 04:00 (Late Night Premium)
 * @returns {number} - The surge multiplier (e.g., 1.0, 1.25, 1.5).
 */
export const calculateSurgeMultiplier = () => {
  const currentHour = new Date().getHours();
  let multiplier = 1.0;

  // Morning Rush Hour (8 AM to 11 AM)
  if (currentHour >= 8 && currentHour < 11) {
    multiplier = 1.35;
  } 
  // Evening Rush Hour (5 PM to 9 PM)
  else if (currentHour >= 17 && currentHour < 21) {
    multiplier = 1.50;
  } 
  // Late Night / Graveyard Premium (11 PM to 4 AM)
  else if (currentHour >= 23 || currentHour < 4) {
    multiplier = 1.25;
  }

  return multiplier;
};

// ============================================================================
// SECTION 3: BASE FARE & DISTANCE CALCULATION
// ============================================================================

/**
 * Calculates the exact delivery cost based on vehicle type, distance, and real-time surge.
 * @param {number} distanceKm - Distance in kilometers from Map Services.
 * @param {string} vehicleType - 'bike' | '3wheeler' | 'minitruck'.
 * @returns {Object} - Breakdown of base, perKm, surge, and final total in ₹.
 */
export const calculateDeliveryFare = (distanceKm, vehicleType) => {
  if (distanceKm < 0) throw new Error("Invalid distance.");

  // Strict Pricing Matrix (₹)
  const pricingMatrix = {
    'bike': { baseFare: 30, perKm: 12 },
    '3wheeler': { baseFare: 80, perKm: 20 },
    'minitruck': { baseFare: 150, perKm: 35 }
  };

  const rates = pricingMatrix[vehicleType] || pricingMatrix['bike'];
  const surge = calculateSurgeMultiplier();

  const distanceCost = Math.max(0, distanceKm - 1) * rates.perKm; // First 1KM is included in base fare
  const subtotal = rates.baseFare + distanceCost;
  const finalTotal = Math.round(subtotal * surge);

  return {
    baseFare: rates.baseFare,
    distanceCost: Math.round(distanceCost),
    surgeMultiplier: surge,
    surgeAmount: Math.round((subtotal * surge) - subtotal),
    totalFare: finalTotal
  };
};

// ============================================================================
// SECTION 4: DISCOUNT COUPON ENGINE
// ============================================================================

/**
 * Validates and applies a discount coupon to a given total amount.
 * @param {string} couponCode - The code entered by the user.
 * @param {number} currentTotal - The total amount before discount.
 * @returns {Object} - { isValid, discountAmount, newTotal, message }
 */
export const applyDiscountCoupon = (couponCode, currentTotal) => {
  const normalizedCode = couponCode.trim().toUpperCase();
  
  // Real active coupon definitions (In a full scale app, this fetches from Firestore)
  const activeCoupons = {
    'WELCOME50': { type: 'percentage', value: 50, maxDiscount: 100, minOrder: 50 },
    'FLAT30': { type: 'flat', value: 30, maxDiscount: 30, minOrder: 100 },
    'NIGHTOWL': { type: 'percentage', value: 20, maxDiscount: 150, minOrder: 200 }
  };

  const coupon = activeCoupons[normalizedCode];

  if (!coupon) {
    return { isValid: false, discountAmount: 0, newTotal: currentTotal, message: "Invalid or expired coupon code." };
  }

  if (currentTotal < coupon.minOrder) {
    return { isValid: false, discountAmount: 0, newTotal: currentTotal, message: `Minimum order value must be ₹${coupon.minOrder}.` };
  }

  // Strict Night Owl validation logic
  if (normalizedCode === 'NIGHTOWL') {
    const hour = new Date().getHours();
    if (hour > 4 && hour < 23) {
      return { isValid: false, discountAmount: 0, newTotal: currentTotal, message: "This coupon is only valid between 11 PM and 4 AM." };
    }
  }

  let discountAmount = 0;
  if (coupon.type === 'percentage') {
    discountAmount = (currentTotal * coupon.value) / 100;
    if (discountAmount > coupon.maxDiscount) discountAmount = coupon.maxDiscount;
  } else if (coupon.type === 'flat') {
    discountAmount = coupon.value;
  }

  // Ensure discount doesn't make total negative
  discountAmount = Math.round(discountAmount);
  const newTotal = Math.max(0, currentTotal - discountAmount);

  return {
    isValid: true,
    discountAmount,
    newTotal,
    message: `Coupon applied! You saved ₹${discountAmount}.`
  };
};

// ============================================================================
// SECTION 5: WALLET SYSTEM (FIRESTORE INTEGRATION)
// ============================================================================

/**
 * Deducts the delivery amount from the user's digital wallet in Firestore.
 * @param {number} amount - Amount to deduct in ₹.
 * @param {string} transactionId - Associated Order ID for the ledger.
 */
export const deductFromWallet = async (amount, transactionId) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required for wallet transactions.");
  if (amount <= 0) throw new Error("Invalid deduction amount.");

  try {
    const walletRef = doc(db, 'users', user.uid);
    
    // Atomically decrement the balance directly on the server to prevent race conditions
    await updateDoc(walletRef, {
      walletBalance: increment(-Math.abs(amount)),
      lastTransaction: serverTimestamp(),
      lastTransactionId: transactionId
    });

    return true;
  } catch (error) {
    console.error("Wallet Transaction Error [deductFromWallet]:", error);
    throw error;
  }
};