import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

/**
 * ============================================================================
 * COMPONENT: VENDOR ORDER FULFILLMENT BOARD (mv-main)
 * Purpose: Live operational dashboard for vendors to manage incoming purchases.
 * Behavior: Reads real-time order documents tied to the vendor's storeId.
 * Allows status mutations that sync directly to the customer's tracking UI.
 * Structural Constraint: Strict zero emoji vector configuration.
 * Uses clear business language without technical jargon.
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

const formatOrderTime = (timestamp) => {
  if (!timestamp) return 'Processing...';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short'
  }).format(date);
};

export default function VendorOrderBoard({ role, storeId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('pending'); // 'pending', 'preparing', 'dispatched', 'completed'
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (!role || role === 'unauthorized') return;
    if (role === 'vendor' && !storeId) return;

    setLoading(true);

    let q;
    const ordersRef = collection(db, 'orders');

    if (role === 'admin') {
      // System Administrators monitor global order flow
      q = query(ordersRef, orderBy('timestamp', 'desc'));
    } else {
      // Store Managers only monitor their specific operational queue
      q = query(ordersRef, where('storeId', '==', storeId), orderBy('timestamp', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setOrders(fetchedOrders);
      setLoading(false);
    }, (error) => {
      console.error("Live order synchronization failed:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [role, storeId]);

  const updateOrderStatus = async (orderId, currentStatus, newStatus) => {
    setProcessingId(orderId);
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        lastUpdatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Status mutation failed:", error);
      alert("Failed to update order status. Please verify your connection.");
    } finally {
      setProcessingId(null);
    }
  };

  const cancelOrder = async (orderId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this order? The customer will be notified and refunded.");
    if (!confirmCancel) return;

    setProcessingId(orderId);
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'cancelled',
        lastUpdatedAt: serverTimestamp(),
        cancellationReason: 'Cancelled by Store Manager'
      });
    } catch (error) {
      console.error("Cancellation failed:", error);
      alert("Failed to cancel order.");
    } finally {
      setProcessingId(null);
    }
  };

  // Filter orders based on active tab selection
  const filteredOrders = orders.filter(order => {
    const status = order.status?.toLowerCase() || 'pending';
    if (activeFilter === 'completed') {
      return status === 'completed' || status === 'delivered' || status === 'cancelled';
    }
    return status === activeFilter;
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'text-[#ffcc00] border-[#ffcc00]/30 bg-[#ffcc00]/10';
      case 'preparing': return 'text-[#00ccff] border-[#00ccff]/30 bg-[#00ccff]/10';
      case 'dispatched': return 'text-[#a366ff] border-[#a366ff]/30 bg-[#a366ff]/10';
      case 'delivered':
      case 'completed': return 'text-[#00ff88] border-[#00ff88]/30 bg-[#00ff88]/10';
      case 'cancelled': return 'text-[#ff4444] border-[#ff4444]/30 bg-[#ff4444]/10';
      default: return 'text-[#888888] border-[#333333] bg-[#111111]';
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-12 bg-[#000000]">
        <div className="w-8 h-8 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin mb-4"></div>
        <span className="text-[#666666] text-[0.8rem] uppercase tracking-widest font-bold">Synchronizing Operations Data</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-6 md:p-10 relative bg-[#000000] overflow-y-auto">
      
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 shrink-0">
        <div>
          <h1 className="text-[2rem] font-black tracking-tight leading-none mb-2 text-white">Order Fulfillment</h1>
          <p className="text-[#888888] text-[0.95rem]">Monitor and process live customer purchases in real-time.</p>
        </div>

        {/* Operational Filter Tabs */}
        <div className="flex bg-[#111111] border border-[#222222] rounded-xl p-1 shrink-0 overflow-x-auto">
          {['pending', 'preparing', 'dispatched', 'completed'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setActiveFilter(filterType)}
              className={`px-6 py-2.5 rounded-lg text-[0.85rem] font-bold capitalize whitespace-nowrap transition-colors ${
                activeFilter === filterType 
                  ? 'bg-[#222222] text-white shadow-sm' 
                  : 'text-[#666666] hover:text-white'
              }`}
            >
              {filterType === 'pending' ? 'Awaiting Confirmation' : 
               filterType === 'preparing' ? 'In Progress' :
               filterType === 'dispatched' ? 'Out for Delivery' : 'History'}
              
              {/* Notification Badge for Pending */}
              {filterType === 'pending' && orders.filter(o => (o.status?.toLowerCase() || 'pending') === 'pending').length > 0 && (
                <span className="ml-2 bg-[#ff4444] text-white px-2 py-0.5 rounded-full text-[0.65rem]">
                  {orders.filter(o => (o.status?.toLowerCase() || 'pending') === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      <div className="flex-1">
        {filteredOrders.length === 0 ? (
          <div className="w-full h-48 border border-dashed border-[#222222] rounded-2xl flex flex-col items-center justify-center text-[#666666]">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            <span className="text-[0.95rem] font-bold">No active records found.</span>
            <span className="text-[0.8rem] mt-1">Orders matching this status will appear here automatically.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-12">
            <AnimatePresence>
              {filteredOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#050505] border border-[#1c1c1c] rounded-2xl p-6 flex flex-col shadow-[0_0_50px_rgba(255,255,255,0.02)]"
                >
                  
                  {/* Order Card Header */}
                  <div className="flex items-start justify-between border-b border-[#1c1c1c] pb-4 mb-4">
                    <div>
                      <span className="text-[#888888] text-[0.7rem] uppercase tracking-widest font-bold font-mono block mb-1">
                        Order ID: {order.id.slice(0, 8)}
                      </span>
                      <h3 className="text-[1.1rem] font-black text-white truncate max-w-[200px]">
                        {order.customerName || 'Guest Customer'}
                      </h3>
                      <span className="text-[#666666] text-[0.8rem] block mt-1">
                        {formatOrderTime(order.timestamp)}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[1.2rem] font-black text-[#00ff88]">
                        {formatINR(order.totalAmount || 0)}
                      </span>
                      <span className={`mt-2 px-3 py-1 border rounded-sm text-[0.65rem] uppercase tracking-widest font-bold ${getStatusColor(order.status)}`}>
                        {order.status || 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="flex-1 mb-6 bg-[#111111] border border-[#222222] rounded-xl p-4">
                    <h4 className="text-[0.7rem] uppercase tracking-widest text-[#666666] font-bold mb-3">Purchase Manifest</h4>
                    <ul className="flex flex-col gap-3">
                      {(order.items || []).map((item, index) => (
                        <li key={index} className="flex items-start justify-between text-[0.9rem]">
                          <div className="flex gap-3 text-white font-medium">
                            <span className="text-[#888888] font-bold">{item.quantity}x</span>
                            <span>{item.name}</span>
                          </div>
                          <span className="text-[#666666]">{formatINR((item.price || 0) * (item.quantity || 1))}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Controls */}
                  <div className="pt-4 border-t border-[#1c1c1c] flex gap-3">
                    
                    {/* Action buttons map based on current status */}
                    {(order.status?.toLowerCase() === 'pending' || !order.status) && (
                      <>
                        <button 
                          onClick={() => cancelOrder(order.id)}
                          disabled={processingId === order.id}
                          className="flex-1 bg-transparent border border-[#333333] text-white py-3 rounded-xl font-bold text-[0.9rem] hover:bg-[#111111] transition-colors disabled:opacity-50"
                        >
                          Decline
                        </button>
                        <button 
                          onClick={() => updateOrderStatus(order.id, order.status, 'preparing')}
                          disabled={processingId === order.id}
                          className="flex-[2] bg-white text-black py-3 rounded-xl font-black text-[0.95rem] hover:bg-[#e0e0e0] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {processingId === order.id ? 'Processing...' : 'Accept & Begin Prep'}
                        </button>
                      </>
                    )}

                    {order.status?.toLowerCase() === 'preparing' && (
                      <button 
                        onClick={() => updateOrderStatus(order.id, order.status, 'dispatched')}
                        disabled={processingId === order.id}
                        className="w-full bg-[#00ff88] text-black py-3 rounded-xl font-black text-[0.95rem] hover:bg-[#00cc6a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {processingId === order.id ? 'Processing...' : 'Mark as Out for Delivery'}
                      </button>
                    )}

                    {order.status?.toLowerCase() === 'dispatched' && (
                      <button 
                        onClick={() => updateOrderStatus(order.id, order.status, 'completed')}
                        disabled={processingId === order.id}
                        className="w-full bg-transparent border border-[#00ff88] text-[#00ff88] py-3 rounded-xl font-black text-[0.95rem] hover:bg-[#00ff88]/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {processingId === order.id ? 'Processing...' : 'Confirm Final Delivery'}
                      </button>
                    )}

                    {(order.status?.toLowerCase() === 'completed' || order.status?.toLowerCase() === 'delivered' || order.status?.toLowerCase() === 'cancelled') && (
                      <div className="w-full text-center py-3 text-[#666666] text-[0.85rem] font-bold uppercase tracking-widest bg-[#111111] rounded-xl border border-[#222222]">
                        Lifecycle Complete
                      </div>
                    )}

                  </div>

                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

    </div>
  );
}