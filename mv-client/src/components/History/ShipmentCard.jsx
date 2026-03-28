import React from 'react';
import { motion } from 'framer-motion';
import { Package, ChevronRight, MapPin, Calendar, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ============================================================================
// COMPONENT: SHIPMENT CARD (MOVYRA LIGHT THEME)
// A premium, data-driven card UI featuring 6 functional sections:
// Data Normalization, Animated Wrapper, Financial Header, Dynamic Badging,
// Spatial/Context Payload, and Interactive Routing Link.
// ============================================================================

export default function ShipmentCard({ 
  shipment, 
  index = 0 
}) {
  const navigate = useNavigate();

  // Guard clause for safety
  if (!shipment) return null;

  // SECTION 1: Data Normalization & Status Engine
  // Resolves the raw status string into precise UI semantics
  const getStatusStyle = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('pending') || s.includes('preparing')) {
      return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' };
    }
    if (s.includes('way') || s.includes('transit')) {
      return { bg: 'bg-blue-50', text: 'text-movyra-blue', border: 'border-blue-100' };
    }
    if (s.includes('delivered') || s.includes('completed')) {
      return { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-100' };
    }
    return { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-100' };
  };

  const statusStyle = getStatusStyle(shipment.status);

  // SECTION 2: Interactive Routing Logic
  const handleMoreInfo = (e) => {
    e.stopPropagation();
    if (shipment.id) {
      navigate(`/tracking/detail/${shipment.id}`);
    }
  };

  return (
    // SECTION 3: Animated Card Wrapper (Framer Motion)
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.08, 
        type: 'spring', 
        stiffness: 300, 
        damping: 24 
      }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }}
      whileTap={{ scale: 0.98 }}
      onClick={handleMoreInfo}
      className="bg-white rounded-[32px] p-6 mb-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-50 cursor-pointer flex flex-col relative overflow-hidden transition-all duration-300"
    >
      
      {/* SECTION 4: Financial Header & Orange Box Icon */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-100 rounded-[20px] flex items-center justify-center text-orange-500 shadow-sm border border-orange-200/50">
            <Package size={28} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-0.5">Total Value</span>
            <span className="text-3xl font-black text-gray-900 tracking-tight leading-none">
              ${parseFloat(shipment.price || 0).toFixed(2)}
            </span>
          </div>
        </div>
        
        {/* Dynamic Status Badge */}
        <div className={`px-3 py-1.5 rounded-xl border font-bold text-xs tracking-wide shadow-sm ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
          {shipment.status || 'Pending'}
        </div>
      </div>

      {/* SECTION 5: Spatial Payload (Destination) & Temporal Context (Date) */}
      <div className="flex flex-col gap-3 mb-6 bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50">
        <div className="flex items-start gap-3">
          <Calendar size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-[13px] font-black text-gray-900">{shipment.date || 'Date Pending'}</span>
            <span className="text-[11px] font-bold text-gray-400">Estimated Arrival</span>
          </div>
        </div>
        
        <div className="w-full h-[1px] bg-gray-200/50 my-1"></div>

        <div className="flex items-start gap-3">
          <MapPin size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-[13px] font-black text-gray-900 leading-snug pr-4">
              {shipment.destination || 'Address not provided'}
            </span>
            {/* Contextual Subtext */}
            <span className="text-[11px] font-bold text-gray-400 mt-0.5">
              {shipment.subtext || `Tracking: ${shipment.id}`}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 6: Interactive Action Link (Blue "More info") */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-gray-400 text-xs font-bold tracking-wide">
          Standard Shipping
        </span>
        <button 
          onClick={handleMoreInfo}
          className="flex items-center gap-1.5 text-movyra-blue font-black text-sm group active:scale-95 transition-transform"
        >
          More info
          <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-movyra-blue group-hover:text-white transition-colors">
            <ChevronRight size={14} strokeWidth={3} />
          </div>
        </button>
      </div>

    </motion.div>
  );
}