import { getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { getFirestore, doc, setDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { auth } from './firebaseAuth';

/**
 * SERVICE: FIREBASE CLOUD MESSAGING (PUSH NOTIFICATIONS)
 * Encompasses the complete notification lifecycle from device permission
 * to token registry and foreground message interception.
 */

// Utility to adhere to strict Firestore path rules
const getAppId = () => {
  if (typeof window !== 'undefined' && window.__app_id) return window.__app_id;
  if (typeof __app_id !== 'undefined') return __app_id;
  return 'default-app-id';
};

export const notificationService = {
  // ============================================================================
  // FEATURE 1: COMPATIBILITY ENGINE
  // ============================================================================
  checkSupport: async () => {
    try {
      const supported = await isSupported();
      return supported;
    } catch (error) {
      console.warn("FCM Support Check Failed:", error);
      return false;
    }
  },

  // ============================================================================
  // FEATURE 2 & 3: PERMISSION PIPELINE & FCM TOKEN GENERATION
  // ============================================================================
  requestAndRegister: async () => {
    try {
      const isFCMSupported = await notificationService.checkSupport();
      if (!isFCMSupported) {
        throw new Error("Push notifications are not supported in this browser environment.");
      }

      // Feature 2: Native OS Permission Request
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error("Notification permission denied by user.");
      }

      const app = getApp();
      const messaging = getMessaging(app);
      
      // Feature 3: FCM Token Generation
      // Requires VITE_FIREBASE_VAPID_KEY in your .env file
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        console.warn("VITE_FIREBASE_VAPID_KEY is missing. Token generation bypassed.");
        return null;
      }

      const currentToken = await getToken(messaging, { vapidKey });
      
      if (currentToken) {
        // Feature 4: Registry Sync
        await notificationService.registerTokenToDB(currentToken);
        return currentToken;
      } else {
        throw new Error("Failed to generate FCM token.");
      }
    } catch (error) {
      console.error("FCM Registration Pipeline Error:", error);
      return null;
    }
  },

  // ============================================================================
  // FEATURE 4: STRICT FIRESTORE REGISTRY
  // ============================================================================
  registerTokenToDB: async (fcmToken) => {
    const user = auth.currentUser;
    if (!user || !fcmToken) return;

    try {
      const db = getFirestore();
      const appId = getAppId();
      
      // STRICT RULE 1: Private user data path
      const userRef = doc(db, 'artifacts', appId, 'users', user.uid);
      
      // Store token in an array to support multi-device logins for a single user
      await setDoc(userRef, {
        fcmTokens: arrayUnion(fcmToken),
        lastTokenUpdate: serverTimestamp()
      }, { merge: true });
      
      console.info("FCM Device Token securely registered to Firestore.");
    } catch (error) {
      console.error("Failed to register token to Firestore:", error);
    }
  },

  // ============================================================================
  // FEATURE 5: FOREGROUND MESSAGE INTERCEPTOR
  // ============================================================================
  listenForForegroundMessages: (onMessageCallback) => {
    notificationService.checkSupport().then(supported => {
      if (!supported) return;

      const app = getApp();
      const messaging = getMessaging(app);

      // Intercepts messages when the React App is actively open on the screen
      onMessage(messaging, (payload) => {
        console.info("Foreground Notification Received:", payload);
        
        // Pass payload to UI layer for triggering Framer Motion Toasts
        if (onMessageCallback && typeof onMessageCallback === 'function') {
          onMessageCallback(payload);
        } else {
          // Fallback to native OS trigger if no UI callback provided
          notificationService.triggerLocalNotification(
            payload.notification?.title || 'New Update',
            {
              body: payload.notification?.body || 'You have a new alert.',
              icon: payload.notification?.icon || '/logo.png',
            }
          );
        }
      });
    });
  },

  // ============================================================================
  // FEATURE 6: NATIVE OS NOTIFICATION DISPATCHER
  // ============================================================================
  triggerLocalNotification: (title, options = {}) => {
    if (!("Notification" in window)) return;
    
    if (Notification.permission === "granted") {
      try {
        const notification = new Notification(title, {
          vibrate: [200, 100, 200], // Hardware haptics
          ...options
        });
        
        notification.onclick = function() {
          window.focus();
          this.close();
        };
      } catch (err) {
        console.error("Local notification failed (possibly mobile restriction):", err);
      }
    }
  }
};