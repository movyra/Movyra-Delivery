import React from 'react';
import { Bike, Truck, Package } from 'lucide-react';
export default function VehicleCard({ vehicle, isSelected, onClick }) {
  const Icon = vehicle.id === 'bike' ? Bike : vehicle.id === 'truck' ? Truck : Package;
  return (
    <div onClick={onClick} className={`min-w-[140px] p-5 rounded-3xl border transition-all cursor-pointer snap-center flex flex-col items-center text-center ${isSelected ? 'bg-movyraMint/10 border-movyraMint shadow-mintGlow text-movyraMint' : 'bg-surfaceDark border-white/5 text-textGray hover:bg-surfaceDarker'}`}>
      <div className="mb-4"><Icon size={40} /></div>
      <h3 className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-white/80'}`}>{vehicle.name}</h3>
      <p className="text-textGray text-xs font-medium uppercase tracking-widest mt-1 mb-3">Up to {vehicle.capacity}</p>
      <div className={`text-xl font-black ${isSelected ? 'text-movyraMint' : 'text-white'}`}>₹{vehicle.price}</div>
      <div className="text-[10px] mt-1 text-textGray">ETA: {vehicle.eta} mins</div>
    </div>
  );
}
