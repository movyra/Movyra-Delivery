import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp } from 'lucide-react';
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useCivicStore } from '../../store/useCivicStore';

export default function SupportCounter({ issueId, initialCount = 0, supportedBy = [] }) {
    const theme = useCivicStore((state) => state.theme);
    
    const [isSupported, setIsSupported] = useState(false);
    const [count, setCount] = useState(initialCount);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser && supportedBy && supportedBy.includes(currentUser.uid)) {
            setIsSupported(true);
        }
    }, [supportedBy]);

    const handleSupport = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        
        if (isSupported || isProcessing) return;

        setIsProcessing(true);

        try {
            const issueRef = doc(db, 'civic_complaints', issueId);
            
            // Execute atomic update to prevent concurrent overwrite errors
            await updateDoc(issueRef, {
                supportCount: increment(1),
                supportedBy: arrayUnion(currentUser.uid)
            });

            setIsSupported(true);
            setCount((prev) => prev + 1);
        } catch (error) {
            console.error("System encountered an error recording community support:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <button
            onClick={handleSupport}
            disabled={isSupported || isProcessing}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-[0.85rem] transition-colors border outline-none ${
                isSupported 
                    ? (theme === 'light' ? 'bg-black text-white border-black' : 'bg-white text-black border-white')
                    : (theme === 'light' ? 'bg-[#f5f5f5] text-[#555555] border-[#cccccc] hover:border-black hover:text-black' : 'bg-[#111111] text-[#888888] border-[#333333] hover:border-white hover:text-white')
            } disabled:opacity-100 cursor-pointer disabled:cursor-default`}
        >
            <motion.div whileTap={!isSupported && !isProcessing ? { scale: 0.85 } : {}}>
                <ThumbsUp size={16} />
            </motion.div>
            
            <span>{isSupported ? "Supported" : "Add Support"}</span>
            
            <span className={`px-2 py-0.5 rounded-full text-[0.75rem] ${
                isSupported
                    ? (theme === 'light' ? 'bg-white/20 text-white' : 'bg-black/10 text-black')
                    : (theme === 'light' ? 'bg-[#e0e0e0] text-black' : 'bg-[#222222] text-white')
            }`}>
                {count}
            </span>
        </button>
    );
}