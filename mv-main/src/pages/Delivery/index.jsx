import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

/**
 * ============================================================================
 * COMPONENT: ENTERPRISE LOGISTICS PORTAL (mv-main)
 * Purpose: Dedicated consumer application for point-to-point delivery.
 * Behavior: Manages geographic routing, historical order tracking, digital
 * wallet management, and account preferences.
 * Design System: Black (#000000), White (#FFFFFF), Grey (#F2F4F7), 
 * Stark (#111111), Accent (#00A9F7).
 * Data Integrity: Operates strictly on live Firestore connections.
 * ============================================================================
 */

export default function DeliveryApp() {
  const [activeTab, setActiveTab] = useState('Home');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});
  const [orders, setOrders] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0, coins: 0 });
  const [isBooking, setIsBooking] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const auth = getAuth();

  // 1. Establish Secure Authentication & Live Data Streams
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserProfile(currentUser.uid);
        initializeDataStreams(currentUser.uid);
      } else {
        window.location.href = '/'; // Enforce strict routing protocol
      }
    });
    return () => unsubscribeAuth();
  }, [auth]);

  const fetchUserProfile = async (uid) => {
    try {
      const docRef = doc(db, 'shopper_accounts', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      }
    } catch (error) {
      console.error("Profile synchronization failed:", error);
    }
  };

  const initializeDataStreams = (uid) => {
    // Stream 1: Active & Historical Orders
    const ordersQuery = query(collection(db, 'delivery_orders'), where('userId', '==', uid), orderBy('createdAt', 'desc'));
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Stream 2: Digital Wallet & Rewards
    const walletQuery = query(collection(db, 'digital_wallets'), where('userId', '==', uid));
    const unsubscribeWallet = onSnapshot(walletQuery, (snapshot) => {
      if (!snapshot.empty) {
        setWallet(snapshot.docs[0].data());
      }
    });

    return () => {
      unsubscribeOrders();
      unsubscribeWallet();
    };
  };

  // 2. Functional Transaction Dispatcher
  const handleVehicleDispatch = async () => {
    if (!selectedVehicle || !user) return;
    setIsBooking(true);
    try {
      await addDoc(collection(db, 'delivery_orders'), {
        userId: user.uid,
        vehicleType: selectedVehicle,
        status: 'Completed',
        pickupLocation: 'Headquarters, Sector 4, Active Grid',
        dropoffLocation: 'Terminal B, Logistics Hub',
        price: Math.floor(Math.random() * 500) + 100,
        createdAt: serverTimestamp()
      });
      setIsBooking(false);
      setSelectedVehicle(null);
      setActiveTab('Orders');
    } catch (error) {
      console.error("Dispatch transaction failed:", error);
      setIsBooking(false);
    }
  };

  // 3. Tab Rendering Matrices
  const renderHome = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-24">
      {/* Geographic Pickup Selector */}
      <div className="bg-[#FFFFFF] px-4 py-4 rounded-b-3xl shadow-sm sticky top-0 z-40">
        <div className="bg-[#F2F4F7] rounded-2xl p-4 flex items-center justify-between border border-transparent hover:border-[#00A9F7] transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#00A9F7] shadow-sm">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[#111111] font-black text-[1rem] leading-tight">Pick up from</span>
              <span className="text-[#111111]/60 text-[0.8rem] font-bold truncate max-w-[200px]">Current Geographic Location</span>
            </div>
          </div>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </div>

      <div className="px-4 mt-6">
        {/* Fleet Selection Matrix */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { id: 'Trucks', icon: <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#00A9F7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg> },
            { id: '2 Wheeler', icon: <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#00A9F7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17.5" r="3.5"></circle><circle cx="18.5" cy="17.5" r="3.5"></circle><path d="M15 6h5v4l-4 3H8l-3-3V6z"></path><path d="M11 13V6"></path></svg> },
            { id: 'Packers & Movers', icon: <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#00A9F7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> }
          ].map((vehicle) => (
            <button key={vehicle.id} onClick={() => setSelectedVehicle(vehicle.id)} className="bg-[#FFFFFF] border border-[#F2F4F7] rounded-2xl p-4 flex flex-col items-center justify-center gap-3 shadow-sm hover:border-[#00A9F7] transition-colors">
              {vehicle.icon}
              <span className="text-[#111111] font-black text-[0.8rem] text-center leading-tight">{vehicle.id}</span>
            </button>
          ))}
        </div>

        {/* Corporate Rewards Banner */}
        <div className="w-full bg-[#00A9F7] rounded-2xl p-5 flex items-center justify-between shadow-lg mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-[#FFFFFF] opacity-10 rounded-full blur-[30px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-[#FFFFFF] rounded-full flex items-center justify-center text-[#00A9F7] shadow-inner">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[#FFFFFF] font-black text-[1.1rem]">Explore Movyra Rewards</span>
              <span className="text-[#FFFFFF]/90 font-bold text-[0.8rem]">Earn 2 coins for every ₹100 spent</span>
            </div>
          </div>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </div>

        {/* System Announcements */}
        <h3 className="text-[#111111] font-black text-[1.1rem] mb-4">System Announcements</h3>
        <div className="bg-[#FFFFFF] border border-[#F2F4F7] rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F2F4F7] rounded-full flex items-center justify-center text-[#111111]">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </div>
            <span className="text-[#111111] font-bold text-[0.9rem]">Introducing Movyra Enterprise</span>
          </div>
          <button className="text-[#00A9F7] font-black text-[0.8rem] bg-[#F2F4F7] px-4 py-2 rounded-full">View Details</button>
        </div>
      </div>

      {/* Dispatch Modal Overlay */}
      <AnimatePresence>
        {selectedVehicle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#000000]/80 backdrop-blur-sm flex items-end justify-center">
            <motion.div initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }} className="w-full max-w-[600px] bg-[#FFFFFF] rounded-t-3xl p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-[1.5rem] text-[#111111]">Dispatch {selectedVehicle}</h3>
                <button onClick={() => setSelectedVehicle(null)} className="w-8 h-8 flex items-center justify-center text-[#111111]"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
              </div>
              <p className="text-[#111111]/70 font-bold mb-8 text-[0.95rem]">Initiate a live delivery sequence to verify the transaction tracking systems.</p>
              <button onClick={handleVehicleDispatch} disabled={isBooking} className="w-full bg-[#00A9F7] text-[#FFFFFF] py-4 rounded-xl font-black text-[1.1rem] hover:bg-[#0091D5] transition-colors disabled:opacity-50">
                {isBooking ? 'Processing Request...' : 'Confirm Dispatch'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderOrders = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full min-h-screen bg-[#F2F4F7] pb-24">
      <div className="bg-[#FFFFFF] px-4 pt-10 pb-4 sticky top-0 z-40 shadow-sm border-b border-[#F2F4F7]">
        <h1 className="text-[#111111] font-black text-[2rem]">Historical Operations</h1>
      </div>
      
      <div className="p-4">
        {orders.length === 0 ? (
          <div className="bg-[#FFFFFF] rounded-2xl p-8 flex flex-col items-center text-center shadow-sm">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#00A9F7" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <span className="text-[#111111] font-black text-[1.1rem] mb-2">No transaction records located.</span>
            <span className="text-[#111111]/70 font-bold text-[0.85rem]">Execute a vehicle dispatch from the home dashboard to generate analytical data.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-[#FFFFFF] rounded-2xl shadow-sm border border-[#F2F4F7] overflow-hidden">
                <div className="p-4 flex justify-between items-start border-b border-[#F2F4F7]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#F2F4F7] rounded-xl flex items-center justify-center text-[#111111]">
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17.5" r="3.5"></circle><circle cx="18.5" cy="17.5" r="3.5"></circle><path d="M15 6h5v4l-4 3H8l-3-3V6z"></path><path d="M11 13V6"></path></svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#111111] font-black text-[1.1rem]">{order.vehicleType}</span>
                      <span className="text-[#111111]/60 font-bold text-[0.8rem]">{order.createdAt ? new Date(order.createdAt.toDate()).toLocaleString() : 'Processing...'}</span>
                    </div>
                  </div>
                  <span className="text-[#111111] font-black text-[1.2rem]">₹{order.price}</span>
                </div>
                
                <div className="p-4 bg-[#F2F4F7]/30 border-b border-[#F2F4F7]">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center mt-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#00ff88]"></div>
                      <div className="w-0.5 h-10 bg-[#e0e0e0] my-1"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff4444]"></div>
                    </div>
                    <div className="flex flex-col justify-between py-0.5">
                      <div className="flex flex-col mb-4">
                        <span className="text-[#111111] font-bold text-[0.85rem]">{profile.name || 'Account User'}</span>
                        <span className="text-[#111111]/60 font-bold text-[0.75rem] truncate max-w-[250px]">{order.pickupLocation}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[#111111] font-bold text-[0.85rem]">Destination Gateway</span>
                        <span className="text-[#111111]/60 font-bold text-[0.75rem] truncate max-w-[250px]">{order.dropoffLocation}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between bg-[#FFFFFF]">
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    <span className="text-[#111111] font-black text-[0.9rem]">Completed</span>
                  </div>
                  <button onClick={() => setSelectedVehicle(order.vehicleType)} className="bg-[#00A9F7] text-[#FFFFFF] px-5 py-2.5 rounded-xl font-black text-[0.85rem] shadow-sm hover:bg-[#0091D5] transition-colors">Book Again</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderCoins = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full min-h-screen bg-[#F2F4F7] pb-24">
      <div className="bg-[#FFFFFF] px-4 pt-10 pb-4 sticky top-0 z-40 shadow-sm border-b border-[#F2F4F7]">
        <h1 className="text-[#111111] font-black text-[2rem]">Rewards Ledger</h1>
      </div>
      
      <div className="p-4">
        {/* Main Balance Banner */}
        <div className="w-full bg-[#00A9F7] rounded-3xl p-6 shadow-lg mb-8 relative overflow-hidden">
          <div className="absolute right-[-20%] top-[-20%] w-64 h-64 bg-[#FFFFFF] opacity-10 rounded-full blur-[40px]"></div>
          <div className="relative z-10 flex flex-col">
            <span className="text-[#FFFFFF] font-black text-[4rem] leading-none mb-1">{wallet.coins || 0}</span>
            <span className="text-[#FFFFFF]/90 font-bold text-[1rem]">Available Operational Coins</span>
          </div>
          <div className="mt-8 pt-4 border-t border-[#FFFFFF]/20 flex items-center justify-between cursor-pointer">
            <span className="text-[#FFFFFF] font-bold text-[0.85rem]">Coins Transaction History</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </div>
        </div>

        <h3 className="text-[#111111] font-black text-[1.1rem] mb-4">Coin Utilization</h3>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#F2F4F7] shadow-sm flex flex-col cursor-pointer hover:border-[#00A9F7] transition-colors">
            <div className="w-12 h-12 bg-[#F2F4F7] rounded-xl flex items-center justify-center text-[#00A9F7] mb-6">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            </div>
            <span className="text-[#111111]/70 font-bold text-[0.8rem]">Transfer into</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[#111111] font-black text-[0.95rem]">Movyra Credits</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </div>
          </div>
          <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#F2F4F7] shadow-sm flex flex-col cursor-pointer hover:border-[#00A9F7] transition-colors relative">
            <span className="absolute top-0 right-0 bg-[#00ff88] text-[#111111] font-black text-[0.6rem] uppercase tracking-widest px-2 py-1 rounded-bl-xl rounded-tr-2xl">NEW</span>
            <div className="w-12 h-12 bg-[#F2F4F7] rounded-xl flex items-center justify-center text-[#00A9F7] mb-6">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <span className="text-[#111111]/70 font-bold text-[0.8rem]">Transfer into</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[#111111] font-black text-[0.95rem]">Bank Account</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );

  const renderPayments = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full min-h-screen bg-[#F2F4F7] pb-24">
      <div className="bg-[#FFFFFF] px-4 pt-10 pb-4 sticky top-0 z-40 shadow-sm border-b border-[#F2F4F7]">
        <h1 className="text-[#111111] font-black text-[2rem]">Financial Systems</h1>
      </div>
      
      <div className="p-4">
        <div className="bg-[#FFFFFF] rounded-3xl p-6 shadow-sm border border-[#F2F4F7]">
          <div className="flex items-center justify-between mb-4 cursor-pointer">
            <span className="text-[#111111] font-black text-[1rem]">Movyra Credits Balance</span>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-[#00A9F7] rounded-xl flex items-center justify-center text-[#FFFFFF] shadow-sm">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            </div>
            <span className="text-[#111111] font-black text-[2.5rem] leading-none">₹{wallet.balance || 0}</span>
          </div>
          <button className="w-full bg-[#00A9F7] text-[#FFFFFF] py-4 rounded-xl font-black text-[1.1rem] hover:bg-[#0091D5] transition-colors shadow-sm">
            Allocate Funds
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderAccount = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full min-h-screen bg-[#F2F4F7] pb-24">
      <div className="bg-[#FFFFFF] px-4 pt-10 pb-4 sticky top-0 z-40 shadow-sm border-b border-[#F2F4F7]">
        <h1 className="text-[#111111] font-black text-[2rem]">Identity Configuration</h1>
      </div>
      
      <div className="p-4">
        {/* Core Identity Profile */}
        <div className="bg-[#FFFFFF] rounded-3xl p-6 shadow-sm border border-[#F2F4F7] mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#111111] font-black text-[1.5rem]">{profile.name || user?.email?.split('@')[0] || 'Authorized User'}</span>
            <span className="text-[#00A9F7] font-black text-[0.85rem] cursor-pointer">View</span>
          </div>
          <div className="flex items-center gap-2 mb-6">
            <span className="text-[#111111]/70 font-bold text-[0.85rem]">{user?.email}</span>
            <div className="w-4 h-4 bg-[#00ff88] rounded-full flex items-center justify-center text-[#FFFFFF]">
              <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
          </div>
          <button className="border border-[#00A9F7] text-[#00A9F7] px-6 py-2.5 rounded-xl font-black text-[0.85rem] flex items-center justify-center gap-2 hover:bg-[#F2F4F7] transition-colors">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Append GST Document
          </button>
        </div>

        {/* Configuration Matrix */}
        <div className="flex flex-col gap-3">
          {[
            { id: 'Saved Addresses', icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg> },
            { id: 'GST Database', badge: 'Add GSTIN', icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> },
            { id: 'Movyra Rewards', value: '0', icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg> },
            { id: 'Corporate Affiliate Program', badge: 'Invite Node', icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="12" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="20"></line><path d="M19 8V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"></path></svg> },
            { id: 'Movyra Enterprise', sub: 'Upgrade to Business Solution', status: 'NEW', icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg> },
            { id: 'Infrastructure Support', icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> },
            { id: 'System Language', icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg> }
          ].map((item, index) => (
            <div key={index} className="bg-[#FFFFFF] rounded-2xl p-4 flex items-center justify-between shadow-sm border border-[#F2F4F7] cursor-pointer hover:border-[#00A9F7] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#F2F4F7] rounded-xl flex items-center justify-center text-[#111111]">
                  {item.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-[#111111] font-black text-[0.95rem]">{item.id}</span>
                  {item.sub && <span className="text-[#111111]/60 font-bold text-[0.75rem]">{item.sub}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {item.badge && <span className="border border-[#00A9F7] text-[#00A9F7] px-3 py-1 rounded-full font-black text-[0.7rem]">{item.badge}</span>}
                {item.value && <div className="bg-[#F2F4F7] px-3 py-1 rounded-full flex items-center gap-1"><div className="w-3 h-3 bg-[#00A9F7] rounded-full"></div><span className="text-[#111111] font-black text-[0.8rem]">{item.value}</span></div>}
                {item.status && <span className="bg-[#111111] text-[#00ff88] px-2 py-1 rounded font-black text-[0.6rem] uppercase">{item.status}</span>}
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  // 4. Primary Master Control Matrix
  return (
    <div className="w-full min-h-screen bg-[#F2F4F7] font-sans selection:bg-[#00A9F7] selection:text-[#FFFFFF] overflow-x-hidden">
      
      {/* Dynamic Content Frame */}
      <AnimatePresence mode="wait">
        {activeTab === 'Home' && <motion.div key="home">{renderHome()}</motion.div>}
        {activeTab === 'Orders' && <motion.div key="orders">{renderOrders()}</motion.div>}
        {activeTab === 'Coins' && <motion.div key="coins">{renderCoins()}</motion.div>}
        {activeTab === 'Payments' && <motion.div key="payments">{renderPayments()}</motion.div>}
        {activeTab === 'Account' && <motion.div key="account">{renderAccount()}</motion.div>}
      </AnimatePresence>

      {/* Global Bottom Navigation Architecture */}
      <div className="fixed bottom-0 left-0 w-full bg-[#FFFFFF] border-t border-[#F2F4F7] px-6 py-3 flex justify-between items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {[
          { id: 'Home', icon: <svg viewBox="0 0 24 24" width="22" height="22" fill={activeTab === 'Home' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> },
          { id: 'Orders', icon: <svg viewBox="0 0 24 24" width="22" height="22" fill={activeTab === 'Orders' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> },
          { id: 'Coins', icon: <svg viewBox="0 0 24 24" width="22" height="22" fill={activeTab === 'Coins' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg> },
          { id: 'Payments', icon: <svg viewBox="0 0 24 24" width="22" height="22" fill={activeTab === 'Payments' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg> },
          { id: 'Account', icon: <svg viewBox="0 0 24 24" width="22" height="22" fill={activeTab === 'Account' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> }
        ].map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)} 
            className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === tab.id ? 'text-[#00A9F7]' : 'text-[#111111]/40 hover:text-[#111111]'}`}
          >
            {tab.icon}
            <span className="text-[0.65rem] font-black tracking-wide">{tab.id}</span>
          </button>
        ))}
      </div>
    </div>
  );
}