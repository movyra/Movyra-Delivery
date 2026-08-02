import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../../firebaseConfig';

/**
 * ============================================================================
 * COMPONENT: PRODUCT DETAIL VIEW (mv-main)
 * Purpose: Provides sub-view for a unique inventory item with cart insertion.
 * Logic: Checks existing user_carts document and processes mutations transactional.
 * Constraints: Zero text-based emojis. Completely operational.
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

export default function ProductDetail({ productId, onBack, onNavigateToCart }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [actionFeedback, setActionFeedback] = useState('');

  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    async function fetchProductDocument() {
      if (!productId) return;
      try {
        setLoading(true);
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProduct({ id: docSnap.id, ...data });
          
          // Setup initial variant state based on returned configuration arrays
          if (data.variants && data.variants.length > 0) {
            setSelectedVariant(data.variants[0]);
          } else if (data.weight) {
            setSelectedVariant(data.weight);
          }
        } else {
          console.error("Target inventory document not found in Firestore instance.");
        }
      } catch (error) {
        console.error("Firestore retrieval exception on ProductDetail module:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProductDocument();
  }, [productId]);

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = async () => {
    if (!currentUser) {
      setActionFeedback("Authentication context missing. Please log in.");
      return;
    }
    if (!product) return;

    try {
      setIsAdding(true);
      setActionFeedback('');

      const cartRef = doc(db, 'user_carts', currentUser.uid);
      const cartSnap = await getDoc(cartRef);

      const catalogItemPayload = {
        productId: product.id,
        name: product.name,
        price: product.price,
        weight: selectedVariant || product.weight || 'Standard',
        quantity: quantity,
        storeId: product.storeId || ''
      };

      if (!cartSnap.exists()) {
        // Instantiate clear initial cart setup array map
        await setDoc(cartRef, {
          userId: currentUser.uid,
          items: [catalogItemPayload],
          updatedAt: new Date().toISOString()
        });
      } else {
        // Mutate existing collection payload matching current inventory elements safely
        const currentCartData = cartSnap.data();
        let updatedItems = [...(currentCartData.items || [])];

        const matchIndex = updatedItems.findIndex(
          item => item.productId === product.id && item.weight === catalogItemPayload.weight
        );

        if (matchIndex > -1) {
          updatedItems[matchIndex].quantity += quantity;
        } else {
          updatedItems.push(catalogItemPayload);
        }

        await updateDoc(cartRef, {
          items: updatedItems,
          updatedAt: new Date().toISOString()
        });
      }

      setActionFeedback("Product state pushed to user cart successfully.");
      
      setTimeout(() => {
        setActionFeedback('');
      }, 3000);

    } catch (error) {
      console.error("Cart generation update rule restriction or network failure:", error);
      setActionFeedback("Failed to update cart. Verify storage permissions.");
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#000000] text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[#666666] text-[0.8rem] uppercase tracking-widest font-bold">Parsing Item Manifest</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full min-h-screen bg-[#000000] text-white flex items-center justify-center font-sans p-6 text-center">
        <div>
          <p className="text-[#666666] font-bold text-[0.9rem] mb-4">The selected inventory identifier could not be verified.</p>
          <button onClick={onBack} className="px-6 py-2 bg-[#111111] border border-[#222222] text-white rounded-full font-bold text-[0.8rem]">
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#000000] text-white font-sans flex flex-col pb-32">
      
      {/* Top Header Navigation Overlay */}
      <div className="w-full bg-[#050505] border-b border-[#111111] px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-[#111111] rounded-full flex items-center justify-center border border-[#222222] hover:bg-[#222222] transition-colors"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <span className="text-[0.9rem] font-black tracking-tight uppercase text-[#888888]">Product Detail</span>
        <button 
          onClick={onNavigateToCart}
          className="w-10 h-10 bg-[#111111] rounded-full flex items-center justify-center border border-[#222222] hover:bg-[#222222] transition-colors"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0рам"></path>
          </svg>
        </button>
      </div>

      {/* Main Structural Display Canvas */}
      <div className="w-full px-6 pt-6 flex-1">
        
        {/* Absolute High Fidelity Image Area Holder */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full aspect-square bg-[#0a0a0a] border border-[#111111] rounded-[24px] flex items-center justify-center mb-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'linear-gradient(#111111 1px, transparent 1px), linear-gradient(to right, #111111 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="#222222" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="relative z-10">
            <path d="M12.89 21.66A10 10 0 1 1 21.66 12.89a9.72 9.72 0 0 1-8.77 8.77z"></path>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </motion.div>

        {/* Informational Text Aggregation Headers */}
        <div className="mb-6">
          <span className="text-[#00ff88] text-[0.75rem] uppercase tracking-widest font-black bg-[#00ff88]/5 border border-[#00ff88]/10 px-3 py-1 rounded-md inline-block mb-3">
            In Stock Live
          </span>
          <h1 className="text-[1.75rem] font-black tracking-tight leading-tight mb-2">{product.name}</h1>
          <p className="text-[#00ff88] text-[1.4rem] font-black">{formatINR(product.price)}</p>
        </div>

        {/* Dynamic Variable Selection Array Row */}
        {product.variants && product.variants.length > 0 && (
          <div className="mb-6 border-t border-[#111111] pt-6">
            <h4 className="text-[0.8rem] text-[#666666] uppercase tracking-wider font-bold mb-3">Select Available Unit Configuration</h4>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variantOption) => (
                <button
                  key={variantOption}
                  onClick={() => setSelectedVariant(variantOption)}
                  className={`px-4 py-2 rounded-xl text-[0.85rem] font-bold transition-all border ${
                    selectedVariant === variantOption 
                      ? 'bg-white text-black border-white' 
                      : 'bg-[#0a0a0a] text-[#888888] border-[#222222] hover:text-white'
                  }`}
                >
                  {variantOption}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Description Space */}
        <div className="mb-8 border-t border-[#111111] pt-6">
          <h4 className="text-[0.8rem] text-[#666666] uppercase tracking-wider font-bold mb-2">Item Specifications</h4>
          <p className="text-[#888888] text-[0.9rem] leading-relaxed font-medium">
            {product.description || "Fresh production lifecycle delivery item catalogued with structural high quality monitoring straight from authorized regional storage distribution warehouses directly to target operational deployment centers."}
          </p>
        </div>

      </div>

      {/* Persistent Execution Footer Panel */}
      <div className="w-full bg-[#050505] border-t border-[#111111] px-6 py-5 fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md">
        
        {/* Dynamic Context Notice Handler */}
        {actionFeedback && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="w-full mb-3 text-center text-[0.8rem] font-bold py-2 px-4 rounded-lg bg-[#111111] text-[#00ff88] border border-[#222222]"
          >
            {actionFeedback}
          </motion.div>
        )}

        <div className="w-full flex items-center gap-4">
          
          {/* Functional Scale Unit Counter */}
          <div className="bg-[#111111] border border-[#222222] rounded-xl flex items-center h-14 px-2">
            <button 
              onClick={handleDecrement}
              className="w-10 h-10 flex items-center justify-center text-[#888888] hover:text-white font-bold text-[1.2rem] transition-colors"
            >
              -
            </button>
            <span className="w-8 text-center font-black text-[1rem] text-white">
              {quantity}
            </span>
            <button 
              onClick={handleIncrement}
              className="w-10 h-10 flex items-center justify-center text-[#888888] hover:text-white font-bold text-[1.2rem] transition-colors"
            >
              +
            </button>
          </div>

          {/* Core Master Trigger Action Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="flex-1 bg-white text-black h-14 rounded-xl font-black text-[0.95rem] tracking-tight hover:bg-[#eeeeee] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {isAdding ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Add to Cart"
            )}
          </button>

        </div>
      </div>

    </div>
  );
}