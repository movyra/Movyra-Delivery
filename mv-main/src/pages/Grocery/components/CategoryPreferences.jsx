import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../firebaseConfig';

/**
 * ============================================================================
 * COMPONENT: GROCERY CATEGORY PREFERENCES (mv-main)
 * Purpose: Collect dietary and lifestyle preferences for catalog tailoring.
 * Behavior: Reads/Writes to grocery_profiles/{uid}. Passes control to Location.
 * ============================================================================
 */

const CATEGORIES = [
  { id: 'organic', label: '100% Organic', desc: 'Pesticide-free farming', icon: '🌱' },
  { id: 'vegan', label: 'Vegan Friendly', desc: 'Plant-based exclusively', icon: '🌿' },
  { id: 'gluten_free', label: 'Gluten-Free', desc: 'Zero wheat or gluten', icon: '🌾' },
  { id: 'keto', label: 'Keto / Low Carb', desc: 'High fat, minimal carbs', icon: '🥑' },
  { id: 'dairy_free', label: 'Dairy-Free', desc: 'No milk, cheese, or butter', icon: '🥛' },
  { id: 'high_protein', label: 'High Protein', desc: 'Muscle & fitness focused', icon: '🥩' }
];

export default function CategoryPreferences({ onNext, onBack }) {
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch existing preferences if user navigates backwards
  useEffect(() => {
    const fetchPreferences = async () => {
      if (auth.currentUser) {
        try {
          const docRef = doc(db, 'grocery_profiles', auth.currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().dietaryPreferences) {
            setSelected(docSnap.data().dietaryPreferences);
          }
        } catch (error) {
          console.error("Failed to fetch existing preferences:", error);
        }
      }
      setFetching(false);
    };
    fetchPreferences();
  }, []);

  const toggleCategory = (id) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSaveAndContinue = async () => {
    setLoading(true);
    try {
      if (auth.currentUser) {
        const docRef = doc(db, 'grocery_profiles', auth.currentUser.uid);
        // Using merge: true ensures we don't overwrite any existing profile data (like email or name)
        await setDoc(docRef, {
          dietaryPreferences: selected,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
      onNext();
    } catch (error) {
      console.error("Failed to save preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  if (fetching) {
    return (
      <div className="w-full min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#333333] border-t-[#00ff88] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#000000] text-white flex flex-col px-6 py-10 relative overflow-x-hidden">
      
      {/* Top Navigation Bar */}
      <div className="w-full max-w-[600px] mx-auto flex items-center justify-between mb-8 z-20">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-[#111111] border border-[#333333] flex items-center justify-center hover:bg-[#222222] transition-colors">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <span className="text-[#666666] font-mono text-[0.7rem] uppercase tracking-widest font-bold">Step 1 of 3</span>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      <div className="w-full max-w-[600px] mx-auto flex-1 flex flex-col z-20">
        
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-[2.2rem] font-black tracking-tight leading-tight mb-3">
            Personalize<br />Your Grid
          </h1>
          <p className="text-[#888888] text-[0.95rem] leading-relaxed">
            Select your dietary preferences. Our AI will automatically tailor your daily catalog to highlight items that match your lifestyle.
          </p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="show" 
          className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-12"
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selected.includes(cat.id);
            return (
              <motion.button
                key={cat.id}
                variants={itemVariants}
                onClick={() => toggleCategory(cat.id)}
                className={`flex flex-col items-start p-5 rounded-[20px] border text-left transition-all duration-300 ${
                  isSelected 
                    ? 'bg-[#00ff88]/10 border-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.1)]' 
                    : 'bg-[#050505] border-[#222222] hover:border-[#444444]'
                }`}
              >
                <span className="text-[1.8rem] mb-3 grayscale filter drop-shadow-[0_2px_4px_rgba(255,255,255,0.1)]">{cat.icon}</span>
                <span className={`font-black text-[1rem] mb-1 ${isSelected ? 'text-[#00ff88]' : 'text-white'}`}>
                  {cat.label}
                </span>
                <span className="text-[#666666] text-[0.75rem] leading-snug">
                  {cat.desc}
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Footer Actions */}
        <div className="mt-auto pt-6 border-t border-[#111111]">
          <button 
            onClick={handleSaveAndContinue}
            disabled={loading}
            className="w-full bg-white text-black font-black text-[1.1rem] tracking-tight py-4 rounded-xl hover:bg-[#e0e0e0] transition-colors disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? 'Saving Profile...' : selected.length === 0 ? 'Skip for Now' : `Continue with ${selected.length} Selected`}
          </button>
        </div>

      </div>
    </div>
  );
}