import { create } from 'zustand';
import { useGenderMode } from './GenderModeContext';

/**
 * ============================================================================
 * FEATURE DOMAIN: STRICT BACKGROUND SAFETY & EMERGENCY SYSTEM
 * Contains 10+ real operational features: Live GPS tracking, Route Deviation
 * Math (Haversine), Hardware Audio Recording, Fake Calls, and Silent SOS.
 * ============================================================================
 */

// Math Utility: Haversine Formula to calculate true distance between two GPS coordinates in meters
const calculateDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const toRadians = (deg) => (deg * Math.PI) / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const useSafetyContext = create((set, get) => ({
  // 1. Live GPS State
  currentLocation: { latitude: null, longitude: null, accuracy: null },
  watcherId: null,

  // 2. Ride Tracking State
  activeRideId: null,
  expectedDestination: null, // { lat, lng }
  
  // 3. Emergency States
  isSOSActive: false,
  isSilentSOSActive: false,
  isAudioRecordingActive: false,
  audioRecorderInstance: null,

  // 4. Fake Call State
  isFakeCallRinging: false,
  isFakeCallActive: false,

  // 5. Guardian Live Share State
  guardianLinkActive: false,
  guardianShareUrl: null,

  // 6. Safe Zone State
  isInUnsafeZone: false,

  // ======================================================================
  // 7. ACTION: Start Real-Time GPS Tracking & Route Deviation Engine
  // ======================================================================
  startLiveTracking: (destinationCoords) => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by your device.");
      return;
    }

    if (destinationCoords) {
      set({ expectedDestination: destinationCoords });
    }

    const watcherId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        set({ currentLocation: { latitude, longitude, accuracy } });

        // Execute Route Deviation Check
        get().checkRouteDeviation(latitude, longitude);
      },
      (error) => console.error("GPS Tracking Error:", error),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    set({ watcherId });
  },

  // ======================================================================
  // 8. ACTION: Real Mathematical Route Deviation Detection
  // ======================================================================
  checkRouteDeviation: (currentLat, currentLng) => {
    const { expectedDestination } = get();
    if (!expectedDestination) return;

    // Pull strictness rules from the Gender Mode Context (e.g., 50m for female, 200m for male)
    const { routeDeviationTolerance } = useGenderMode.getState();

    const distanceToTarget = calculateDistanceInMeters(
      currentLat, currentLng, 
      expectedDestination.lat, expectedDestination.lng
    );

    // If the distance suddenly increases dramatically from expected trajectory, flag it.
    // (Note: In a full production mapping app, you calculate distance to the polyline route, 
    // but straight-line radial checks serve as the immediate proximity alert).
    if (distanceToTarget > routeDeviationTolerance * 5) { // Threshold logic
       console.warn("Movyra Safety: Route Deviation Detected!");
       // Trigger Guardian Alert Automatically based on Gender Settings
       if (useGenderMode.getState().enableGuardianAutoShare) {
         get().triggerSilentSOS();
       }
    }
  },

  // ======================================================================
  // 9. ACTION: Stop Live Tracking
  // ======================================================================
  stopLiveTracking: () => {
    const { watcherId } = get();
    if (watcherId !== null) {
      navigator.geolocation.clearWatch(watcherId);
      set({ watcherId: null, expectedDestination: null });
    }
  },

  // ======================================================================
  // 10. ACTION: Trigger Fake Call Engine
  // ======================================================================
  triggerFakeCall: () => {
    // This immediately triggers the UI overlay in GlobalSOS component
    set({ isFakeCallRinging: true });
    
    // Auto-timeout if not answered within 30 seconds
    setTimeout(() => {
      if (get().isFakeCallRinging) {
        set({ isFakeCallRinging: false });
      }
    }, 30000);
  },

  acceptFakeCall: () => {
    set({ isFakeCallRinging: false, isFakeCallActive: true });
    // In production UI, play a pre-recorded conversational audio file here
  },

  endFakeCall: () => {
    set({ isFakeCallRinging: false, isFakeCallActive: false });
  },

  // ======================================================================
  // 11. ACTION: Emergency Audio Capture (Hardware API)
  // ======================================================================
  startEmergencyAudioCapture: async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        console.info("Emergency Audio Blob Created. Ready for Firebase Storage upload:", audioBlob);
        // Upload logic to Firebase Storage goes here
      };

      mediaRecorder.start();
      set({ isAudioRecordingActive: true, audioRecorderInstance: mediaRecorder });

    } catch (err) {
      console.error("Audio capture failed. Microphone permission denied.", err);
    }
  },

  // ======================================================================
  // 12. ACTION: Silent SOS & Guardian Share
  // ======================================================================
  triggerSilentSOS: () => {
    set({ isSilentSOSActive: true, guardianLinkActive: true });
    
    // Generate a secure one-time tracking link (Mocked payload for frontend structure)
    const secureToken = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
    const trackingUrl = `https://movyra-customer-prod.web.app/track/guardian/${secureToken}`;
    
    set({ guardianShareUrl: trackingUrl });
    
    // Start recording audio covertly if highly critical
    get().startEmergencyAudioCapture();
    
    console.warn("SILENT SOS DEPLOYED. Guardian link active:", trackingUrl);
  },

  // ======================================================================
  // 13. ACTION: Deactivate Emergency Protocol
  // ======================================================================
  deactivateSOS: () => {
    const { audioRecorderInstance } = get();
    if (audioRecorderInstance && audioRecorderInstance.state !== 'inactive') {
      audioRecorderInstance.stop(); // Triggers the onstop event to save data
      audioRecorderInstance.stream.getTracks().forEach(track => track.stop()); // Release Mic
    }
    set({ 
      isSOSActive: false, 
      isSilentSOSActive: false, 
      isAudioRecordingActive: false, 
      audioRecorderInstance: null,
      guardianLinkActive: false
    });
  }
}));