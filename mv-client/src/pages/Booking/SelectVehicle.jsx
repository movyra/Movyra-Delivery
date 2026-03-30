import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Users, Package, Clock, Loader2, ArrowRight, Info } from 'lucide-react';

// Real Store & Services Integration
import useBookingStore from '../../store/useBookingStore';
import { calculateRouteAndETA } from '../../services/googleMaps';
import { calculateDeliveryFare } from '../../services/payment';

// ============================================================================
// PAGE: SELECT VEHICLE (STARK MINIMALIST UI)
// High-contrast vehicle selection grid with Group Delivery pooling, dynamic
// capacity badges, and real-time Google Maps distance pricing.
// ============================================================================

// Static definitions for vehicle capabilities
const VEHICLE_SPECS = {
  'bike': { name: 'Moto', capacity: '20 kg', volume: 'Backpack', etaOffset: 0 },
  '3wheeler': { name: '3-Wheeler', capacity: '500 kg', volume: 'Small Furniture', etaOffset: 15 },
  'minitruck': { name: 'Mini Truck', capacity: '1000 kg', volume: '1 BHK Size', etaOffset: 25 }
};

export default function SelectVehicle() {
  const navigate = useNavigate();
  
  // Real Global State
  const { pickup, dropoffs, vehicleType, setVehicle, setPricing } = useBookingStore();
  
  // Local UI State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGroupDelivery, setIsGroupDelivery] = useState(false);
  
  // Real-time Pricing State
  const [routeMetrics, setRouteMetrics] = useState({ distanceKm: 0, baseDurationMins: 0 });
  const [livePrices, setLivePrices] = useState({});

  // ============================================================================
  // LOGIC: REAL-TIME DISTANCE & PRICING ENGINE
  // ============================================================================
  useEffect(() => {
    const fetchRealPricing = async () => {
      // Validate locations exist
      if (!pickup?.lat || dropoffs.length === 0 || !dropoffs[0]?.lat) {
        setError('Valid pickup and dropoff locations are required.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        // 1. Calculate Real Distance and ETA via Google Maps
        // Note: For multi-stop, we'd normally calculate waypoint routing. 
        // Here we sum the segments (Pickup -> Drop 1 -> Drop 2, etc.)
        let totalMeters = 0;
        let totalSeconds = 0;
        
        let currentOrigin = pickup;
        for (const dest of dropoffs) {
          if (!dest.lat) continue; // Skip empty stops
          
          const metrics = await calculateRouteAndETA(currentOrigin, [dest]);
          if (metrics && metrics[0] && metrics[0].status === 'OK') {
            totalMeters += metrics[0].distanceValueMeters;
            totalSeconds += metrics[0].durationInTrafficValueSeconds;
          }
          currentOrigin = dest; // Next leg starts from this destination
        }

        const distanceKm = totalMeters / 1000;
        const durationMins = Math.round(totalSeconds / 60);
        setRouteMetrics({ distanceKm, baseDurationMins: durationMins });

        // 2. Calculate Strict Fares via Payment Service
        const computedPrices = {
          'bike': calculateDeliveryFare(distanceKm, 'bike'),
          '3wheeler': calculateDeliveryFare(distanceKm, '3wheeler'),
          'minitruck': calculateDeliveryFare(distanceKm, 'minitruck')
        };
        
        setLivePrices(computedPrices);

        // Auto-select first vehicle if none selected
        if (!vehicleType) setVehicle('bike');

      } catch (err) {
        console.error("Pricing Calculation Error:", err);
        setError('Failed to calculate route pricing. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRealPricing();
  }, [pickup, dropoffs, setVehicle, vehicleType]);

  // ============================================================================
  // HANDLERS
  // ============================================================================
  const handleConfirm = () => {
    // Commit the final pricing to the global store before moving to review
    if (vehicleType && livePrices[vehicleType]) {
      const baseFareObj = livePrices[vehicleType];
      
      // Apply Group Pool Discount logic natively
      const finalTotal = isGroupDelivery 
        ? Math.max(Math.round(baseFareObj.totalFare * 0.8), 20) // 20% off for pooling, min ₹20
        : baseFareObj.totalFare;

      setPricing({
        estimatedPrice: finalTotal,
        surgeMultiplier: baseFareObj.surgeMultiplier,
        isGroupDelivery: isGroupDelivery
      });
      navigate('/booking/details'); // Navigate to the advanced details screen (Phase 2)
    }
  };

  // ============================================================================
  // RENDER UI
  // ============================================================================
  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans relative">
      
      {/* SECTION 1: Top Navigation */}
      <div className="pt-12 px-6 pb-2 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-50">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-black hover:bg-gray-100 transition-colors active:scale-95"
        >
          <ChevronLeft size={28} strokeWidth={2.5} />
        </button>
        <div className="w-8 h-8 rounded-md overflow-hidden bg-black flex items-center justify-center">
          <img src="/logo.png" alt="Movyra" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col px-6 pt-6 pb-32">
        
        {/* SECTION 2: Massive Typography Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-[40px] font-black text-black leading-[1.05] tracking-tighter mb-3">
            Select <br/>Vehicle.
          </h1>
          <p className="text-[15px] text-gray-500 font-medium flex items-center gap-2">
            Route: <span className="text-black font-bold">{routeMetrics.distanceKm.toFixed(1)} km</span>
          </p>
        </motion.div>

        {/* SECTION 3: Group Delivery / Pool Toggle */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.1 }}
          className="bg-[#F6F6F6] p-1.5 rounded-full flex mb-8 relative border-2 border-transparent focus-within:border-black transition-all"
        >
          {/* Animated Background Pill */}
          <div 
            className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-full shadow-sm transition-all duration-300 ease-out"
            style={{ left: isGroupDelivery ? 'calc(50% + 3px)' : '6px' }}
          />

          <button 
            onClick={() => setIsGroupDelivery(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-[15px] font-bold transition-colors z-10 ${!isGroupDelivery ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Package size={18} strokeWidth={2.5} /> Standard
          </button>
          
          <button 
            onClick={() => setIsGroupDelivery(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-[15px] font-bold transition-colors z-10 ${isGroupDelivery ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Users size={18} strokeWidth={2.5} /> Group Save 20%
          </button>
        </motion.div>

        {/* Real-time Error Handling */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 font-bold text-sm flex items-start gap-2">
              <Info size={18} className="shrink-0 mt-0.5" /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION 4: Vehicle Selection Grid */}
        <div className="space-y-4">
          {isLoading ? (
            // Stark Loading Skeletons
            [1, 2, 3].map(i => (
              <div key={i} className="h-[120px] bg-[#F6F6F6] rounded-[24px] animate-pulse" />
            ))
          ) : (
            Object.entries(VEHICLE_SPECS).map(([vType, spec], idx) => {
              const isSelected = vehicleType === vType;
              const basePrice = livePrices[vType]?.totalFare || 0;
              const displayPrice = isGroupDelivery ? Math.max(Math.round(basePrice * 0.8), 20) : basePrice;
              const displayEta = routeMetrics.baseDurationMins + spec.etaOffset + (isGroupDelivery ? 45 : 0);

              return (
                <motion.div 
                  key={vType}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + (idx * 0.1) }}
                  onClick={() => setVehicle(vType)}
                  className={`relative p-5 rounded-[24px] border-2 transition-all cursor-pointer ${isSelected ? 'border-black bg-white shadow-[0_12px_30px_rgba(0,0,0,0.08)] scale-[1.02]' : 'border-transparent bg-[#F6F6F6] hover:border-gray-300'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-[20px] font-black tracking-tight text-black">{spec.name}</h3>
                      {/* Capacity Badges */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="bg-gray-200 text-black text-[11px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide">
                          {spec.capacity}
                        </span>
                        <span className="text-gray-500 text-[13px] font-bold flex items-center gap-1">
                          • {spec.volume}
                        </span>
                      </div>
                    </div>
                    
                    {/* Massive Price Typography */}
                    <div className="text-right">
                      <div className="text-[26px] font-black text-black leading-none flex items-start justify-end gap-0.5">
                        <span className="text-[14px] mt-1">₹</span>{displayPrice}
                      </div>
                      {isGroupDelivery && (
                        <div className="text-[12px] font-bold text-green-600 line-through mt-1 opacity-60">₹{basePrice}</div>
                      )}
                    </div>
                  </div>

                  {/* ETA & Status Row */}
                  <div className="flex items-center gap-4 text-[13px] font-bold mt-4 pt-4 border-t border-gray-200/60">
                    <span className="flex items-center gap-1.5 text-black">
                      <Clock size={16} strokeWidth={2.5} className="text-gray-400" />
                      {displayEta} mins away
                    </span>
                    {livePrices[vType]?.surgeMultiplier > 1.0 && (
                      <span className="text-[#276EF1] flex items-center gap-1">
                        High Demand
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* SECTION 5: Floating Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pt-4 bg-white/90 backdrop-blur-md border-t border-gray-100 z-50">
        <button 
          onClick={handleConfirm}
          disabled={isLoading || !vehicleType || !!error}
          className="w-full flex items-center justify-between px-6 bg-black text-white py-4 rounded-full font-bold text-[17px] hover:bg-gray-900 active:scale-[0.98] transition-all h-[60px] shadow-[0_10px_30px_rgba(0,0,0,0.2)] disabled:opacity-50 disabled:shadow-none"
        >
          <span className="flex-1 text-center pl-6">
            {isLoading ? 'Calculating...' : 'Add Package Details'}
          </span>
          {isLoading ? <Loader2 size={24} className="animate-spin text-white" /> : <ArrowRight size={24} className="text-white" />}
        </button>
      </div>

    </div>
  );
}