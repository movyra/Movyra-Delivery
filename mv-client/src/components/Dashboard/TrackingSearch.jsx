import React, { useState } from 'react';
import { Search, ScanLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export default function TrackingSearch() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const search = (e) => { e.preventDefault(); if (query) navigate(`/tracking-active?id=${query}`); };
  return (
    <div className="px-6 mb-8 mt-2">
      <h3 className="font-bold mb-4 text-[15px] text-white">Track your Shipping</h3>
      <form onSubmit={search} className="flex gap-3">
        <div className="flex-1 bg-surfaceDark rounded-2xl flex items-center px-5 py-4 border border-white/5 focus-within:border-movyraMint">
          <Search size={20} className="text-textGray mr-3" />
          <input type="text" value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Enter Shipping number" className="bg-transparent w-full outline-none text-white text-sm" />
        </div>
        <button type="button" className="bg-white text-surfaceBlack px-5 py-4 rounded-2xl flex items-center shadow-lg"><ScanLine size={24} /></button>
      </form>
    </div>
  );
}
