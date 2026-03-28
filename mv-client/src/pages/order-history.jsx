import React, { useState, useEffect } from 'react';
import { Filter, Search } from 'lucide-react';
import ShippingListItem from '../components/Dashboard/ShippingListItem';
import apiClient from '../services/apiClient';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    apiClient.get('/history').catch(() => {
      setOrders([{ id: "MVSBY122032", origin: "Pune", destination: "Mumbai" }, { id: "MVBDG141731", origin: "Pune", destination: "Delhi" }]);
    });
  }, []);

  return (
    <div className="min-h-screen bg-surfaceBlack text-white px-6 pt-14 pb-32">
      {/* Sec 1: Header */}
      <h1 className="text-3xl font-bold mb-6">Your Deliveries.</h1>
      
      {/* Sec 2: Filter/Search Bar */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 bg-surfaceDark rounded-2xl flex items-center px-4 py-3 border border-white/5"><Search size={18} className="text-textGray mr-2"/><input type="text" placeholder="Search orders" className="bg-transparent outline-none text-sm"/></div>
        <button className="w-12 h-12 bg-surfaceDark rounded-2xl flex items-center justify-center border border-white/5 text-white"><Filter size={20} /></button>
      </div>

      {/* Sec 3: Quick Stats */}
      <div className="flex gap-4 mb-8">
         <div className="flex-1 bg-movyraMint/10 border border-movyraMint/30 rounded-2xl p-4"><p className="text-2xl font-bold text-movyraMint">12</p><p className="text-xs text-textGray">Completed</p></div>
         <div className="flex-1 bg-surfaceDark rounded-2xl p-4 border border-white/5"><p className="text-2xl font-bold text-white">2</p><p className="text-xs text-textGray">In Transit</p></div>
      </div>

      {/* Sec 4: Date Group */}
      <h3 className="text-sm font-bold text-textGray mb-4">OCTOBER 2026</h3>

      {/* Sec 5: List */}
      <div className="bg-surfaceDark rounded-[32px] p-2 flex flex-col gap-1 border border-white/5">
        {orders.map((o) => <ShippingListItem key={o.id} trackingId={o.id} origin={o.origin} destination={o.destination} onClick={()=>console.log('view')} />)}
      </div>
    </div>
  );
}
