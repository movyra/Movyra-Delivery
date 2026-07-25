import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ThumbsUp, X, ArrowRight } from 'lucide-react';
import { useCivicStore } from '../../store/useCivicStore';

export default function DuplicateWarning({ 
    isVisible, 
    existingIssue, 
    onSupportExisting, 
    onProceedAnyway, 
    onClose 
}) {
    const theme = useCivicStore((state) => state.theme);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className={`fixed inset-0 z-[9999] backdrop-blur-md flex items-center justify-center p-6 ${
                        theme === 'light' ? 'bg-black/60' : 'bg-black/80'
                    }`}
                >
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
                        animate={{ scale: 1, opacity: 1, y: 0 }} 
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className={`w-full max-w-[450px] rounded-3xl p-8 flex flex-col shadow-2xl relative border ${
                            theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'
                        }`}
                    >
                        <button 
                            onClick={onClose} 
                            className={`absolute top-6 right-6 transition-colors outline-none ${
                                theme === 'light' ? 'text-[#888888] hover:text-black' : 'text-[#888888] hover:text-white'
                            }`}
                        >
                            <X size={20} />
                        </button>

                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${
                            theme === 'light' ? 'bg-[#fff0f0] border-[#ffcccc] text-[#cc0000]' : 'bg-[#330000] border-[#550000] text-[#ff4444]'
                        }`}>
                            <AlertCircle size={24} />
                        </div>

                        <h2 className="text-[1.5rem] font-black tracking-tight mb-3">
                            Similar Report Detected
                        </h2>
                        
                        <p className={`text-[0.95rem] leading-relaxed mb-6 ${
                            theme === 'light' ? 'text-[#555555]' : 'text-[#aaaaaa]'
                        }`}>
                            Our system found an existing report near this exact location. Adding your support to the existing report helps prioritize it for faster resolution.
                        </p>

                        {/* Existing Issue Preview Box */}
                        {existingIssue && (
                            <div className={`w-full p-4 rounded-xl mb-8 border ${
                                theme === 'light' ? 'bg-[#f9f9f9] border-[#e0e0e0]' : 'bg-[#0a0a0a] border-[#222222]'
                            }`}>
                                <div className="text-[0.8rem] font-bold uppercase tracking-wider mb-1 text-[#888888]">
                                    Reported Issue
                                </div>
                                <div className="font-black text-[1.05rem] mb-1">
                                    {existingIssue.category || "Infrastructure Issue"}
                                </div>
                                <div className={`text-[0.85rem] ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>
                                    {existingIssue.address || "Location matching your coordinates"}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => onSupportExisting(existingIssue?.id)}
                                className={`w-full py-4 rounded-xl font-black text-[0.95rem] flex items-center justify-center gap-2 transition-colors outline-none border ${
                                    theme === 'light' ? 'bg-black text-white border-black hover:bg-[#333333]' : 'bg-white text-black border-white hover:bg-[#cccccc]'
                                }`}
                            >
                                <ThumbsUp size={18} />
                                Support Existing Report
                            </button>
                            
                            <button
                                onClick={onProceedAnyway}
                                className={`w-full py-4 rounded-xl font-bold text-[0.95rem] flex items-center justify-center gap-2 transition-colors outline-none border ${
                                    theme === 'light' ? 'bg-transparent border-[#cccccc] text-[#666666] hover:text-black hover:border-black' : 'bg-transparent border-[#333333] text-[#888888] hover:text-white hover:border-white'
                                }`}
                            >
                                Submit New Report Anyway
                                <ArrowRight size={18} />
                            </button>
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}