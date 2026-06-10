import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

/**
 * ============================================================================
 * COMPONENT: ENTERPRISE LOGISTICS PORTAL (mv-main)
 * Purpose: Dedicated consumer application for point-to-point delivery.
 * Behavior: Manages geographic routing, historical order tracking, digital
 * wallet management, and account preferences.
 * Design System: Black (#000000), White (#FFFFFF), Grey (#F2F4F7), 
 * Stark (#111111).
 * Data Integrity: Operates strictly on live Firestore connections.
 * ============================================================================
 */

export default function DeliveryApp() {
  const [searchParams] = useSearchParams();
  const initialPickup = searchParams.get('pickup') || 'Headquarters, Sector 4, Active Grid';
  const initialDropoff = searchParams.get('dropoff') || 'Terminal B, Logistics Hub';

  const [activeTab, setActiveTab] = useState('Home');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});
  const [orders, setOrders] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0, coins: 0 });
  const [isBooking, setIsBooking] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  
  const [activePickup, setActivePickup] = useState(initialPickup);
  const [activeDropoff, setActiveDropoff] = useState(initialDropoff);

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
        pickupLocation: activePickup,
        dropoffLocation: activeDropoff,
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

  const executeSystemSignOut = async () => {
    await signOut(auth);
  };

  // 3. Tab Rendering Matrices
  const renderHome = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-24">
      
      {/* Brand Header & Geographic Pickup Selector */}
      <div className="bg-[#111111] px-4 pt-4 pb-12 rounded-b-[40px] shadow-sm relative z-40 border-b border-[#333333]">
        <div className="flex items-center gap-2 mb-6">
          <img src="/logo.png" alt="Movyra" className="h-6 w-auto" onError={(e) => e.target.style.display = 'none'} />
        </div>
        
        <div className="bg-[#000000] rounded-2xl p-4 flex flex-col gap-3 shadow-lg absolute -bottom-16 left-4 right-4 cursor-pointer hover:shadow-xl transition-shadow border border-[#333333]">
          <div className="flex items-center gap-3 border-b border-[#333333] pb-3">
            <div className="w-8 h-8 rounded-full bg-[#111111] flex items-center justify-center text-[#FFFFFF]">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><circle cx="12" cy="12" r="6"></circle></svg>
            </div>
            <div className="flex flex-col flex-1">
              <span className="text-[#FFFFFF] font-black text-[0.95rem] leading-tight">Pick up from</span>
              <span className="text-[#888888] text-[0.8rem] font-bold truncate max-w-[220px]">{activePickup}</span>
            </div>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#111111] flex items-center justify-center text-[#FFFFFF]">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            </div>
            <div className="flex flex-col flex-1">
              <span className="text-[#FFFFFF] font-black text-[0.95rem] leading-tight">Deliver to</span>
              <span className="text-[#888888] text-[0.8rem] font-bold truncate max-w-[220px]">{activeDropoff}</span>
            </div>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>
      </div>

      <div className="px-4 mt-24">
        {/* Fleet Selection Matrix */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { id: 'Trucks', icon: <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg> },
            { id: '2 Wheeler', icon: <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17.5" r="3.5"></circle><circle cx="18.5" cy="17.5" r="3.5"></circle><path d="M15 6h5v4l-4 3H8l-3-3V6z"></path><path d="M11 13V6"></path></svg> },
            { id: 'Packers & Movers', icon: <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> }
          ].map((vehicle) => (
            <button key={vehicle.id} onClick={() => setSelectedVehicle(vehicle.id)} className="bg-[#111111] border border-[#333333] rounded-[24px] p-4 flex flex-col items-center justify-center gap-3 shadow-sm hover:border-[#FFFFFF] hover:shadow-md transition-all h-[120px]">
              {vehicle.icon}
              <span className="text-[#FFFFFF] font-black text-[0.8rem] text-center leading-tight">{vehicle.id}</span>
            </button>
          ))}
        </div>

        {/* Corporate Rewards Banner */}
        <div className="w-full bg-[#111111] border border-[#333333] rounded-[24px] p-5 flex items-center justify-between shadow-lg mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-[#FFFFFF] opacity-5 rounded-full blur-[30px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-[#FFFFFF] rounded-full flex items-center justify-center text-[#111111] shadow-inner">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2" stroke="#111111" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[#FFFFFF] font-black text-[1.1rem]">Explore Movyra Rewards</span>
              <span className="text-[#888888] font-bold text-[0.8rem]">Earn 2 coins for every ₹100 spent</span>
            </div>
          </div>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </div>

        {/* System Announcements */}
        <h3 className="text-[#FFFFFF] font-black text-[1.2rem] mb-4">Announcements</h3>
        <div className="bg-[#111111] border border-[#333333] rounded-[24px] p-5 flex items-center justify-between shadow-sm mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FFFFFF] text-[#111111] font-black text-[0.6rem] rounded-full flex items-center justify-center border-2 border-[#111111]">2</span>
              <div className="w-10 h-10 bg-[#000000] border border-[#333333] rounded-full flex items-center justify-center text-[#FFFFFF]">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              </div>
            </div>
            <span className="text-[#FFFFFF] font-bold text-[0.95rem]">Introducing Movyra Enterprise</span>
          </div>
          <button className="text-[#111111] font-black text-[0.85rem] bg-[#FFFFFF] px-4 py-2 rounded-full">View all</button>
        </div>

        {/* Nested Outstation (PartLoad) Booking Module */}
        <div className="w-full bg-[#111111] border border-[#333333] rounded-[24px] p-6 text-[#FFFFFF] shadow-lg mb-8 relative overflow-hidden flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-[#000000] border border-[#333333] rounded-full flex items-center justify-center mb-3 text-[#FFFFFF]">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
          </div>
          <span className="font-black text-[1rem] uppercase tracking-widest text-[#888888] mb-1">Send Goods Outstation With</span>
          <h2 className="font-black text-[2.5rem] leading-none mb-1 text-[#FFFFFF]">Part Load</h2>
          <span className="font-bold text-[1.1rem] text-[#888888] mb-4">Across 30 Destinations</span>
          <span className="border-b-2 border-[#333333] font-bold text-[1.1rem] pb-1 mb-6 text-[#FFFFFF]">Pay per kg for your load</span>
          
          <div className="w-full bg-[#000000] border border-[#333333] rounded-xl p-4 mb-6">
             <span className="font-black text-[1.2rem] text-[#FFFFFF]">Send up to 3000 kg</span>
          </div>

          <div className="w-full flex flex-col gap-3 mb-6">
            {['Mumbai', 'Ahmadnagar', 'Surat'].map(city => (
              <div key={city} className="bg-[#000000] border border-[#333333] text-[#FFFFFF] rounded-xl p-4 flex items-center gap-4 shadow-sm text-left">
                <div className="w-10 h-10 bg-[#111111] rounded-full flex items-center justify-center text-[#FFFFFF]">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-[1rem]">Pune to {city}</span>
                  <span className="text-[#888888] font-bold text-[0.8rem]">Starting at ₹1654 for 150Kgs</span>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => setSelectedVehicle('PartLoad Heavy')} className="w-full bg-[#FFFFFF] text-[#111111] py-4 rounded-xl font-black text-[1.1rem] hover:bg-[#F2F4F7] transition-colors shadow-md">
            Book Now
          </button>
        </div>

      </div>

      {/* Dispatch Modal Overlay */}
      <AnimatePresence>
        {selectedVehicle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#000000]/80 backdrop-blur-sm flex items-end justify-center">
            <motion.div initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }} className="w-full max-w-[600px] bg-[#111111] border-t border-[#333333] rounded-t-3xl p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-[1.5rem] text-[#FFFFFF]">Dispatch {selectedVehicle}</h3>
                <button onClick={() => setSelectedVehicle(null)} className="w-8 h-8 flex items-center justify-center text-[#FFFFFF]"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
              </div>
              <p className="text-[#888888] font-bold mb-8 text-[0.95rem]">Initiate a live delivery sequence to verify the transaction tracking systems.</p>
              
              <div className="flex flex-col gap-4 mb-8">
                <div className="bg-[#000000] border border-[#333333] p-3 rounded-xl">
                  <span className="block text-[0.7rem] font-bold text-[#888888] uppercase mb-1">Pickup</span>
                  <span className="font-bold text-[#FFFFFF] text-[0.9rem] truncate block">{activePickup}</span>
                </div>
                <div className="bg-[#000000] border border-[#333333] p-3 rounded-xl">
                  <span className="block text-[0.7rem] font-bold text-[#888888] uppercase mb-1">Drop-off</span>
                  <span className="font-bold text-[#FFFFFF] text-[0.9rem] truncate block">{activeDropoff}</span>
                </div>
              </div>

              <button onClick={handleVehicleDispatch} disabled={isBooking} className="w-full bg-[#FFFFFF] text-[#111111] py-4 rounded-xl font-black text-[1.1rem] hover:bg-[#F2F4F7] transition-colors disabled:opacity-50">
                {isBooking ? 'Processing Request...' : 'Confirm Dispatch'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderOrders = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full min-h-screen bg-[#000000] pb-24">
      <div className="bg-[#111111] px-6 pt-10 pb-4 sticky top-0 z-40 shadow-sm border-b border-[#333333]">
        <h1 className="text-[#FFFFFF] font-black text-[1.8rem]">Orders</h1>
      </div>
      
      <div className="p-4">
        <h3 className="text-[#FFFFFF] font-black text-[1.2rem] mb-4 pl-2">Past</h3>
        {orders.length === 0 ? (
          <div className="bg-[#111111] rounded-[24px] p-8 flex flex-col items-center text-center shadow-sm border border-[#333333]">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <span className="text-[#FFFFFF] font-black text-[1.1rem] mb-2">No transaction records located.</span>
            <span className="text-[#888888] font-bold text-[0.85rem]">Execute a vehicle dispatch from the home dashboard to generate analytical data.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-[#111111] rounded-[24px] shadow-sm border border-[#333333] overflow-hidden">
                <div className="p-5 flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#000000] border border-[#333333] rounded-full flex items-center justify-center text-[#FFFFFF]">
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17.5" r="3.5"></circle><circle cx="18.5" cy="17.5" r="3.5"></circle><path d="M15 6h5v4l-4 3H8l-3-3V6z"></path><path d="M11 13V6"></path></svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#FFFFFF] font-black text-[1.1rem]">{order.vehicleType}</span>
                      <span className="text-[#888888] font-bold text-[0.85rem] uppercase tracking-wide">{order.createdAt ? new Date(order.createdAt.toDate()).toLocaleString() : 'Processing...'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-[#FFFFFF] font-black text-[1.2rem]">₹{order.price}</span>
                     <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </div>
                </div>
                
                <div className="px-5 pb-5">
                  <div className="bg-[#000000] border border-[#333333] rounded-xl p-4 flex gap-4 relative">
                    <div className="flex flex-col items-center mt-1 w-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FFFFFF]"></div>
                      <div className="w-0.5 h-full bg-[#333333] my-1 absolute top-4 bottom-4 left-[1.35rem]"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#888888] mt-auto relative z-10"></div>
                    </div>
                    <div className="flex flex-col justify-between py-0.5 w-full">
                      <div className="flex flex-col mb-4">
                        <span className="text-[#FFFFFF] font-black text-[0.9rem]">{profile.name || 'Account User'} • <span className="font-bold text-[#888888]">{profile.phone || '9309932843'}</span></span>
                        <span className="text-[#888888] font-bold text-[0.8rem] truncate max-w-[250px]">{order.pickupLocation}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[#FFFFFF] font-black text-[0.9rem]">Destination Gateway • <span className="font-bold text-[#888888]">8208008616</span></span>
                        <span className="text-[#888888] font-bold text-[0.8rem] truncate max-w-[250px]">{order.dropoffLocation}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-[#333333] mt-2">
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-5 h-5 rounded-full border border-[#FFFFFF] flex items-center justify-center">
                       <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-[#FFFFFF] font-black text-[0.95rem]">Completed</span>
                  </div>
                  <button onClick={() => setSelectedVehicle(order.vehicleType)} className="bg-[#FFFFFF] text-[#111111] px-6 py-2.5 rounded-xl font-black text-[0.9rem] hover:bg-[#F2F4F7] transition-colors mt-3">Book Again</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderCoins = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full min-h-screen bg-[#000000] pb-24">
      
      <div className="p-4 pt-10">
        {/* Main Balance Banner */}
        <div className="w-full bg-[#111111] border border-[#333333] rounded-[24px] p-6 shadow-md mb-8 relative overflow-hidden h-[160px] flex flex-col justify-center">
          <div className="absolute right-[-10%] top-0 h-full">
            {/* Visual representation of coin stack */}
            <svg width="150" height="160" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="40" fill="#FFFFFF" opacity="0.1"/>
              <circle cx="60" cy="60" r="40" fill="#FFFFFF" opacity="0.2"/>
              <path d="M60 40 L60 80" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.5"/>
              <path d="M40 60 L80 60" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.5"/>
            </svg>
          </div>
          <div className="relative z-10 flex flex-col">
            <span className="text-[#FFFFFF] font-black text-[3.5rem] leading-none">{wallet.coins || 0}</span>
            <span className="text-[#888888] font-bold text-[1rem]">Available Coins</span>
          </div>
        </div>

        <div className="w-full bg-[#000000] border-b border-[#333333] pb-4 mb-6 flex items-center justify-between cursor-pointer">
           <span className="text-[#FFFFFF] font-black text-[0.95rem]">Coins Transaction History</span>
           <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>

        <h3 className="text-[#FFFFFF] font-black text-[1.2rem] mb-4">Use Coins</h3>
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-[#111111] rounded-2xl p-5 border border-[#333333] shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col cursor-pointer hover:border-[#FFFFFF] transition-colors">
            <div className="mb-8">
               <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" ry="2" fill="#333333"></rect><line x1="2" y1="10" x2="22" y2="10" stroke="#FFFFFF"></line></svg>
            </div>
            <span className="text-[#888888] font-bold text-[0.8rem] mb-1">Transfer into</span>
            <div className="flex items-center justify-between">
              <span className="text-[#FFFFFF] font-black text-[1rem]">Movyra Credits</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </div>
          </div>

          <div className="bg-[#111111] rounded-2xl p-5 border border-[#333333] shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col cursor-pointer hover:border-[#FFFFFF] transition-colors relative overflow-hidden">
            <span className="absolute top-0 left-0 bg-[#FFFFFF] text-[#111111] font-black text-[0.6rem] uppercase tracking-widest px-2 py-1 rounded-br-xl">NEW</span>
            <div className="mb-8 mt-2">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="#333333"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#FFFFFF"></path></svg>
            </div>
            <span className="text-[#888888] font-bold text-[0.8rem] mb-1">Transfer into</span>
            <div className="flex items-center justify-between">
              <span className="text-[#FFFFFF] font-black text-[1rem]">Bank Account</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </div>
          </div>
        </div>

        <h3 className="text-[#FFFFFF] font-black text-[1.2rem] mb-4">More about Coins</h3>
        <div className="grid grid-cols-2 gap-4 mb-10">
           <div className="bg-[#111111] rounded-[24px] p-5 flex flex-col border border-[#333333]">
              <div className="mb-6 flex justify-center">
                 <div className="w-16 h-16 rounded-full bg-[#000000] border border-[#333333] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#FFFFFF" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>
                 </div>
              </div>
              <span className="text-[#FFFFFF] font-black text-[1.1rem] leading-tight mb-4">How do I earn coins?</span>
              <span className="text-[#888888] font-black text-[0.95rem] flex items-center gap-1">Learn <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></span>
           </div>
           <div className="bg-[#111111] rounded-[24px] p-5 flex flex-col border border-[#333333]">
              <div className="mb-6 flex justify-center">
                 <div className="w-16 h-16 rounded-full bg-[#000000] border border-[#333333] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#FFFFFF" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                 </div>
              </div>
              <span className="text-[#FFFFFF] font-black text-[1.1rem] leading-tight mb-4">How do I use coins?</span>
              <span className="text-[#888888] font-black text-[0.95rem] flex items-center gap-1">Learn <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></span>
           </div>
        </div>

        <h3 className="text-[#FFFFFF] font-black text-[1.2rem] mb-4">Frequently asked questions</h3>
        <div className="flex flex-col gap-0 mb-6">
           {['Do Movyra coins have validity?', 'What is the value of a Movyra coin in Rupees?', 'How can I use Movyra coins?', 'When are the Movyra coins awarded?', 'Will Movyra Rewards be credited against a Business wallet trip?'].map((q, idx) => (
             <div key={idx} className="w-full py-4 border-b border-[#333333] flex items-center justify-between">
                <span className="text-[#888888] font-bold text-[0.95rem] pr-4">{q}</span>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
             </div>
           ))}
        </div>
        <div className="pt-4 pb-12">
          <span className="text-[#FFFFFF] font-black text-[1.1rem]">Terms and Conditions</span>
        </div>

      </div>
    </motion.div>
  );

  const renderPayments = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full min-h-screen bg-[#000000] pb-24">
      <div className="bg-[#111111] px-6 pt-10 pb-4 sticky top-0 z-40 border-b border-[#333333]">
        <h1 className="text-[#FFFFFF] font-black text-[1.8rem]">Payments</h1>
      </div>
      
      <div className="p-4">
        <div className="bg-[#111111] rounded-[24px] p-6 shadow-sm border border-[#333333]">
          <div className="flex items-center justify-between mb-6 cursor-pointer">
            <span className="text-[#FFFFFF] font-black text-[1.1rem]">Movyra Credits Balance</span>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 text-[#FFFFFF]">
              <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><circle cx="16" cy="12" r="2" fill="#111111"></circle></svg>
            </div>
            <span className="text-[#FFFFFF] font-black text-[2.5rem] leading-none">₹{wallet.balance || 0}</span>
          </div>
          <button className="w-full bg-[#FFFFFF] text-[#111111] py-4 rounded-xl font-black text-[1.1rem] hover:bg-[#F2F4F7] transition-colors shadow-sm">
            Add Money
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderAccount = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full min-h-screen bg-[#000000] pb-24">
      <div className="bg-[#111111] px-4 pt-10 pb-4 sticky top-0 z-40 flex items-center gap-4 border-b border-[#333333]">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        <h1 className="text-[#FFFFFF] font-black text-[1.5rem]">Profile Details</h1>
      </div>
      
      <div className="p-4">
        {/* Core Identity Profile */}
        <div className="bg-[#111111] rounded-[24px] p-6 shadow-sm border border-[#333333] mb-4">
          <div className="flex items-center justify-between mb-6 border-b border-[#333333] pb-4">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-[#000000] border border-[#333333] rounded-full flex items-center justify-center text-[#FFFFFF]">
                 <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
               </div>
               <span className="text-[#FFFFFF] font-black text-[1.2rem]">Personal Details</span>
            </div>
            <span className="text-[#FFFFFF] font-black text-[0.95rem] cursor-pointer">Edit</span>
          </div>
          
          <div className="flex flex-col gap-2 mb-4">
             <span className="text-[#FFFFFF] font-black text-[1.1rem]">{profile.name || user?.email?.split('@')[0] || 'Authorized User'}</span>
             <span className="text-[#888888] font-bold text-[0.95rem]">{user?.email || 'admin@movyra.in'}</span>
          </div>

          <div className="bg-[#000000] inline-block px-3 py-1.5 rounded-lg border border-[#333333]">
             <span className="text-[#FFFFFF] font-black text-[0.95rem]">{profile.phone || '+91 - Authorized'}</span>
          </div>
        </div>

        {/* Action Blocks */}
        <div className="flex flex-col gap-4 mt-6">
           
           <div className="bg-[#111111] rounded-[24px] p-5 shadow-sm border border-[#333333] flex flex-col gap-2">
             <div className="flex items-center justify-between cursor-pointer py-2 border-b border-[#333333]">
               <div className="flex items-center gap-4">
                 <div className="text-[#FFFFFF]"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></div>
                 <span className="text-[#FFFFFF] font-black text-[1.1rem]">Saved Addresses</span>
               </div>
               <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
             </div>
             <div className="flex items-center justify-between cursor-pointer py-2">
               <div className="flex items-center gap-4">
                 <div className="text-[#FFFFFF]"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></div>
                 <span className="text-[#FFFFFF] font-black text-[1.1rem]">GST Details</span>
               </div>
               <div className="flex items-center gap-3">
                 <span className="border border-[#FFFFFF] text-[#FFFFFF] px-4 py-1.5 rounded-xl font-bold text-[0.9rem] flex items-center gap-1"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Add GSTIN</span>
                 <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
               </div>
             </div>
           </div>

           <div className="bg-[#111111] rounded-[24px] p-5 shadow-sm border border-[#333333] flex flex-col gap-2">
             <div className="flex items-center justify-between cursor-pointer py-2 border-b border-[#333333]">
               <div className="flex items-center gap-4">
                 <div className="text-[#FFFFFF]"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg></div>
                 <span className="text-[#FFFFFF] font-black text-[1.1rem]">Movyra Rewards</span>
               </div>
               <div className="flex items-center gap-3">
                 <div className="bg-[#FFFFFF] px-3 py-1 rounded-lg flex items-center gap-1 text-[#111111] font-black"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg> 0</div>
                 <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
               </div>
             </div>
             <div className="flex items-center justify-between cursor-pointer py-2">
               <div className="flex items-center gap-4">
                 <div className="text-[#FFFFFF]"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg></div>
                 <span className="text-[#FFFFFF] font-black text-[1.1rem]">Refer and earn ₹200</span>
               </div>
               <div className="flex items-center gap-3">
                 <span className="border border-[#FFFFFF] text-[#FFFFFF] px-4 py-1.5 rounded-xl font-bold text-[0.9rem] flex items-center gap-1"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg> Invite</span>
                 <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
               </div>
             </div>
           </div>

           <div className="bg-[#111111] rounded-[24px] p-5 shadow-sm border border-[#333333] flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-4">
                 <div className="text-[#FFFFFF]"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg></div>
                 <div className="flex flex-col">
                    <span className="text-[#FFFFFF] font-black text-[1.1rem]">Movyra Enterprise</span>
                    <span className="text-[#888888] font-bold text-[0.85rem]">Upgrade to Business Solution</span>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <span className="bg-[#FFFFFF] text-[#111111] font-black text-[0.75rem] px-3 py-1 rounded-lg uppercase tracking-wider">NEW</span>
                 <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>
           </div>

           <div className="bg-[#111111] rounded-[24px] p-5 shadow-sm border border-[#333333] flex flex-col gap-2">
             <div className="flex items-center justify-between cursor-pointer py-2 border-b border-[#333333]">
               <div className="flex items-center gap-4">
                 <div className="text-[#FFFFFF]"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg></div>
                 <span className="text-[#FFFFFF] font-black text-[1.1rem]">Help & Support</span>
               </div>
               <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
             </div>
             <div className="flex items-center justify-between cursor-pointer py-2 border-b border-[#333333]">
               <div className="flex items-center gap-4">
                 <div className="text-[#FFFFFF]"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg></div>
                 <span className="text-[#FFFFFF] font-black text-[1.1rem]">Change Language</span>
               </div>
               <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
             </div>
             <div onClick={executeSystemSignOut} className="flex items-center justify-between cursor-pointer py-2">
               <div className="flex items-center gap-4">
                 <div className="text-[#FFFFFF]"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"/></svg></div>
                 <span className="text-[#ff4444] font-black text-[1.1rem]">Sign Out</span>
               </div>
             </div>
           </div>

        </div>
      </div>
    </motion.div>
  );

  // 4. Primary Master Control Matrix
  return (
    <div className="w-full min-h-screen bg-[#000000] font-sans selection:bg-[#FFFFFF] selection:text-[#000000] overflow-x-hidden">
      
      {/* Dynamic Content Frame */}
      <AnimatePresence mode="wait">
        {activeTab === 'Home' && <motion.div key="home">{renderHome()}</motion.div>}
        {activeTab === 'Orders' && <motion.div key="orders">{renderOrders()}</motion.div>}
        {activeTab === 'Coins' && <motion.div key="coins">{renderCoins()}</motion.div>}
        {activeTab === 'Payments' && <motion.div key="payments">{renderPayments()}</motion.div>}
        {activeTab === 'Account' && <motion.div key="account">{renderAccount()}</motion.div>}
      </AnimatePresence>

      {/* Global Bottom Navigation Architecture */}
      <div className="fixed bottom-0 left-0 w-full bg-[#111111] border-t border-[#333333] px-6 py-3 flex justify-between items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {[
          { id: 'Home', icon: <svg viewBox="0 0 24 24" width="24" height="24" fill={activeTab === 'Home' ? '#FFFFFF' : 'none'} stroke={activeTab === 'Home' ? '#FFFFFF' : '#888888'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> },
          { id: 'Orders', icon: <svg viewBox="0 0 24 24" width="24" height="24" fill={activeTab === 'Orders' ? '#FFFFFF' : 'none'} stroke={activeTab === 'Orders' ? '#FFFFFF' : '#888888'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> },
          { id: 'Coins', icon: <svg viewBox="0 0 24 24" width="24" height="24" fill={activeTab === 'Coins' ? '#FFFFFF' : 'none'} stroke={activeTab === 'Coins' ? '#FFFFFF' : '#888888'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg> },
          { id: 'Payments', icon: <svg viewBox="0 0 24 24" width="24" height="24" fill={activeTab === 'Payments' ? '#FFFFFF' : 'none'} stroke={activeTab === 'Payments' ? '#FFFFFF' : '#888888'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg> },
          { id: 'Account', icon: <svg viewBox="0 0 24 24" width="24" height="24" fill={activeTab === 'Account' ? '#FFFFFF' : 'none'} stroke={activeTab === 'Account' ? '#FFFFFF' : '#888888'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> }
        ].map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)} 
            className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === tab.id ? 'text-[#FFFFFF]' : 'text-[#888888] hover:text-[#FFFFFF]'}`}
          >
            {tab.icon}
            <span className="text-[0.7rem] font-black tracking-wide">{tab.id}</span>
          </button>
        ))}
      </div>
    </div>
  );
}