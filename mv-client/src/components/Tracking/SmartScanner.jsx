import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, RefreshCw, Zap, ZapOff, Image as ImageIcon, Loader2 } from 'lucide-react';

/**
 * COMPONENT: HARDWARE SMART SCANNER
 * Features (8+):
 * 1. Native getUserMedia video stream
 * 2. Canvas-based Base64 image extraction
 * 3. Front/Rear camera hardware toggling
 * 4. LED Torch/Flashlight track manipulation
 * 5. Dynamic Context Modes (Address OCR vs Package Proof)
 * 6. Physical Haptic Feedback (navigator.vibrate)
 * 7. 60fps Framer Motion layout animations
 * 8. Strict cleanup to prevent memory/camera leaks
 */
export default function SmartScanner({ mode = 'proof', onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Hardware State
  const [hasPermission, setHasPermission] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // Default to rear camera
  const [flashSupported, setFlashSupported] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState('');

  // ============================================================================
  // LOGIC: HARDWARE CAMERA INITIALIZATION
  // ============================================================================
  const startCamera = useCallback(async () => {
    // Stop any existing stream before starting a new one
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Check for Flash/Torch hardware support on the video track
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities ? track.getCapabilities() : {};
      if (capabilities.torch) {
        setFlashSupported(true);
      } else {
        setFlashSupported(false);
        setFlashOn(false);
      }

      setHasPermission(true);
      setError('');
    } catch (err) {
      console.error("Camera Hardware Error:", err);
      setHasPermission(false);
      setError('Camera access denied or unavailable.');
    }
  }, [facingMode]);

  // Lifecycle Management: Start on mount, cleanup on unmount
  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  // ============================================================================
  // LOGIC: HARDWARE CONTROLS (LENS & TORCH)
  // ============================================================================
  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const toggleFlash = async () => {
    if (!streamRef.current || !flashSupported) return;
    
    const track = streamRef.current.getVideoTracks()[0];
    try {
      await track.applyConstraints({
        advanced: [{ torch: !flashOn }]
      });
      setFlashOn(!flashOn);
    } catch (err) {
      console.warn("Torch manipulation failed:", err);
    }
  };

  // ============================================================================
  // LOGIC: FRAME EXTRACTION & HAPTICS
  // ============================================================================
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    // Hardware Haptics
    if (navigator.vibrate) navigator.vibrate(50);
    
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Match canvas dimensions to actual video stream resolution
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Compress and extract as Base64 JPEG payload
    const base64Image = canvas.toDataURL('image/jpeg', 0.8);
    
    // Simulate minor processing delay for UI feedback
    setTimeout(() => {
      onCapture(base64Image);
      setIsCapturing(false);
    }, 400);
  };

  // ============================================================================
  // RENDER UI
  // ============================================================================
  return (
    <motion.div 
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[9999] bg-black flex flex-col font-sans"
    >
      {/* Hidden canvas for image extraction */}
      <canvas ref={canvasRef} className="hidden" />

      {/* HEADER CONTROLS */}
      <div className="absolute top-0 left-0 right-0 p-6 pt-14 flex items-center justify-between z-50 bg-gradient-to-b from-black/80 to-transparent">
        <button 
          onClick={onClose}
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-all"
        >
          <X size={24} strokeWidth={2.5} />
        </button>
        
        <div className="flex gap-4">
          {flashSupported && (
            <button 
              onClick={toggleFlash}
              className={`w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-all ${flashOn ? 'bg-yellow-500' : 'bg-white/10'}`}
            >
              {flashOn ? <Zap size={20} strokeWidth={2.5} /> : <ZapOff size={20} strokeWidth={2.5} />}
            </button>
          )}
          <button 
            onClick={toggleCamera}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-all"
          >
            <RefreshCw size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* HARDWARE VIDEO STREAM */}
      <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center">
        {hasPermission === false && (
          <div className="text-center px-6">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-white text-xl font-black mb-2">Camera Access Denied</h3>
            <p className="text-gray-400 font-bold">Please enable camera permissions in your browser settings to use this feature.</p>
          </div>
        )}

        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* SCANNING RETICLE OVERLAY */}
        {hasPermission && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
            <div className={`border-2 border-white/50 relative transition-all duration-300 ${mode === 'address' ? 'w-3/4 h-32 rounded-lg' : 'w-3/4 h-64 rounded-3xl'}`}>
              {/* Corner Indicators */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#276EF1] rounded-tl-sm -mt-1 -ml-1" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#276EF1] rounded-tr-sm -mt-1 -mr-1" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#276EF1] rounded-bl-sm -mb-1 -ml-1" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#276EF1] rounded-br-sm -mb-1 -mr-1" />
              
              {/* Scanning Laser Animation */}
              <motion.div 
                animate={{ y: [0, mode === 'address' ? 120 : 250, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                className="w-full h-0.5 bg-[#276EF1] shadow-[0_0_15px_rgba(39,110,241,1)] opacity-70"
              />
            </div>
            <p className="text-white font-bold text-[14px] mt-8 bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
              {mode === 'address' ? 'Align label inside the box' : 'Take a clear photo of the package'}
            </p>
          </div>
        )}

        {/* Shutter Flash Animation */}
        <motion.div 
          initial={false}
          animate={{ opacity: isCapturing ? 1 : 0 }}
          className="absolute inset-0 bg-white z-20 pointer-events-none"
        />
      </div>

      {/* FOOTER SHUTTER CONTROL */}
      <div className="bg-black pb-safe pt-6 px-6 h-40 flex items-center justify-center">
        <button 
          onClick={handleCapture}
          disabled={!hasPermission || isCapturing}
          className="w-20 h-20 rounded-full border-4 border-gray-300 flex items-center justify-center active:scale-95 transition-all disabled:opacity-50"
        >
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
            {isCapturing ? (
              <Loader2 size={28} className="text-black animate-spin" strokeWidth={3} />
            ) : mode === 'address' ? (
              <Camera size={28} className="text-black" strokeWidth={2.5} />
            ) : (
              <ImageIcon size={28} className="text-black" strokeWidth={2.5} />
            )}
          </div>
        </button>
      </div>
    </motion.div>
  );
}