import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { ShieldAlert, Clock, RotateCcw, LogOut } from 'lucide-react';
import { useCivicStore } from '../../store/useCivicStore';

export default function SessionMonitor({ children }) {
    const navigate = useNavigate();
    const theme = useCivicStore((state) => state.theme);
    
    // Configurable activity parameters (14 minutes 55 seconds idle threshold + 5 seconds countdown = 15 minutes total)
    const IDLE_THRESHOLD_MS = 14 * 60 * 1000 + 55 * 1000; 
    const COUNTDOWN_SECONDS = 5;

    const [isWarningVisible, setIsWarningVisible] = useState(false);
    const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

    const idleTimerRef = useRef(null);
    const countdownIntervalRef = useRef(null);

    // Terminate Session and Purge Memory
    const executeSessionTermination = useCallback(async () => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

        try {
            await signOut(auth);
        } catch (error) {
            console.error("Session termination encountered an operational error:", error);
        } finally {
            setIsWarningVisible(false);
            navigate('/civic/auth', { replace: true });
        }
    }, [navigate]);

    // Handle Countdown Sequence
    const startCountdown = useCallback(() => {
        setCountdown(COUNTDOWN_SECONDS);
        setIsWarningVisible(true);

        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

        countdownIntervalRef.current = setInterval(() => {
            setCountdown((prevCount) => {
                if (prevCount <= 1) {
                    clearInterval(countdownIntervalRef.current);
                    executeSessionTermination();
                    return 0;
                }
                return prevCount - 1;
            });
        }, 1000);
    }, [executeSessionTermination]);

    // Reset Activity Timers
    const resetInactivityTimer = useCallback(() => {
        if (isWarningVisible) return; // Do not reset automatically if countdown modal is open

        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => {
            startCountdown();
        }, IDLE_THRESHOLD_MS);
    }, [isWarningVisible, startCountdown, IDLE_THRESHOLD_MS]);

    // Extend Session Manually
    const extendSession = () => {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        setIsWarningVisible(false);
        setCountdown(COUNTDOWN_SECONDS);
        resetInactivityTimer();
    };

    // Attach Event Listeners for Interaction Tracking
    useEffect(() => {
        const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

        const handleUserActivity = () => {
            resetInactivityTimer();
        };

        activityEvents.forEach((event) => {
            window.addEventListener(event, handleUserActivity);
        });

        // Initialize primary timer
        resetInactivityTimer();

        return () => {
            activityEvents.forEach((event) => {
                window.removeEventListener(event, handleUserActivity);
            });
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        };
    }, [resetInactivityTimer]);

    return (
        <React.Fragment>
            {children}

            {/* INACTIVITY WARNING MODAL */}
            <AnimatePresence>
                {isWarningVisible && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className={`fixed inset-0 z-[9999] backdrop-blur-md flex items-center justify-center p-6 ${
                            theme === 'light' ? 'bg-black/60' : 'bg-black/80'
                        }`}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={`w-full max-w-[420px] rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl border ${
                                theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'
                            }`}
                        >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border ${
                                theme === 'light' ? 'bg-[#fff0f0] border-[#ffcccc] text-[#cc0000]' : 'bg-[#330000] border-[#550000] text-[#ff4444]'
                            }`}>
                                <ShieldAlert size={32} />
                            </div>

                            <h2 className={`text-[1.6rem] font-black tracking-tight mb-2 ${
                                theme === 'light' ? 'text-black' : 'text-white'
                            }`}>
                                Session Inactivity Notice
                            </h2>

                            <p className={`text-[0.95rem] font-medium leading-relaxed mb-6 ${
                                theme === 'light' ? 'text-[#555555]' : 'text-[#aaaaaa]'
                            }`}>
                                No user activity detected. To maintain compliance and protect secure data, your session will terminate automatically in:
                            </p>

                            {/* COUNTDOWN DISPLAY */}
                            <div className={`w-full py-4 rounded-2xl mb-8 flex items-center justify-center gap-3 border ${
                                theme === 'light' ? 'bg-[#f5f5f5] border-[#e0e0e0]' : 'bg-[#050505] border-[#222222]'
                            }`}>
                                <Clock size={20} className={theme === 'light' ? 'text-black' : 'text-white'} />
                                <span className="font-mono text-[2.2rem] font-black tracking-tight">
                                    00:0{countdown}
                                </span>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                                <button
                                    onClick={extendSession}
                                    className={`w-full py-3.5 rounded-xl font-black text-[0.9rem] flex items-center justify-center gap-2 transition-colors border outline-none ${
                                        theme === 'light' 
                                            ? 'bg-black text-white border-black hover:bg-[#222222]' 
                                            : 'bg-white text-black border-white hover:bg-[#e0e0e0]'
                                    }`}
                                >
                                    <RotateCcw size={16} /> Extend Session
                                </button>
                                
                                <button
                                    onClick={executeSessionTermination}
                                    className={`w-full py-3.5 rounded-xl font-bold text-[0.9rem] flex items-center justify-center gap-2 transition-colors border outline-none ${
                                        theme === 'light' 
                                            ? 'bg-transparent border-[#cccccc] text-[#666666] hover:text-black hover:border-black' 
                                            : 'bg-transparent border-[#333333] text-[#888888] hover:text-white hover:border-white'
                                    }`}
                                >
                                    <LogOut size={16} /> Terminate
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </React.Fragment>
    );
}