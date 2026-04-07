import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Camera, RefreshCcw, Zap, ZapOff, 
  ScanLine, CheckCircle2, Loader2, Image as ImageIcon, 
  MapPin, Focus
} from 'lucide-react';

// Premium UI Components
import SystemButton from '../UI/SystemButton';
import SystemCard from '../UI/SystemCard';

/**
 * COMPONENT: SMART SCANNER & OCR ENGINE
 * Hardware-level full-screen camera overlay.
 * Performs real OCR parsing via Tesseract.js and high-res image capturing.
 */
export default function SmartScanner({ 
  isOpen, 
  onClose, 
  onCapture, // Callback: (data) => void. data = { type: 'ocr'|'image', payload: string }
  mode = 'address' // 'address' (OCR) | 'proof' (Image Capture)
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Hardware State
  const [hasPermission, setHasPermission] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'
  const [isFlashSupported, setIsFlashSupported] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);

  // Engine State
  const [isTesseractLoaded, setIsTesseractLoaded] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  
  // Result State
  const [capturedImage, setCapturedImage] = useState(null);
  const [scannedText, setScannedText] = useState('');

  // ============================================================================
  // 1. DYNAMIC ENGINE INJECTION (TESSERACT.JS)
  // ============================================================================
  useEffect(() => {
    if (mode !== 'address') {
      setIsTesseractLoaded(true);
      return;
    }

    const loadTesseract = () => {
      if (window.Tesseract) {
        setIsTesseractLoaded(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
      script.async = true;
      script.onload = () => setIsTesseractLoaded(true);
      document.body.appendChild(script);
    };

    loadTesseract();
  }, [mode]);

  // ============================================================================
  // 2. HARDWARE VIDEO STREAM PIPELINE
  // ============================================================================
  const startCamera = async () => {
    stopCamera(); // Clean up existing streams

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);

      // Check Flash/Torch Capabilities
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities ? track.getCapabilities() : {};
      if (capabilities.torch) {
        setIsFlashSupported(true);
      } else {
        setIsFlashSupported(false);
        setIsFlashOn(false);
      }

    } catch (err) {
      console.error("Camera Access Denied or Failed:", err);
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Mount/Unmount camera logic
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      resetState();
    }
    return () => stopCamera();
  }, [isOpen, facingMode]);

  const resetState = () => {
    setCapturedImage(null);
    setScannedText('');
    setOcrProgress(0);
    setIsProcessing(false);
  };

  // ============================================================================
  // 3. HARDWARE CAPABILITIES CONTROL
  // ============================================================================
  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const toggleFlash = async () => {
    if (!streamRef.current || !isFlashSupported) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      await track.applyConstraints({
        advanced: [{ torch: !isFlashOn }]
      });
      setIsFlashOn(!isFlashOn);
    } catch (err) {
      console.error("Failed to toggle torch:", err);
    }
  };

  // ============================================================================
  // 4. CAPTURE & OCR PROCESSING PIPELINE
  // ============================================================================
  const takeSnapshot = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsCapturing(true);
    
    // Draw video frame to invisible canvas
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to Base64
    const base64Image = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(base64Image);
    stopCamera(); // Freeze frame
    setIsCapturing(false);

    if (mode === 'address') {
      await processOCR(base64Image);
    }
  };

  const processOCR = async (base64Img) => {
    if (!window.Tesseract) return;
    setIsProcessing(true);
    
    try {
      const worker = await window.Tesseract.createWorker({
        logger: m => {
          if (m.status === 'recognizing text') {
            setOcrProgress(parseInt(m.progress * 100));
          }
        }
      });
      
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const { data: { text } } = await worker.recognize(base64Img);
      
      // Clean up text (remove excessive newlines/special chars)
      const cleanedText = text.replace(/[\r\n]+/g, ', ').replace(/[^a-zA-Z0-9\s,.-]/g, '').trim();
      setScannedText(cleanedText);
      await worker.terminate();
    } catch (err) {
      console.error("OCR Processing Failed:", err);
      setScannedText("Failed to read text. Please retake the photo.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (mode === 'address') {
      onCapture({ type: 'ocr', payload: scannedText });
    } else {
      onCapture({ type: 'image', payload: capturedImage });
    }
    onClose();
  };

  // ============================================================================
  // RENDER UI
  // ============================================================================
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-[9999] bg-black flex flex-col font-sans"
      >
        {/* Invisible Canvas for Snapshot Processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* TOP NAVIGATION / CONTROLS */}
        <div className="absolute top-0 left-0 right-0 z-50 p-6 pt-14 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <button onClick={onClose} className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-all pointer-events-auto">
            <X size={24} strokeWidth={2.5} />
          </button>

          <div className="flex items-center gap-4 pointer-events-auto">
            {isFlashSupported && !capturedImage && (
              <button onClick={toggleFlash} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isFlashOn ? 'bg-yellow-400 text-black' : 'bg-white/20 backdrop-blur-md text-white'}`}>
                {isFlashOn ? <Zap size={20} strokeWidth={2.5} /> : <ZapOff size={20} strokeWidth={2.5} />}
              </button>
            )}
            {!capturedImage && (
              <button onClick={toggleCamera} className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-all">
                <RefreshCcw size={20} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* MAIN VIEWFINDER / IMAGE PREVIEW */}
        <div className="flex-1 relative bg-[#111111] overflow-hidden flex items-center justify-center">
          
          {hasPermission === false ? (
            <div className="text-center p-8">
              <Camera size={48} className="text-gray-600 mx-auto mb-4" strokeWidth={1.5} />
              <h2 className="text-white font-black text-[20px] mb-2">Camera Access Denied</h2>
              <p className="text-gray-400 font-bold text-[14px]">Please enable camera permissions in your device settings to use the smart scanner.</p>
            </div>
          ) : capturedImage ? (
            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
          ) : (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* ANIMATED SCANNER OVERLAY */}
          {!capturedImage && hasPermission !== false && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Dimmed Background Mask */}
              <div className="absolute inset-0 bg-black/40" />
              
              {/* Clear Scan Area Focus */}
              <div className="relative w-[80%] aspect-[3/4] max-h-[60vh] bg-transparent border-[2px] border-white/20 rounded-[24px] overflow-hidden shadow-[0_0_0_999px_rgba(0,0,0,0.4)]">
                
                {/* Corner Brackets */}
                <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-[24px]" />
                <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-[24px]" />
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-[24px]" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-[24px]" />

                {/* Animated Laser Line */}
                <motion.div 
                  animate={{ y: ['0%', '400%'] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear", repeatType: "reverse" }}
                  className="w-full h-1 bg-white shadow-[0_0_15px_rgba(255,255,255,1)] opacity-70"
                />
              </div>
              
              <div className="absolute bottom-[20%] text-white text-center font-bold tracking-widest text-[12px] uppercase bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
                {mode === 'address' ? 'Center text in frame' : 'Center package in frame'}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM ACTION SHEET */}
        <div className="bg-white rounded-t-[40px] pb-8 pt-6 px-6 relative z-50">
          
          {!capturedImage ? (
            // CAPTURE MODE CONTROLS
            <div className="flex flex-col items-center">
              <p className="text-[#111111] font-black text-[18px] mb-6 tracking-tight flex items-center gap-2">
                {mode === 'address' ? <><ScanLine size={20} /> OCR Address Scanner</> : <><ImageIcon size={20} /> Proof Capture</>}
              </p>
              
              <button 
                onClick={takeSnapshot}
                disabled={isCapturing || !isTesseractLoaded}
                className="w-[84px] h-[84px] rounded-full border-[6px] border-gray-200 flex items-center justify-center p-1 active:scale-95 transition-transform disabled:opacity-50"
              >
                <div className="w-full h-full bg-[#111111] rounded-full flex items-center justify-center text-white">
                  {isCapturing || !isTesseractLoaded ? <Loader2 size={24} className="animate-spin" /> : <Camera size={28} strokeWidth={2} />}
                </div>
              </button>
            </div>
          ) : (
            // PREVIEW & RESULT MODE CONTROLS
            <div className="flex flex-col gap-6">
              
              {/* OCR Parsing Progress/Result Block */}
              {mode === 'address' && (
                <SystemCard variant="white" className="!p-5 bg-[#F6F6F6] border-2 border-transparent">
                  {isProcessing ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center font-black text-[13px] uppercase tracking-widest text-gray-500">
                        <span>Parsing Image</span>
                        <span>{ocrProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-[#111111]"
                          initial={{ width: 0 }}
                          animate={{ width: `${ocrProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-[#276EF1] font-black text-[12px] uppercase tracking-widest">
                        <Focus size={16} strokeWidth={3} /> Extracted Data
                      </div>
                      <textarea 
                        value={scannedText}
                        onChange={(e) => setScannedText(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-[16px] p-3 text-[14px] font-bold text-[#111111] focus:border-[#111111] outline-none min-h-[80px] resize-none"
                      />
                    </div>
                  )}
                </SystemCard>
              )}

              {/* Proof Image Confirmation Block */}
              {mode === 'proof' && (
                <div className="flex items-center gap-3 justify-center mb-2">
                  <CheckCircle2 size={24} className="text-green-500" strokeWidth={3} />
                  <span className="text-[18px] font-black text-[#111111]">Image Captured</span>
                </div>
              )}

              <div className="flex gap-3">
                <SystemButton 
                  onClick={() => {
                    setCapturedImage(null);
                    setScannedText('');
                    startCamera();
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  Retake
                </SystemButton>
                <SystemButton 
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  variant="primary"
                  className="flex-[2]"
                  icon={CheckCircle2}
                >
                  Confirm
                </SystemButton>
              </div>

            </div>
          )}

        </div>

      </motion.div>
    </AnimatePresence>
  );
}