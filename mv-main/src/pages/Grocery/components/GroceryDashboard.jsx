import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ============================================================================
 * COMPONENT: GROCERY MAIN DASHBOARD (mv-main)
 * Purpose: Primary shopping interface post-onboarding.
 * Behavior: Renders product catalog, manages local cart state, formats INR.
 * ============================================================================
 */

// Native INR Formatter
const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

// Application State Product Catalog
const INVENTORY = [
  { id: 'p1', name: 'Farm Fresh Tomatoes', category: 'Produce', price: 45, weight: '500g' },
  { id: 'p2', name: 'Organic Red Onions', category: 'Produce', price: 35, weight: '500g' },
  { id: 'p3', name: 'Whole Wheat Bread', category: 'Bakery', price: 50, weight: '400g' },
  { id: 'p4', name: 'Free Range Eggs', category: 'Dairy', price: 85, weight: '6 Pack' },
  { id: 'p5', name: 'A2 Cow Milk', category: 'Dairy', price: 90, weight: '1L' },
  { id: 'p6', name: 'Cold Pressed Olive Oil', category: 'Pantry', price: 850, weight: '500ml' },
  { id: 'p7', name: 'Himalayan Pink Salt', category: 'Pantry', price: 120, weight: '1kg' },
  { id: 'p8', name: 'Premium Cashews', category: 'Snacks', price: 450, weight: '250g' }
];

const CATEGORIES = ['All', 'Produce', 'Dairy', 'Bakery', 'Pantry', 'Snacks'];

export default function GroceryDashboard({ userProfile }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState({}); // Structure: { [productId]: quantity }

  // Derive filtered inventory
  const filteredInventory = useMemo(() => {
    if (activeCategory === 'All') return INVENTORY;
    return INVENTORY.filter(item => item.category === activeCategory);
  }, [activeCategory]);

  // Cart Operations
  const addToCart = (productId) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const removeFromCart = (productId) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId] -= 1;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  // Derive cart totals
  const cartTotals = useMemo(() => {
    let totalItems = 0;
    let totalPrice = 0;
    Object.entries(cart).forEach(([id, qty]) => {
      const product = INVENTORY.find(p => p.id === id);
      if (product) {
        totalItems += qty;
        totalPrice += product.price * qty;
      }
    });
    return { totalItems, totalPrice };
  }, [cart]);

  // Layout Animation Variants
  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };

  return (
    <div className="w-full min-h-screen bg-[#000000] text-white flex flex-col font-sans pb-32">
      
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#000000]/90 backdrop-blur-md border-b border-[#111111] px-6 py-4 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[#00ff88] font-black text-[1.2rem] tracking-tight leading-none">Movyra Grocery</span>
          <span className="text-[#666666] text-[0.7rem] uppercase tracking-widest font-bold mt-1">
            {userProfile?.deliveryLocation?.city ? `Delivering to ${userProfile.deliveryLocation.city}` : 'Grid Active'}
          </span>
        </div>
        <div className="w-10 h-10 bg-[#111111] border border-[#333333] rounded-full flex items-center justify-center">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </div>
      </header>

      {/* Category Horizontal Scroll */}
      <div className="w-full px-6 py-6 overflow-x-auto no-scrollbar flex gap-3 border-b border-[#111111]">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`whitespace-nowrap px-5 py-2 rounded-full font-bold text-[0.85rem] transition-colors ${
              activeCategory === category 
                ? 'bg-white text-black' 
                : 'bg-[#111111] text-[#888888] border border-[#222222] hover:text-white'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <main className="flex-1 px-6 py-8">
        <motion.div 
          key={activeCategory}
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {filteredInventory.map(product => {
            const qty = cart[product.id] || 0;
            return (
              <div key={product.id} className="bg-[#050505] border border-[#222222] rounded-[20px] p-4 flex flex-col hover:border-[#444444] transition-colors">
                
                {/* Abstract Image Placeholder representing the product */}
                <div className="w-full aspect-square bg-[#111111] rounded-[12px] mb-4 flex items-center justify-center text-[2rem] grayscale opacity-50">
                  {product.category === 'Produce' ? '🥬' : product.category === 'Dairy' ? '🥛' : product.category === 'Bakery' ? '🍞' : '📦'}
                </div>
                
                <h3 className="font-bold text-[0.95rem] leading-tight mb-1">{product.name}</h3>
                <span className="text-[#666666] text-[0.75rem] font-bold mb-3">{product.weight}</span>
                
                <div className="mt-auto flex items-center justify-between">
                  <span className="font-black text-[1.1rem] text-[#00ff88]">{formatINR(product.price)}</span>
                  
                  {qty === 0 ? (
                    <button onClick={() => addToCart(product.id)} className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-black hover:bg-[#e0e0e0] transition-colors">
                      +
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 bg-[#111111] rounded-full border border-[#333333] px-2 py-1">
                      <button onClick={() => removeFromCart(product.id)} className="w-6 h-6 rounded-full bg-[#222222] flex items-center justify-center text-white font-bold hover:bg-[#333333]">-</button>
                      <span className="font-bold text-[0.85rem] w-3 text-center">{qty}</span>
                      <button onClick={() => addToCart(product.id)} className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center font-bold">+</button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </motion.div>
      </main>

      {/* Floating Checkout Action Bar */}
      <AnimatePresence>
        {cartTotals.totalItems > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-6 right-6 md:left-auto md:right-10 md:w-[400px] z-50 bg-[#00ff88] text-black rounded-[20px] p-4 flex items-center justify-between shadow-[0_10px_40px_rgba(0,255,136,0.2)]"
          >
            <div className="flex flex-col">
              <span className="font-black text-[0.8rem] uppercase tracking-widest">{cartTotals.totalItems} Items</span>
              <span className="font-black text-[1.2rem]">{formatINR(cartTotals.totalPrice)}</span>
            </div>
            <button className="bg-black text-white px-6 py-3 rounded-xl font-black text-[0.95rem] tracking-tight hover:bg-[#222222] transition-colors flex items-center gap-2">
              Checkout 
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}