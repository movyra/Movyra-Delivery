import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  MapPin, 
  Plane, 
  PackageCheck, 
  Truck, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  Loader2,
  AlertCircle,
  Package,
  ShieldAlert,
  Diamond,
  UserCircle2
} from 'lucide-react';

// Real Database Integration
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { auth } from '../../services/firebaseAuth';

// ============================================================================
// PAGE: SHIPMENT DETAIL (MOVYRA LIGHT THEME)
// Connects directly to the 'orders' Firestore collection.
// Contains 6 Functional Sections: Real-time Data Engine, Header, 
// Spatial Hero, Meta Card, Multi-Stop Timeline, and Details/Footer.
// ============================================================================

export default function ShipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // SECTION 1: Real-time Data Engine (Firestore)
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const db = getFirestore();
    const orderRef = doc(db, 'orders', id);

    // Real-time listener for exact order details
    const unsubscribe = onSnapshot(orderRef, (docSnap) => {
      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() });
        setError('');
      } else {
        setError('Order record not found in the database.');
        setOrder(null);
      }
      setIsLoading(false);
    }, (err) => {
      console.error("Firestore Tracking Error:", err);
      setError('Failed to fetch live order details.');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  // UI Formatters
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'searching': return 'text-orange-500 bg-orange-50 border-orange-200';
      case 'assigned': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'picked_up': return 'text-purple-500 bg-purple-50 border-purple-200';
      case 'delivered': return 'text-green-500 bg-green-50 border-green-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch(status?.toLowerCase()) {
      case 'searching': return 'Finding Driver';
      case 'assigned': return 'Driver Assigned';
      case 'picked_up': return 'In Transit';
      case 'delivered': return 'Delivered';
      default: return status || 'Processing';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-black">
        <Loader2 size={40} className="animate-spin mb-4 text-[#276EF1]" />
        <h2 className="font-bold tracking-widest text-sm uppercase text-gray-400">Locating Order</h2>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-black text-black mb-2">Record Not Found</h2>
        <p className="text-gray-500 font-medium mb-8">{error}</p>
        <button onClick={() => navigate(-1)} className="bg-black text-white px-8 py-3 rounded-full font-bold">
          Go Back
        </button>
      </div>
    );
  }

  // Derive route points safely
  const pickup = order.pickup || {};
  const dropoffs = order.dropoffs || [];
  const finalDropoff = dropoffs[dropoffs.length - 1] || {};
  const routePoints = [pickup, ...dropoffs];

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col relative">
      
      {/* ==========================================
          UPPER HALF: MOVYRA BLUE SPLIT-SCREEN
          ========================================== */}
      <div className="bg-[#276EF1] w-full pt-12 pb-32 px-6 rounded-b-[40px] relative z-0">
        
        {/* SECTION 2: Header Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors active:scale-95"
          >
            <ChevronLeft size={32} />
          </button>
          <h1 className="text-white font-black tracking-wide text-xl">Order Details</h1>
          <div className="w-8 h-8 rounded-md overflow-hidden bg-black flex items-center justify-center border border-white/20">
            <img src="/logo.png" alt="Movyra" className="w-full h-full object-cover" />
          </div>
        </motion.div>

        {/* SECTION 3: Blue Hero Spatial Visualization */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring' }}
          className="w-full flex flex-col mt-4"
        >
          <div className="flex items-center justify-between mb-6">
            <p className="text-blue-200 text-sm font-bold uppercase tracking-widest">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </p>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </div>
          </div>
          
          <div className="flex items-center justify-between relative">
            {/* Origin */}
            <div className="flex flex-col items-start z-10 w-1/3">
              <div className="w-4 h-4 rounded-full bg-white border-4 border-[#276EF1] shadow-[0_0_0_2px_rgba(255,255,255,0.3)] mb-2"></div>
              <h2 className="text-white font-black text-xl tracking-tight truncate w-full">
                {pickup.address?.split(',')[0] || 'Pickup'}
              </h2>
            </div>

            {/* Connecting Visual Line & Vehicle Icon */}
            <div className="absolute left-1/4 right-1/4 top-2 h-[2px] border-t-2 border-dashed border-white/40 z-0"></div>
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              className="absolute left-1/2 -translate-x-1/2 -top-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg z-10 text-[#276EF1]"
            >
              <Truck size={20} strokeWidth={2.5} />
            </motion.div>

            {/* Destination */}
            <div className="flex flex-col items-end z-10 w-1/3 text-right">
              <div className="w-4 h-4 rounded-full bg-blue-300 border-4 border-[#276EF1] shadow-[0_0_0_2px_rgba(147,197,253,0.3)] mb-2"></div>
              <h2 className="text-white font-black text-xl tracking-tight truncate w-full">
                {finalDropoff.address?.split(',')[0] || 'Dropoff'}
              </h2>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ==========================================
          LOWER HALF: WHITE TIMELINE UI
          ========================================== */}
      <div className="flex-1 bg-white -mt-24 px-6 pt-0 pb-32 relative z-10">
        
        {/* SECTION 4: Meta Information (Floating Card) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[24px] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-gray-50 flex items-center justify-between mb-8"
        >
          <div className="flex flex-col">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Fare</span>
            <span className="text-black font-black text-2xl">
              ₹{order.pricing?.estimatedPrice || order.pricing?.totalFare || 0}
            </span>
          </div>
          <div className="flex flex-col items-end text-right">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Vehicle</span>
            <span className="text-black font-black text-lg uppercase">
              {order.vehicleType || 'Standard'}
            </span>
          </div>
        </motion.div>

        {/* SECTION 5: Dynamic Multi-Stop Route Timeline */}
        <div className="mb-10">
          <h3 className="font-bold text-[15px] text-gray-400 uppercase tracking-widest mb-6">Route Details</h3>
          
          <div className="relative border-l-2 border-dashed border-gray-200 ml-4 space-y-8 pb-4">
            {routePoints.map((point, index) => {
              const isFirst = index === 0;
              const isLast = index === routePoints.length - 1;
              
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (index * 0.1) }}
                  className="relative pl-8"
                >
                  {/* Timeline Node Dot */}
                  <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${
                    isFirst ? 'bg-black ring-4 ring-gray-100' : 'bg-gray-300'
                  }`}>
                    {isFirst && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                  </div>

                  {/* Timeline Content */}
                  <div className="flex flex-col">
                    <h4 className={`font-black text-[16px] tracking-tight mb-1 ${
                      isFirst ? 'text-black' : 'text-gray-800'
                    }`}>
                      {isFirst ? 'Pickup Location' : `Dropoff ${routePoints.length > 2 ? index : ''}`}
                    </h4>
                    
                    <div className="flex items-start gap-2 text-gray-500 text-[14px] font-bold mb-2">
                      <MapPin size={16} className="mt-0.5 shrink-0" />
                      <span className="leading-snug">{point.address}</span>
                    </div>

                    {/* Exact Timestamp Logic */}
                    {isFirst && order.createdAt && (
                      <div className="flex items-center gap-2 text-gray-500 text-[11px] font-black uppercase tracking-wider bg-[#F6F6F6] w-fit px-3 py-1.5 rounded-lg">
                        <Clock size={12} strokeWidth={3} />
                        <span>Created: {new Date(order.createdAt.toDate ? order.createdAt.toDate() : order.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* SECTION 6: Package Details & Security Context */}
        <div className="bg-[#F6F6F6] rounded-[24px] p-6 mb-8 border border-gray-100">
          <h3 className="font-bold text-[13px] text-gray-400 uppercase tracking-widest mb-4">Package Config</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-black">
                <Package size={18} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-gray-400 uppercase">Item Type</span>
                <span className="text-[14px] font-black text-black">{order.packageDetails?.itemType || 'Package'}</span>
              </div>
            </div>
            
            {order.packageDetails?.isFragile && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-black">
                  <ShieldAlert size={18} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">Safety</span>
                  <span className="text-[14px] font-black text-black">Fragile</span>
                </div>
              </div>
            )}
            
            {order.packageDetails?.isHighValue && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#276EF1] rounded-full shadow-sm flex items-center justify-center text-white">
                  <Diamond size={18} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[#276EF1] uppercase">Security</span>
                  <span className="text-[14px] font-black text-black">High Value</span>
                </div>
              </div>
            )}
          </div>

          {/* Secure Delivery PIN */}
          {order.packageDetails?.secureOTP && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className="text-[11px] font-bold text-gray-400 uppercase block mb-1">Delivery PIN</span>
              <span className="text-[24px] font-black tracking-widest text-black">{order.packageDetails.secureOTP}</span>
            </div>
          )}
          
          {/* Driver Notes */}
          {order.packageDetails?.driverNotes && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className="text-[11px] font-bold text-gray-400 uppercase block mb-1">Notes for Driver</span>
              <span className="text-[14px] font-bold text-black leading-snug">{order.packageDetails.driverNotes}</span>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 7: Support / Driver Footer */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md pb-safe pt-4 px-6 border-t border-gray-100 z-50 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#F6F6F6] flex items-center justify-center text-gray-600 border border-gray-200">
            <UserCircle2 size={24} strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {order.selectedBid ? 'Assigned Driver' : 'AI Matching'}
            </span>
            <span className="font-black text-black text-[15px]">
              {order.selectedBid?.driverName || 'Finding best driver...'}
            </span>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/support/dispute')}
          className="flex items-center gap-2 bg-gray-100 text-black px-5 py-3.5 rounded-full font-bold text-[14px] active:scale-95 transition-transform hover:bg-gray-200"
        >
          <HelpCircle size={18} />
          Support
        </button>
      </motion.div>

    </div>
  );
}