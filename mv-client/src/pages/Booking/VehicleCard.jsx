import React from 'react';
import { Bike, Truck, Package } from 'lucide-react';

export default function VehicleCard({ vehicle, isSelected, onClick }) {
  // Map vehicle ID to Lucide icons
  const renderIcon = () => {
    switch (vehicle.id) {
      case 'bike': return <Bike size={40} />;
      case 'tempo': return <Package size={40} />;
      case 'truck': return <Truck size={40} />;
      default: return <Package size={40} />;
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`min-w-[140px] p-5 rounded-3xl border transition-all duration-300 cursor-pointer snap-center flex flex-col items-center text-center ${
        isSelected 
          ? 'bg-movyraMint/10 border-movyraMint shadow-mintGlow' 
          : 'bg-surfaceDark border-white/5 hover:bg-surfaceDarker'
      }`}
    >
      <div className={`mb-4 ${isSelected ? 'text-movyraMint drop-shadow-[0_0_10px_rgba(0,240,181,0.5)]' : 'text-textGray'}`}>
        {renderIcon()}
      </div>
      
      <h3 className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-white/80'}`}>
        {vehicle.name}
      </h3>
      <p className="text-textGray text-xs font-medium tracking-widest uppercase mt-1 mb-3">
        Up to {vehicle.capacity}
      </p>
      
      <div className={`text-xl font-black ${isSelected ? 'text-movyraMint' : 'text-white'}`}>
        ₹{vehicle.price}
      </div>
      <div className="text-textGray text-[10px] mt-1">
        ETA: {vehicle.eta} mins
      </div>
    </div>
  );
}