import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Truck, Map, TrendingUp } from 'lucide-react';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { calculateDistance, getPricing, WAREHOUSE_COORDS } from '../../services/geoService';

const SlideRealPricing = ({ onNext }) => {
  const userLocation = useOnboardingStore(state => state.userLocation);

  const priceData = useMemo(() => {
    if (!userLocation) return null;
    const distance = calculateDistance(
      userLocation.lat, 
      userLocation.lng, 
      WAREHOUSE_COORDS.lat, 
      WAREHOUSE_COORDS.lng
    );
    return {
      distance: distance.toFixed(1),
      ...getPricing(distance)
    };
  }, [userLocation]);

  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }} 
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col space-y-6 p-6"
    >
      <div className="bg-blue-600 rounded-3xl p-8 text-white space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] opacity-10">
          <Truck className="w-40 h-40" />
        </div>
        
        <div className="space-y-1">
          <p className="text-blue-100 text-sm font-medium flex items-center gap-1">
            <Map className="w-4 h-4" /> Distance to Hub
          </p>
          <h3 className="text-4xl font-black">{priceData?.distance || "---"} <span className="text-xl">KM</span></h3>
        </div>

        <div className="h-px bg-white/20" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-blue-200 text-xs uppercase tracking-wider mb-1">Base Logistics</p>
            <p className="text-xl font-bold">${priceData?.base || "0.00"}</p>
          </div>
          <div>
            <p className="text-blue-200 text-xs uppercase tracking-wider mb-1">Fuel Variable</p>
            <p className="text-xl font-bold">${priceData?.distanceCharge || "0.00"}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Dynamic Pricing Logic</p>
            <p className="text-xs text-slate-500">Prices are calculated in real-time based on your current GPS distance to our nearest distribution hub.</p>
          </div>
        </div>

        <button
          onClick={onNext}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-semibold flex items-center justify-center space-x-2"
        >
          <Calculator className="w-5 h-5" />
          <span>Confirm Pricing Structure</span>
        </button>
      </div>
    </motion.div>
  );
};

export default SlideRealPricing;