import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, MapPin, Package, Car, CalendarClock, Key, Briefcase } from 'lucide-react';

export default function DashboardHome() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Rides');

  // Navigate to location picker when user wants to start a booking
  const handleStartBooking = (type) => {
    // For Movyra, we route all primary logistics tasks to the location picker first
    navigate('/location-picker');
  };

  return (
    <div className="flex flex-col bg-white min-h-full font-sans pb-24">
      {/* Top Segmented Control (Rides | Delivery) */}
      <div className="pt-8 pb-4 px-6">
        <div className="bg-[#F3F3F3] rounded-full p-1.5 flex shadow-sm">
          <button
            onClick={() => setActiveTab('Rides')}
            className={`flex-1 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${
              activeTab === 'Rides' ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] text-black' : 'text-gray-600'
            }`}
          >
            Rides
          </button>
          <button
            onClick={() => setActiveTab('Delivery')}
            className={`flex-1 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${
              activeTab === 'Delivery' ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] text-black' : 'text-gray-600'
            }`}
          >
            Delivery
          </button>
        </div>
      </div>

      {/* Sticky-like Search Bar */}
      <div className="px-6 mb-8">
        <div 
          onClick={() => handleStartBooking('search')}
          className="bg-[#F3F3F3] rounded-full p-3 pl-5 pr-4 flex items-center justify-between cursor-pointer hover:bg-gray-200 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Search size={24} className="text-black" />
            <span className="text-xl font-bold text-black tracking-tight">Where to?</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-full flex items-center gap-2 shadow-sm border border-gray-100">
            <Clock size={16} className="text-black" />
            <span className="font-bold text-sm">Now</span>
            <span className="text-xs ml-1">▼</span>
          </div>
        </div>
      </div>

      {/* Saved Places Quick Links */}
      <div className="px-6 mb-8 space-y-5">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleStartBooking('work')}>
          <div className="w-10 h-10 bg-[#F3F3F3] rounded-full flex items-center justify-center shrink-0">
            <Briefcase size={20} className="text-black fill-black" />
          </div>
          <div className="border-b border-gray-100 pb-4 flex-1">
            <p className="font-bold text-[17px]">Work</p>
            <p className="text-sm text-gray-500 font-medium">1455 Market St</p>
          </div>
        </div>
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleStartBooking('home')}>
          <div className="w-10 h-10 bg-[#F3F3F3] rounded-full flex items-center justify-center shrink-0">
            <MapPin size={20} className="text-black fill-black" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[17px]">Home</p>
            <p className="text-sm text-gray-500 font-medium">903 Sunrose Terr</p>
          </div>
        </div>
      </div>

      <div className="w-full h-2 bg-[#F3F3F3] mb-6"></div>

      {/* Suggestions Grid */}
      <div className="px-6 mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold tracking-tight">Suggestions</h2>
          <span className="text-sm font-bold text-gray-600 cursor-pointer">See all</span>
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          {[
            { id: 'ride', label: 'Ride', icon: Car, size: 36 },
            { id: 'package', label: 'Package', icon: Package, size: 36 },
            { id: 'reserve', label: 'Reserve', icon: CalendarClock, size: 32 },
            { id: 'rent', label: 'Rent', icon: Key, size: 32 },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.id} 
                onClick={() => handleStartBooking(item.id)}
                className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform"
              >
                <div className="w-full aspect-[4/3] bg-[#F3F3F3] rounded-xl flex items-center justify-center relative overflow-hidden group">
                   <div className="absolute right-[-10px] bottom-[-5px] opacity-20 group-hover:scale-110 transition-transform">
                     <Icon size={item.size * 2} strokeWidth={1} />
                   </div>
                   <Icon size={item.size} className="text-black relative z-10" strokeWidth={1.5} />
                </div>
                <span className="text-[13px] font-bold text-gray-800">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Promotional Banners */}
      <div className="px-6 mb-6">
        <h2 className="text-xl font-bold tracking-tight mb-4">Ways to plan with Movyra</h2>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar snap-x pb-4">
          <div className="min-w-[280px] bg-[#E8F5E9] rounded-2xl p-5 flex flex-col justify-between aspect-[4/3] snap-start relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="font-bold text-lg leading-tight mb-1">Schedule your<br/>daily rides</h3>
               <p className="text-sm text-gray-700 font-medium">Plan ahead and relax</p>
             </div>
             <CalendarClock size={80} className="absolute right-[-10px] bottom-[-10px] text-green-600/20" />
             <button className="bg-white text-black self-start px-4 py-1.5 rounded-full text-xs font-bold shadow-sm relative z-10">Try Reserve</button>
          </div>
          
          <div className="min-w-[280px] bg-[#E3F2FD] rounded-2xl p-5 flex flex-col justify-between aspect-[4/3] snap-start relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="font-bold text-lg leading-tight mb-1">Fast & Secure<br/>Deliveries</h3>
               <p className="text-sm text-gray-700 font-medium">Intra-city logistics sorted</p>
             </div>
             <Package size={80} className="absolute right-[-10px] bottom-[-10px] text-[#00A3FF]/20" />
             <button className="bg-white text-black self-start px-4 py-1.5 rounded-full text-xs font-bold shadow-sm relative z-10">Send Package</button>
          </div>
        </div>
      </div>
    </div>
  );
}