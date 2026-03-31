import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, FileText, Check, MapPin } from 'lucide-react';

/**
 * UI COMPONENT: Marker Contact Form Overlay
 * Slides up when a user clicks a specific map pin, allowing them to 
 * attach receiver details, phone numbers, and gate codes to that exact coordinate.
 */
export default function PinContactBottomSheet({ isOpen, onClose, onSave, initialData, pinTitle, address }) {
  const [formData, setFormData] = useState({ name: '', phone: '', notes: '' });

  // Sync incoming state with local form state when opened
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        name: initialData.contactName || '',
        phone: initialData.contactPhone || '',
        notes: initialData.notes || ''
      });
    }
  }, [isOpen, initialData]);

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[11000] flex items-end justify-center sm:p-4 font-sans"
        >
          {/* Dismiss background overlay */}
          <div className="absolute inset-0 z-0" onClick={onClose} />

          <motion.div 
            initial={{ y: '100%' }} 
            animate={{ y: 0 }} 
            exit={{ y: '100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] p-6 pt-4 shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
          >
            {/* Mobile Drag Handle Indicator */}
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />

            <button 
              onClick={onClose} 
              className="absolute right-6 top-6 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 active:scale-95 transition-all"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
            
            <div className="pr-12 mb-6">
              <h2 className="text-[24px] font-black text-black tracking-tight mb-1 flex items-center gap-2">
                <MapPin size={24} className="text-[#276EF1]" strokeWidth={2.5} />
                {pinTitle}
              </h2>
              <p className="text-[14px] font-medium text-gray-500 line-clamp-2 leading-snug">
                {address || 'Fetching address details...'}
              </p>
            </div>

            <div className="space-y-4 mb-6 overflow-y-auto no-scrollbar flex-1">
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Receiver Name (e.g., John Doe)" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#F6F6F6] py-4 pl-12 pr-4 rounded-2xl font-bold text-[15px] text-black outline-none border-2 border-transparent focus:border-black transition-all"
                />
              </div>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="tel" 
                  placeholder="Receiver Phone Number" 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9+]/g, '') })}
                  className="w-full bg-[#F6F6F6] py-4 pl-12 pr-4 rounded-2xl font-bold text-[15px] text-black outline-none border-2 border-transparent focus:border-black transition-all"
                />
              </div>
              <div className="relative">
                <FileText size={18} className="absolute left-4 top-4 text-gray-400" />
                <textarea 
                  placeholder="Delivery Instructions (Gate code, leave at door, etc.)" 
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#F6F6F6] py-4 pl-12 pr-4 rounded-2xl font-bold text-[15px] text-black outline-none border-2 border-transparent focus:border-black transition-all resize-none"
                />
              </div>
            </div>

            <button 
              onClick={handleSave}
              className="w-full bg-black text-white py-4 rounded-full font-bold text-[17px] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(0,0,0,0.2)] flex items-center justify-center gap-2 shrink-0 h-[60px]"
            >
              <Check size={20} strokeWidth={3} /> Save Location Details
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}