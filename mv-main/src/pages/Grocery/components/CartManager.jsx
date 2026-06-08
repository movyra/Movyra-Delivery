import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

/**
 * ============================================================================
 * COMPONENT: GROCERY CART MANAGER (mv-main)
 * Purpose: Tri-state dashboard for active carts, live orders, and history.
 * Behavior: Reads/Writes to user_carts. Reads from orders using composite indexes.
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

export default function CartManager({ onNavigateToCheckout, onSelectOrder }) {
  const [activeTab, setActiveTab] = useState('My Cart'); // 'My Cart', 'Current Order', 'Previous Order'
  const [cartItems, setCartItems] = useState([]);
  const [currentOrders, setCurrentOrders] = useState([]);
  const [previousOrders, setPreviousOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingMutation, setProcessingMutation] = useState(false);

  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Master Data Hydration Engine
  useEffect(() => {
    async function hydrateCartAndOrders() {
      if (!currentUser) return;
      try {
        setLoading(true);

        // 1. Fetch Live Cart State
        if (activeTab === 'My Cart') {
          const cartRef = doc(db, 'user_carts', currentUser.uid);
          const cartSnap = await getDoc(cartRef);
          if (cartSnap.exists()) {
            setCartItems(cartSnap.data().items || []);
          } else {
            setCartItems([]);
          }
        } 
        // 2. Fetch Order History Streams
        else {
          const ordersRef = collection(db, 'orders');
          const q = query(
            ordersRef, 
            where('userId', '==', currentUser.uid),
            orderBy('timestamp', 'desc')
          );
          
          const orderSnap = await getDocs(q);
          const activeList = [];
          const historyList = [];

          orderSnap.docs.forEach(docSnap => {
            const data = docSnap.data();
            const orderPayload = { id: docSnap.id, ...data };
            // Partition logic based on operational fulfillment statuses
            if (['Pending', 'On Progress', 'Out for Delivery'].includes(data.status)) {
              activeList.push(orderPayload);
            } else {
              historyList.push(orderPayload);
            }
          });

          setCurrentOrders(activeList);
          setPreviousOrders(historyList);
        }
      } catch (error) {
        console.error("Firestore retrieval exception on CartManager module:", error);
      } finally {
        setLoading(false);
      }
    }

    hydrateCartAndOrders();
  }, [activeTab, currentUser]);

  // Real-Time Cart Mutation Handlers
  const handleQuantityChange = async (productId, weight, delta) => {
    if (!currentUser || processingMutation) return;
    setProcessingMutation(true);

    try {
      const cartRef = doc(db, 'user_carts', currentUser.uid);
      let updatedItems = [...cartItems];
      const targetIndex = updatedItems.findIndex(item => item.productId === productId && item.weight === weight);

      if (targetIndex > -1) {
        const newQuantity = updatedItems[targetIndex].quantity + delta;
        if (newQuantity <= 0) {
          updatedItems.splice(targetIndex, 1); // Remove item completely
        } else {
          updatedItems[targetIndex].quantity = newQuantity;
        }

        await updateDoc(cartRef, {
          items: updatedItems,
          updatedAt: new Date().toISOString()
        });
        
        setCartItems(updatedItems);
      }
    } catch (error) {
      console.error("Failed to mutate cart payload:", error);
    } finally {
      setProcessingMutation(false);
    }
  };

  // Derive Cart Financial Totals
  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cartItems]);

  const fadeVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  return (
    <div className="w-full min-h-screen bg-[#000000] text-white font-sans flex flex-col pb-32">
      
      {/* Top Header Navigation */}
      <div className="w-full bg-[#000000]/90 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
        <h1 className="text-[1.4rem] font-black tracking-tight text-white mb-4">Cart</h1>
        
        {/* Tri-State Tab Selector */}
        <div className="flex items-center gap-6 border-b border-[#222222]">
          {['My Cart', 'Current Order', 'Previous Order'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 font-bold text-[0.85rem] transition-colors relative ${
                activeTab === tab ? 'text-white' : 'text-[#666666] hover:text-[#aaaaaa]'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="cartTabIndicator" className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full px-6 pt-6 flex-1">
        <AnimatePresence mode="wait">
          
          {/* LOADER */}
          {loading ? (
            <motion.div key="loader" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="w-full py-20 flex justify-center">
              <div className="w-8 h-8 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
            </motion.div>
          ) : 
          
          /* VIEW 1: MY CART */
          activeTab === 'My Cart' ? (
            <motion.div key="cart" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col">
              {cartItems.length > 0 ? (
                <>
                  <div className="w-full bg-[#050505] border border-[#1c1c1c] rounded-2xl p-4 mb-6">
                    <div className="flex items-center gap-3 border-b border-[#1c1c1c] pb-3 mb-4">
                      <div className="w-5 h-5 bg-white flex items-center justify-center rounded-[4px]">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <span className="font-bold text-[0.95rem]">Selected Items</span>
                    </div>

                    <div className="flex flex-col gap-6">
                      {cartItems.map((item, idx) => (
                        <div key={`${item.productId}-${idx}`} className="flex gap-4">
                          <div className="w-20 h-20 bg-[#111111] rounded-xl flex items-center justify-center shrink-0">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#444444" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                          </div>
                          <div className="flex flex-col flex-1 py-1">
                            <h4 className="font-bold text-[0.95rem] tracking-tight leading-tight mb-1">{item.name}</h4>
                            <span className="text-[#666666] text-[0.75rem] font-bold mb-auto">{item.weight}</span>
                            <div className="flex items-center justify-between mt-2">
                              <span className="font-black text-[1.05rem] text-white">{formatINR(item.price)}</span>
                              
                              <div className="flex items-center gap-3 bg-[#111111] rounded-full px-2 py-1 border border-[#222222]">
                                <button onClick={() => handleQuantityChange(item.productId, item.weight, -1)} disabled={processingMutation} className="w-6 h-6 rounded-full bg-[#222222] flex items-center justify-center text-white font-bold hover:bg-[#333333] disabled:opacity-50">
                                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                </button>
                                <span className="font-black text-[0.85rem] w-3 text-center text-white">{item.quantity}</span>
                                <button onClick={() => handleQuantityChange(item.productId, item.weight, 1)} disabled={processingMutation} className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center font-bold hover:bg-[#eeeeee] disabled:opacity-50">
                                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"></line><line x1="12" y1="5" x2="12" y2="19"></line></svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Checkout Action Button */}
                  <button 
                    onClick={onNavigateToCheckout}
                    className="w-full bg-white text-black font-black text-[1rem] tracking-tight py-4 rounded-xl hover:bg-[#eeeeee] transition-colors flex items-center justify-center gap-2 mt-4"
                  >
                    Proceed to Checkout
                    <span className="bg-black text-white px-2 py-0.5 rounded-md text-[0.8rem] ml-2">{formatINR(cartTotal)}</span>
                  </button>
                </>
              ) : (
                <div className="w-full p-8 text-center border border-[#1c1c1c] rounded-2xl flex flex-col items-center">
                   <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#222222" strokeWidth="1" className="mb-4"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                   <span className="text-[#666666] font-bold text-[0.9rem]">Your selection matrix is currently empty.</span>
                </div>
              )}
            </motion.div>
          ) :

          /* VIEW 2: CURRENT ORDER */
          activeTab === 'Current Order' ? (
            <motion.div key="current" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-4">
              {currentOrders.length > 0 ? (
                currentOrders.map((order) => (
                  <div key={order.id} className="w-full border-b border-[#1c1c1c] pb-6 mb-2">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex gap-4">
                        <div className="w-14 h-14 bg-[#111111] rounded-xl flex items-center justify-center border border-[#222222]">
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#666666" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                        </div>
                        <div className="flex flex-col">
                          <h4 className="font-bold text-[1rem] tracking-tight">{order.storeName || 'Movyra Fulfillment'}</h4>
                          <span className="text-[#666666] text-[0.75rem] font-bold mt-0.5">#{order.id.slice(0, 8).toUpperCase()}</span>
                          <span className="text-[#666666] text-[0.7rem] mt-0.5">{new Date(order.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="border border-[#eab308]/30 bg-[#eab308]/10 text-[#eab308] px-3 py-1 rounded-full text-[0.7rem] font-bold tracking-wide flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-[#eab308]"></div>
                        {order.status}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="font-black text-[0.9rem]">{formatINR(order.total)} <span className="text-[#666666] font-medium text-[0.8rem] ml-1">• {order.items?.length || 0} Items</span></span>
                      <button onClick={() => onSelectOrder(order.id)} className="text-[#666666] font-bold text-[0.8rem] hover:text-white transition-colors flex items-center gap-1">
                        Track Order <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full p-8 text-center text-[#444444] border border-[#1c1c1c] rounded-2xl text-[0.85rem] font-bold">
                  No active fulfillment streams detected in your current pipeline.
                </div>
              )}
            </motion.div>
          ) :

          /* VIEW 3: PREVIOUS ORDER */
          (
            <motion.div key="previous" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col gap-4">
              {previousOrders.length > 0 ? (
                previousOrders.map((order) => {
                  const isCanceled = order.status === 'Canceled';
                  return (
                    <div key={order.id} className="w-full border-b border-[#1c1c1c] pb-6 mb-2">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex gap-4">
                          <div className="w-14 h-14 bg-[#111111] rounded-xl flex items-center justify-center border border-[#222222]">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#666666" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                          </div>
                          <div className="flex flex-col">
                            <h4 className="font-bold text-[1rem] tracking-tight">{order.storeName || 'Movyra Fulfillment'}</h4>
                            <span className="text-[#666666] text-[0.75rem] font-bold mt-0.5">#{order.id.slice(0, 8).toUpperCase()}</span>
                            <span className="text-[#666666] text-[0.7rem] mt-0.5">{new Date(order.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className={`border px-3 py-1 rounded-full text-[0.7rem] font-bold tracking-wide flex items-center gap-1.5 ${isCanceled ? 'border-[#ff4444]/30 bg-[#ff4444]/10 text-[#ff4444]' : 'border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88]'}`}>
                          <div className={`w-1 h-1 rounded-full ${isCanceled ? 'bg-[#ff4444]' : 'bg-[#00ff88]'}`}></div>
                          {order.status}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="font-black text-[0.9rem]">{formatINR(order.total)} <span className="text-[#666666] font-medium text-[0.8rem] ml-1">• {order.items?.length || 0} Items</span></span>
                        <button onClick={() => onSelectOrder(order.id)} className="text-[#666666] font-bold text-[0.8rem] hover:text-white transition-colors flex items-center gap-1">
                          View Detail <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="w-full p-8 text-center text-[#444444] border border-[#1c1c1c] rounded-2xl text-[0.85rem] font-bold">
                  No historical fulfillment records recovered for this identity.
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}