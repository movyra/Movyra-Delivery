import React from 'react';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, CheckCircle2, Truck, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ============================================================================
// COMPONENT: TRACKING TIMELINE ITEM (MOVYRA LIGHT THEME)
// A highly interactive, data-driven row component featuring 6 functional sections:
// Animation Engine, Status Resolution, Visual Indicator, Primary Payload, 
// Secondary Context, and Temporal Data.
// ============================================================================

export default function TrackingTimelineItem({ 
  item, 
  index = 0, 
  onClick 
}) {
  const navigate = useNavigate();

  // Guard clause for safety
  if (!item) return null;

  // SECTION 1: Dynamic Status Resolution Logic
  // Resolves the raw status string into precise UI semantics (colors and icons)
  const resolveStatusStyle = (status) => {
    const normalizedStatus = (status || '').toLowerCase();
    switch(normalizedStatus) {
      case 'alert': 
      case 'exception':
      case 'delayed':
        return { 
          bg: 'bg-red-50', 
          text: 'text-red-500', 
          border: 'border-red-100',
          Icon: AlertTriangle,
          pulse: true
        };
      case 'delivered': 
      case 'completed':
        return { 
          bg: 'bg-teal-50', 
          text: 'text-teal-500', 
          border: 'border-teal-100',
          Icon: CheckCircle2,
          pulse: false
        };
      case 'transit': 
      case 'moving':
        return { 
          bg: 'bg-blue-50', 
          text: 'text-movyra-blue', 
          border: 'border-blue-100',
          Icon: Truck,
          pulse: false
        };
      default: 
        return { 
          bg: 'bg-gray-50', 
          text: 'text-gray-500', 
          border: 'border-gray-100',
          Icon: Package,
          pulse: false
        };
    }
  };

  const styleConfig = resolveStatusStyle(item.status);
  const StatusIcon = styleConfig.Icon;

  // SECTION 2: Interaction & Routing Logic
  // Handles row clicks, prioritizing passed onClick props, falling back to default routing
  const handleInteraction = () => {
    if (onClick) {
      onClick(item);
    } else if (item.id) {
      navigate(`/tracking/detail/${item.id}`);
    }
  };

  return (
    // SECTION 3: Animation Engine & Wrapper
    // Utilizes Framer Motion for staggered entrances, hover scaling, and tap compression
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.08, // Dynamic stagger based on list index
        type: 'spring', 
        stiffness: 300, 
        damping: 24 
      }}
      whileHover={{ scale: 1.02, backgroundColor: '#F9FAFB' }} // hover:bg-gray-50 equivalent
      whileTap={{ scale: 0.98 }}
      onClick={handleInteraction}
      className="group relative flex items-center gap-4 p-3 -mx-3 rounded-[20px] cursor-pointer transition-colors duration-200 select-none"
    >
      
      {/* SECTION 4: Visual Status Indicator */}
      {/* The colored background square with the embedded status icon */}
      <div className={`relative w-[60px] h-[60px] rounded-[18px] flex items-center justify-center flex-shrink-0 border ${styleConfig.bg} ${styleConfig.text} ${styleConfig.border}`}>
        <StatusIcon size={26} strokeWidth={2.5} className="relative z-10" />
        
        {/* Conditional pulsing ring for packages requiring attention */}
        {styleConfig.pulse && (
          <motion.div 
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute inset-0 rounded-[18px] border-2 border-red-400"
          />
        )}
      </div>
      
      {/* Container for Main Data */}
      <div className="flex-1 min-w-0 py-1">
        
        {/* SECTION 5: Primary Data Payload */}
        {/* The prominent tracking ID */}
        <h4 className="font-black text-[17px] text-gray-900 tracking-wide truncate group-hover:text-movyra-blue transition-colors duration-200">
          {item.id || 'Unknown ID'}
        </h4>
        
        {/* Secondary Context (Location or detailed status) */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <p className="text-gray-400 text-[13px] font-bold truncate">
            {item.loc || 'Location Pending'}
          </p>
        </div>
      </div>
      
      {/* SECTION 6: Temporal Context (Timestamp) */}
      {/* Far right alignment for exactly when the scan occurred */}
      <div className="flex flex-col items-end justify-center flex-shrink-0 pl-2">
        <span className="text-gray-900 text-sm font-black whitespace-nowrap">
          {item.time || '--:--'}
        </span>
        {/* Optional date context if provided by the API */}
        {item.date && (
          <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
            <Clock size={10} strokeWidth={3} />
            {item.date}
          </span>
        )}
      </div>

    </motion.div>
  );
}