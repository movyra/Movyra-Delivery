import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

/**
 * ============================================================================
 * COMPONENT: GROCERY STORE CATALOG (mv-main)
 * Purpose: Renders the specific inventory of a selected vendor.
 * Behavior: Dynamic compound Firestore queries (storeId + category).
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

export default function StoreCatalog({ storeId, onBack, onSelectProduct }) {
  const [storeData, setStoreData] = useState(null);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All Product');
  const [loading, setLoading] = useState(true);

  // Dynamic Category Extraction based on actual inventory
  const [availableCategories, setAvailableCategories] = useState(['All Product']);

  useEffect(() => {
    async function hydrateStoreCatalog() {
      if (!storeId) return;

      try {
        setLoading(true);

        // 1. Fetch Store Metadata
        const storeRef = doc(db, 'stores', storeId);
        const storeSnap = await getDoc(storeRef);
        
        if (storeSnap.exists()) {
          setStoreData(storeSnap.data());
        } else {
          console.error("Store metadata resolution failed. Document does not exist.");
          setLoading(false);
          return;
        }

        // 2. Build Inventory Query based on Active Filter
        let inventoryQuery;
        if (activeCategory === 'All Product') {
          inventoryQuery = query(collection(db, 'products'), where('storeId', '==', storeId));
        } else {
          // Note: Requires Composite Index in Firestore (storeId ASC, category ASC)
          inventoryQuery = query(
            collection(db, 'products'), 
            where('storeId', '==', storeId),
            where('category', '==', activeCategory)
          );
        }

        const inventorySnapshot = await getDocs(inventoryQuery);
        const fetchedProducts = inventorySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setProducts(fetchedProducts);

        // 3. Extract Unique Categories if loading 'All' to populate tabs
        if (activeCategory === 'All Product') {
          const uniqueCats = new Set(fetchedProducts.map(p => p.category).filter(Boolean));
          setAvailableCategories(['All Product', ...Array.from(uniqueCats)]);
        }

      } catch (error) {
        console.error("Firestore Catalog Hydration Rejection Error:", error);
      } finally {
        setLoading(false);
      }
    }

    hydrateStoreCatalog();
  }, [storeId, activeCategory]);

  // Layout Animation Variants
  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  if (loading && !storeData) {
    return (
      <div className="w-full min-h-screen bg-[#000000] text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[#666666] text-[0.8rem] uppercase tracking-widest font-bold">Mounting Store Data</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#000000] text-white font-sans flex flex-col pb-32">
      
      {/* Top Navigation & Store Header Area */}
      <div className="w-full bg-[#050505] border-b border-[#111111] pb-6">
        
        {/* Banner Image Placeholder Area */}
        <div className="w-full h-[180px] bg-[#111111] relative overflow-hidden flex items-start p-4">
          {/* Abstract Grid Pattern Background */}
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#222222 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
          
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-[#000000]/50 backdrop-blur-md rounded-full flex items-center justify-center border border-[#333333] hover:bg-[#222222] transition-colors relative z-10"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        </div>

        {/* Store Metadata */}
        <div className="px-6 pt-6 flex items-start justify-between">
          <div className="flex flex-col">
            <h1 className="text-[1.8rem] font-black tracking-tight leading-none mb-2">
              {storeData?.name || 'Store Default'}
            </h1>
            <div className="flex items-center gap-2 text-[#888888] text-[0.85rem] font-medium">
              <span>{storeData?.deliveryTime || '15 mins'}</span>
              <span className="w-1 h-1 rounded-full bg-[#333333]"></span>
              <span className="text-[#00ff88] font-bold">★ {storeData?.rating || '4.8'}</span>
            </div>
          </div>

          {/* Action Button */}
          <button className="w-10 h-10 border border-[#333333] rounded-full flex items-center justify-center text-white hover:bg-[#111111] transition-colors">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className="px-6 mt-6">
          <div className="w-full bg-[#111111] border border-[#222222] rounded-xl flex items-center px-4 py-3">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Search product" 
              className="bg-transparent outline-none w-full text-[0.95rem] text-white placeholder:text-[#666666]"
            />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="w-full px-6 py-6">
        <h3 className="text-[1.1rem] font-black tracking-tight mb-4">Catalog</h3>
        <div className="w-full flex gap-3 overflow-x-auto no-scrollbar">
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full font-bold text-[0.8rem] transition-all shrink-0 ${
                activeCategory === cat ? 'bg-white text-black' : 'bg-[#111111] border border-[#222222] text-[#888888] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <main className="flex-1 px-6">
        <AnimatePresence mode="wait">
          {loading ? (
             <motion.div key="loader" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="w-full py-12 flex justify-center">
                <div className="w-6 h-6 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
             </motion.div>
          ) : products.length > 0 ? (
            <motion.div 
              key={activeCategory}
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid grid-cols-2 gap-4"
            >
              {products.map(product => (
                <div 
                  key={product.id} 
                  onClick={() => onSelectProduct(product.id)}
                  className="bg-transparent border border-transparent rounded-[20px] flex flex-col hover:border-[#222222] transition-colors p-2 cursor-pointer"
                >
                  {/* Product Image Placeholder */}
                  <div className="w-full aspect-square bg-[#111111] rounded-xl mb-3 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                  </div>
                  
                  <h3 className="font-bold text-[0.95rem] leading-tight mb-1 line-clamp-1">{product.name}</h3>
                  <span className="text-[#666666] text-[0.75rem] font-bold mb-2">{product.weight}</span>
                  <span className="font-black text-[1.1rem] text-[#00ff88] mt-auto">{formatINR(product.price)}</span>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div key="empty" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="w-full p-8 text-center text-[#444444] border border-[#1c1c1c] rounded-2xl text-[0.85rem] font-bold">
              No inventory entries found for the selected category parameter.
            </motion.div>
          )}
        </AnimatePresence>
      </main>

    </div>
  );
}