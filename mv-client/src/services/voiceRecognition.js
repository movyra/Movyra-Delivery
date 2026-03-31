// ============================================================================
// SERVICE: WEB SPEECH API (VOICE RECOGNITION)
// Native browser integration for hands-free address searching.
// Handles permissions, audio streams, and transcription parsing natively.
// ============================================================================

/**
 * Checks if the user's browser natively supports the Web Speech API.
 * @returns {boolean}
 */
export const isVoiceRecognitionSupported = () => {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
};

/**
 * Initializes and starts the voice recognition engine.
 * @param {Function} onResult - Callback fired when text is successfully transcribed.
 * @param {Function} onError - Callback fired when an error/denial occurs.
 * @param {Function} onEnd - Callback fired when the microphone turns off.
 * @returns {Object|null} The active recognition instance (to allow manual stopping)
 */
export const startVoiceRecognition = (onResult, onError, onEnd) => {
  if (!isVoiceRecognitionSupported()) {
    onError(new Error("Voice recognition is not supported in this browser."));
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = false; // Stop listening after one complete sentence
  recognition.interimResults = false; // Only return finalized text
  recognition.lang = 'en-US'; // Defaulting to English, can be dynamic based on user locale

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event) => {
    console.error("Voice Recognition Error:", event.error);
    onError(new Error(event.error));
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  try {
    recognition.start();
    return recognition;
  } catch (err) {
    console.error("Failed to start voice recognition:", err);
    onError(err);
    return null;
  }
};

/**
 * Force stops an active recognition instance.
 * @param {Object} recognitionInstance 
 */
export const stopVoiceRecognition = (recognitionInstance) => {
  if (recognitionInstance && typeof recognitionInstance.stop === 'function') {
    recognitionInstance.stop();
  }
};