import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Loader2, X, Map } from 'lucide-react';

/**
 * UI COMPONENT: Route Optimizer Prompt
 * Asks the user if they want to automatically re-order their multi-stop 
 * delivery sequence for maximum efficiency using the TSP algorithm.
 */
export default function RouteOptimizerModal({ isOpen, onClose, onOptimize, isLoading, stopCount }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[12000] flex items-center justify-center p-6 font-sans"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }} 
            animate={{ scale: 1, y: 0 }} 
            exit={{ scale: 0.95, y: 20 }} 
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl relative text-center"
          >
            {/* Close Button */}
            <button 
              onClick={onClose} 
              disabled={isLoading}
              className="absolute right-6 top-6 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50"
            >
              <X size={20} strokeWidth={3} />
            </button>

            {/* Circular Logo Image (Strictly no background) */}
            <div className="mx-auto w-20 h-20 mb-6 flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Movyra Optimizer" 
                className="w-full h-full object-contain rounded-full drop-shadow-md" 
              />
            </div>

            <h2 className="text-[24px] font-black text-black mb-2 tracking-tight">
              Optimize Route?
            </h2>
            <p className="text-[15px] font-medium text-gray-500 mb-8 leading-relaxed">
              You have added {stopCount} drop-offs. Would you like our engine to automatically sort them into the fastest possible sequence to save time and fare?
            </p>

            <div className="space-y-3">
              <button 
                onClick={onOptimize}
                disabled={isLoading}
                className="w-full bg-[#276EF1] text-white py-4 rounded-full font-bold text-[16px] shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> Computing Path...
                  </>
                ) : (
                  <>
                    <Wand2 size={20} strokeWidth={2.5} /> Auto-Sort Route
                  </>
                )}
              </button>
              
              <button 
                onClick={onClose}
                disabled={isLoading}
                className="w-full bg-[#F6F6F6] text-black py-4 rounded-full font-bold text-[16px] active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-gray-200 disabled:opacity-50"
              >
                <Map size={20} strokeWidth={2.5} /> Keep My Order
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}