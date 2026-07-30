import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useCivicStore } from '../store/useCivicStore';
import { ShieldAlert, Clock, LogOut } from 'lucide-react';

export default function SahayInactivityTimer() {
    const navigate = useNavigate();
    const terminateSession = useCivicStore((state) => state.terminateSession);

    const [currentUser, setCurrentUser] = useState(null);
    const [showWarning, setShowWarning] = useState(false);
    const [countdown, setCountdown] = useState(5);

    const warningTimerRef = useRef(null);
    const logoutTimerRef = useRef(null);
    const countdownIntervalRef = useRef(null);

    // Track active user state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (user) {
                resetInactivityTimers();
            } else {
                clearAllTimers();
                setShowWarning(false);
            }
        });

        return () => {
            unsubscribe();
            clearAllTimers();
        };
    }, []);

    // Clear all running timers
    const clearAllTimers = () => {
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };

    // Execute session termination
    const performAutoLogout = async () => {
        clearAllTimers();
        setShowWarning(false);
        try {
            await signOut(auth);
            terminateSession();
            navigate('/sahay/auth');
        } catch (error) {
            console.error("Auto logout error:", error);
        }
    };

    // Start 5-second countdown when warning displays
    const startWarningCountdown = () => {
        setCountdown(5);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        
        countdownIntervalRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownIntervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Reset inactivity timers on user activity
    const resetInactivityTimers = () => {
        if (!auth.currentUser) return;

        clearAllTimers();
        setShowWarning(false);

        // Set warning timer for 55 seconds
        warningTimerRef.current = setTimeout(() => {
            setShowWarning(true);
            startWarningCountdown();
        }, 55000);

        // Set absolute logout timer for 60 seconds
        logoutTimerRef.current = setTimeout(() => {
            performAutoLogout();
        }, 60000);
    };

    // User activity event listener
    useEffect(() => {
        if (!currentUser || showWarning) return;

        const handleUserActivity = () => {
            resetInactivityTimers();
        };

        const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

        activityEvents.forEach((event) => {
            window.addEventListener(event, handleUserActivity);
        });

        resetInactivityTimers();

        return () => {
            activityEvents.forEach((event) => {
                window.removeEventListener(event, handleUserActivity);
            });
        };
    }, [currentUser, showWarning]);

    // Manual action to stay signed in
    const handleStayLoggedIn = () => {
        setShowWarning(false);
        resetInactivityTimers();
    };

    if (!currentUser) return null;

    return (
        <AnimatePresence>
            {showWarning && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] bg-[#111111]/85 backdrop-blur-md flex items-center justify-center p-6"
                >
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="w-full max-w-[420px] bg-[#FFFFFF] rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl border border-[#E5E7EB]"
                    >
                        <div className="w-16 h-16 bg-[#DC2626]/10 text-[#DC2626] rounded-full flex items-center justify-center mb-6">
                            <ShieldAlert size={32} />
                        </div>

                        <h2 className="text-[1.5rem] font-black tracking-tight text-[#111111] mb-2">
                            Session Timeout Warning
                        </h2>

                        <p className="text-[#555555] font-medium text-[0.95rem] mb-6">
                            You have been inactive. For your security, you will be logged out automatically in:
                        </p>

                        <div className="flex items-center justify-center gap-2 text-[2.5rem] font-black text-[#DC2626] mb-8 bg-[#DC2626]/5 px-6 py-2 rounded-2xl border border-[#DC2626]/20">
                            <Clock size={28} />
                            <span>{countdown}s</span>
                        </div>

                        <div className="flex flex-col gap-3 w-full">
                            <button
                                onClick={handleStayLoggedIn}
                                className="w-full bg-[#111111] text-[#FFFFFF] py-4 rounded-xl font-black text-[1rem] hover:bg-[#333333] transition-colors outline-none shadow-lg shadow-[#111111]/10"
                            >
                                Stay Logged In
                            </button>

                            <button
                                onClick={performAutoLogout}
                                className="w-full bg-[#FFFFFF] text-[#DC2626] border border-[#E5E7EB] py-3 rounded-xl font-bold text-[0.9rem] hover:border-[#DC2626] transition-colors outline-none flex items-center justify-center gap-2"
                            >
                                <LogOut size={16} /> Sign Out Now
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}