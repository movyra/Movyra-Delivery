import React, { useState } from 'react';
import { Search, ScanLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TrackingSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tracking-active?id=${searchQuery}`);
    }
  };

  return (
    <div className="px-6 mb-8 mt-2">
      <h3 className="font-bold mb-4 text-[15px] text-white tracking-wide">Track your Shipping</h3>
      <form onSubmit={handleSearch} className="flex gap-3">
        {/* Pill-shaped Search Input */}
        <div className="flex-1 bg-surfaceDark rounded-2xl flex items-center px-5 py-4 border border-white/5 focus-within:border-movyraMint transition-colors">
          <Search size={20} className="text-textGray mr-3 flex-shrink-0" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter your Shipping number" 
            className="bg-transparent w-full outline-none text-white placeholder-textGray text-[14px] font-medium"
          />
        </div>
        
        {/* QR Scan Button */}
        <button 
          type="button"
          onClick={() => console.log('Open QR Scanner')}
          className="bg-white text-surfaceBlack px-5 py-4 rounded-2xl flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.1)]"
        >
          <ScanLine size={24} strokeWidth={2.5} />
        </button>
      </form>
    </div>
  );
}