import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

/**
 * ============================================================================
 * COMPONENT: GROCERY HOME FEED CONTROLLER (mv-main)
 * Purpose: Primary landing interface hydrating live storefront pipelines.
 * Behavior: Performs explicit queries across promotions, stores, and products.
 * Structural Constraint: Strict zero emoji vector configuration.
 * ============================================================================
 */

const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

export default function HomeFeed({ onSelectStore, onSelectProduct }) {
  const [promotions, setPromotions] = useState([]);
  const [popularStores, setPopularStores] = useState([]);
  const [todaysChoice, setTodaysChoice] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function hydrateStorefrontData() {
      try {
        setLoading(true);

        // 1. Fetch Active Promotional Banners
        const promosQuery = query(collection(db, 'promotions'), where('active', '==', true), limit(3));
        const promosSnapshot = await getDocs(promosQuery);
        const fetchedPromos = promosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPromotions(fetchedPromos);

        // 2. Fetch Popular Stores
        const storesQuery = query(collection(db, 'stores'), limit(5));
        const storesSnapshot = await getDocs(storesQuery);
        const fetchedStores = storesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPopularStores(fetchedStores);

        // 3. Fetch Selected Curations (Today's Choice)
        const choiceQuery = query(collection(db, 'products'), where('isTodaysChoice', '==', true), limit(6));
        const choiceSnapshot = await getDocs(choiceQuery);
        const fetchedChoice = choiceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTodaysChoice(fetchedChoice);

      } catch (error) {
        console.error("Firestore Core Hydration Rejection Error:", error);
      } finally {
        setLoading(false);
      }
    }

    hydrateStorefrontData();
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#000000] text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[#666666] text-[0.8rem] uppercase tracking-widest font-bold">Synchronizing Grid</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#000000] text-white font-sans px-6 py-6">
      
      {/* Top Welcome Title */}
      <div className="w-full mb-6 flex flex-col">
        <span className="text-[#666666] text-[0.7rem] uppercase tracking-widest font-bold">Welcome Back</span>
        <h1 className="text-[1.8rem] font-black tracking-tight mt-0.5">Movyra Marketplace</h1>
      </div>

      {/* Dynamic Summer Sales Banner Section */}
      <div className="w-full overflow-x-auto no-scrollbar flex gap-4 mb-8">
        {promotions.length > 0 ? (
          promotions.map((promo) => (
            <div key={promo.id} className="min-w-[85%] md:min-w-[340px] h-[140px] bg-gradient-to-r from-[#111111] to-[#1a1a1a] border border-[#222222] rounded-[20px] p-5 flex flex-col justify-between shrink-0 relative overflow-hidden">
              <div className="z-10 max-w-[65%]">
                <span className="text-[#00ff88] text-[0.65rem] uppercase tracking-widest font-black">Summer Sales</span>
                <h2 className="text-[1.2rem] font-black tracking-tight leading-tight mt-1">{promo.title}</h2>
              </div>
              <div className="absolute right-4 bottom-4 opacity-10 select-none text-white pointer-events-none">
                <svg viewBox="0 0 24 24" width="72" height="72" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              </div>
            </div>
          ))
        ) : (
          <div className="w-full h-[140px] bg-[#111111] border border-[#222222] border-dashed rounded-[20px] flex items-center justify-center text-[#444444] text-[0.85rem] font-bold">
            No live campaign streams active at this timestamp
          </div>
        )}
      </div>

      {/* Category Selection Filter Tiers */}
      <div className="w-full mb-8">
        <h3 className="text-[1.1rem] font-black tracking-tight mb-4">Explore Categories</h3>
        <div className="w-full flex gap-3 overflow-x-auto no-scrollbar">
          {['All', 'Groceries', 'Beverages', 'Meats', 'Snacks'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-xl font-bold text-[0.8rem] transition-all shrink-0 ${
                activeCategory === cat ? 'bg-white text-black' : 'bg-[#0a0a0a] border border-[#1a1a1a] text-[#888888] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Popular Vendor Ecosystem (e.g., Nippon Mart) */}
      <div className="w-full mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[1.1rem] font-black tracking-tight">Popular Stores</h3>
          <span className="text-[#666666] text-[0.75rem] font-bold uppercase tracking-wider">See All</span>
        </div>
        <div className="w-full flex flex-col gap-3">
          {popularStores.length > 0 ? (
            popularStores.map((store) => (
              <div
                key={store.id}
                onClick={() => onSelectStore(store.id)}
                className="w-full bg-[#050505] border border-[#1c1c1c] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-[#333333] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#111111] border border-[#222222] rounded-xl flex items-center justify-center text-[#666666]">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-bold text-[0.95rem] tracking-tight">{store.name}</h4>
                    <span className="text-[#666666] text-[0.75rem] mt-0.5 font-medium">{store.type || 'Supermarket'}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end text-right">
                  <span className="text-[#00ff88] text-[0.8rem] font-black">Rating: {store.rating || '4.5'}</span>
                  <span className="text-[#666666] text-[0.7rem] font-bold mt-1 uppercase tracking-wide">{store.deliveryTime || '25 mins'}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full p-6 text-center text-[#444444] border border-[#1c1c1c] rounded-2xl text-[0.85rem] font-bold">
              No physical fulfillment centers resolved within your operational perimeter
            </div>
          )}
        </div>
      </div>

      {/* Curated Feed Items (Today's Choice Selection) */}
      <div className="w-full mb-12">
        <h3 className="text-[1.1rem] font-black tracking-tight mb-4">Today's Choice</h3>
        <div className="grid grid-cols-2 gap-4">
          {todaysChoice.length > 0 ? (
            todaysChoice.map((product) => (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product.id)}
                className="bg-[#050505] border border-[#1c1c1c] rounded-2xl p-4 flex flex-col cursor-pointer hover:border-[#333333] transition-colors"
              >
                <div className="w-full aspect-square bg-[#111111] rounded-xl mb-3 flex items-center justify-center text-[#444444]">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                </div>
                <h4 className="font-bold text-[0.9rem] tracking-tight leading-snug line-clamp-1">{product.name}</h4>
                <span className="text-[#666666] text-[0.75rem] font-bold mt-0.5 mb-2">{product.weight}</span>
                <span className="text-[#00ff88] font-black text-[1rem] mt-auto">{formatINR(product.price)}</span>
              </div>
            ))
          ) : (
            <div className="col-span-2 p-6 text-center text-[#444444] border border-[#1c1c1c] rounded-2xl text-[0.85rem] font-bold">
              No matching inventory item lines have been tagged for focus distribution today
            </div>
          )}
        </div>
      </div>

    </div>
  );
}