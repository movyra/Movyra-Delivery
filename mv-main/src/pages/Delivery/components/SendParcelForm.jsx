import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

/**
 * ============================================================================
 * COMPONENT: SEND PARCEL FORM
 * Purpose: Granular logistical intake matrix capturing dimensions, weight,
 * sender/receiver profiles, and OpenStreetMap coordinate resolution.
 * Design System: Black (#000000), White (#FFFFFF), Grey (#F2F4F7), Stark (#111111).
 * Data Integrity: Dispatches validated payloads to Firestore delivery_orders.
 * ============================================================================
 */

export default function SendParcelForm({ user, onBack, onComplete }) {
  // 1. Logistical State Parameters
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [weight, setWeight] = useState('');
  const [dimensions, setDimensions] = useState({ length: '', width: '', height: '' });
  
  const [senderInfo, setSenderInfo] = useState({ name: '', phone: '' });
  const [receiverInfo, setReceiverInfo] = useState({ name: '', phone: '' });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorPrompt, setErrorPrompt] = useState('');

  // OpenStreetMap Suggestion States
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);

  // 2. OpenStreetMap (LocationIQ) Integration
  const fetchAddressSuggestions = async (query, type) => {
    if (query.length < 3) {
      type === 'pickup' ? setPickupSuggestions([]) : setDropoffSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`https://us1.locationiq.com/v1/autocomplete?key=${import.meta.env.VITE_LOCATIONIQ_API_KEY}&q=${encodeURIComponent(query)}&limit=4&countrycodes=in`);
      if (!response.ok) throw new Error('Network payload rejected');
      const data = await response.json();
      
      const formattedData = data.map(item => ({
        id: item.place_id,
        address: item.display_name
      }));

      type === 'pickup' ? setPickupSuggestions(formattedData) : setDropoffSuggestions(formattedData);
    } catch (error) {
      console.error("Geographic service failed to resolve:", error);
    }
  };

  const handleLocationSelect = (address, type) => {
    if (type === 'pickup') {
      setPickup(address);
      setPickupSuggestions([]);
    } else {
      setDropoff(address);
      setDropoffSuggestions([]);
    }
  };

  // 3. Dispatch Execution Engine
  const handleQuoteGeneration = async () => {
    setErrorPrompt('');
    if (!pickup || !dropoff || !weight || !senderInfo.name || !senderInfo.phone || !receiverInfo.name || !receiverInfo.phone) {
      setErrorPrompt('Please finalize all mandatory logistical parameters.');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Calculate provisional pricing based on weight and distance heuristic
      const baseRate = 80;
      const weightFactor = parseFloat(weight) * 15;
      const finalEstimate = Math.floor(baseRate + weightFactor);

      // Generate systematic tracking hash
      const uniqueTrackingId = `MVY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const docRef = await addDoc(collection(db, 'delivery_orders'), {
        userId: user.uid,
        trackingId: uniqueTrackingId,
        status: 'Pending Bids',
        vehicleType: 'Auto-Assigned based on parameters',
        pickupLocation: pickup,
        dropoffLocation: dropoff,
        packageDetails: {
          quantity: quantity,
          weight: parseFloat(weight),
          dimensions: dimensions
        },
        sender: senderInfo,
        receiver: receiverInfo,
        price: finalEstimate,
        createdAt: serverTimestamp()
      });

      setIsProcessing(false);
      onComplete(uniqueTrackingId); // Transition to Tracking Map via Master Container
    } catch (error) {
      console.error("Dispatch transaction failed:", error);
      setErrorPrompt('Network failure. Unable to secure dispatch sequence.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#000000] text-white font-sans flex flex-col relative overflow-x-hidden pb-8">
      
      {/* Dynamic Header Architecture */}
      <div className="w-full bg-[#111111] px-4 pt-10 pb-4 shadow-sm relative z-40 flex items-center justify-between border-b border-[#333333] sticky top-0">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center text-[#FFFFFF] hover:bg-[#222222] rounded-full transition-colors">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="text-[#FFFFFF] font-black text-[1.2rem]">Send Parcel</h1>
        <div className="w-10 h-10"></div> {/* Spacer for alignment */}
      </div>

      <div className="px-6 mt-6 flex flex-col gap-6 max-w-2xl mx-auto w-full">
        
        {/* Geographic Routing Sector */}
        <div className="w-full bg-[#111111] border border-[#333333] rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
           <span className="text-[#FFFFFF] font-black text-[1.1rem] mb-2">Where's it going?</span>
           
           <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 w-4 h-full py-4 z-0">
                 <div className="w-2.5 h-2.5 rounded-full border-2 border-[#111111] bg-[#FFFFFF]"></div>
                 <div className="w-0.5 flex-1 bg-[#333333]"></div>
                 <div className="w-3 h-3 rounded-full border-2 border-[#111111] bg-[#FFFFFF] flex items-center justify-center"><div className="w-1 h-1 bg-[#000000] rounded-full"></div></div>
              </div>
              
              <div className="flex flex-col gap-3 ml-8">
                 <div className="relative z-10 w-full">
                    <input 
                      type="text" 
                      value={pickup} 
                      onChange={(e) => { setPickup(e.target.value); fetchAddressSuggestions(e.target.value, 'pickup'); }} 
                      placeholder="Pickup address" 
                      className="w-full bg-[#000000] border border-[#333333] text-[#FFFFFF] px-4 py-3.5 rounded-[12px] outline-none focus:border-[#FFFFFF] transition-colors text-[0.95rem] font-bold"
                    />
                    {pickupSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 w-full mt-1 bg-[#111111] border border-[#333333] rounded-[12px] overflow-hidden z-20 shadow-xl">
                        {pickupSuggestions.map(s => (
                          <div key={s.id} onClick={() => handleLocationSelect(s.address, 'pickup')} className="px-4 py-3 text-[0.8rem] text-[#888888] hover:bg-[#222222] hover:text-[#FFFFFF] cursor-pointer border-b border-[#333333] last:border-0 truncate font-bold">
                            {s.address}
                          </div>
                        ))}
                      </div>
                    )}
                 </div>
                 
                 <div className="relative z-10 w-full">
                    <input 
                      type="text" 
                      value={dropoff} 
                      onChange={(e) => { setDropoff(e.target.value); fetchAddressSuggestions(e.target.value, 'dropoff'); }} 
                      placeholder="Delivery address" 
                      className="w-full bg-[#000000] border border-[#333333] text-[#FFFFFF] px-4 py-3.5 rounded-[12px] outline-none focus:border-[#FFFFFF] transition-colors text-[0.95rem] font-bold"
                    />
                    {dropoffSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 w-full mt-1 bg-[#111111] border border-[#333333] rounded-[12px] overflow-hidden z-20 shadow-xl">
                        {dropoffSuggestions.map(s => (
                          <div key={s.id} onClick={() => handleLocationSelect(s.address, 'dropoff')} className="px-4 py-3 text-[0.8rem] text-[#888888] hover:bg-[#222222] hover:text-[#FFFFFF] cursor-pointer border-b border-[#333333] last:border-0 truncate font-bold">
                            {s.address}
                          </div>
                        ))}
                      </div>
                    )}
                 </div>
              </div>
           </div>
        </div>

        {/* Physical Payload Specifications */}
        <div className="w-full flex flex-col gap-4">
           <div className="flex gap-4">
              <div className="flex-1 flex flex-col">
                 <label className="text-[#888888] font-bold text-[0.8rem] mb-2">Quantity *</label>
                 <div className="relative">
                    <select 
                      value={quantity} 
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-4 py-3.5 rounded-[12px] outline-none focus:border-[#FFFFFF] transition-colors text-[0.95rem] font-bold appearance-none cursor-pointer"
                    >
                       {[1,2,3,4,5,10,20].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#888888]" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                 </div>
              </div>
              <div className="flex-1 flex flex-col">
                 <label className="text-[#888888] font-bold text-[0.8rem] mb-2">Weight *</label>
                 <div className="relative">
                    <input 
                      type="number" 
                      value={weight} 
                      onChange={(e) => setWeight(e.target.value)} 
                      className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-4 py-3.5 rounded-[12px] outline-none focus:border-[#FFFFFF] transition-colors text-[0.95rem] font-bold pr-10"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888888] font-bold text-[0.9rem]">kg</span>
                 </div>
              </div>
           </div>

           <div className="flex gap-3">
              <div className="flex-1 flex flex-col">
                 <label className="text-[#888888] font-bold text-[0.8rem] mb-2">Length *</label>
                 <div className="relative">
                    <input type="number" value={dimensions.length} onChange={(e) => setDimensions({...dimensions, length: e.target.value})} className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-3 rounded-[12px] outline-none focus:border-[#FFFFFF] transition-colors text-[0.9rem] font-bold text-center" placeholder="cm"/>
                 </div>
              </div>
              <div className="flex-1 flex flex-col">
                 <label className="text-[#888888] font-bold text-[0.8rem] mb-2">Width *</label>
                 <div className="relative">
                    <input type="number" value={dimensions.width} onChange={(e) => setDimensions({...dimensions, width: e.target.value})} className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-3 rounded-[12px] outline-none focus:border-[#FFFFFF] transition-colors text-[0.9rem] font-bold text-center" placeholder="cm"/>
                 </div>
              </div>
              <div className="flex-1 flex flex-col">
                 <label className="text-[#888888] font-bold text-[0.8rem] mb-2">Height *</label>
                 <div className="relative">
                    <input type="number" value={dimensions.height} onChange={(e) => setDimensions({...dimensions, height: e.target.value})} className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-3 rounded-[12px] outline-none focus:border-[#FFFFFF] transition-colors text-[0.9rem] font-bold text-center" placeholder="cm"/>
                 </div>
              </div>
           </div>
        </div>

        {/* Origin Actor Profile */}
        <div className="w-full bg-[#111111] border border-[#333333] rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
           <span className="text-[#FFFFFF] font-black text-[1.1rem] mb-1">Sender Info. *</span>
           <div className="flex gap-4">
              <div className="flex-1 relative">
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                 </div>
                 <input type="text" value={senderInfo.name} onChange={(e) => setSenderInfo({...senderInfo, name: e.target.value})} placeholder="Name" className="w-full bg-[#000000] border border-[#333333] text-[#FFFFFF] pl-10 pr-4 py-3.5 rounded-[12px] outline-none focus:border-[#FFFFFF] transition-colors text-[0.95rem] font-bold" />
              </div>
              <div className="flex-1 relative">
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                 </div>
                 <input type="tel" value={senderInfo.phone} onChange={(e) => setSenderInfo({...senderInfo, phone: e.target.value})} placeholder="Phone" className="w-full bg-[#000000] border border-[#333333] text-[#FFFFFF] pl-10 pr-4 py-3.5 rounded-[12px] outline-none focus:border-[#FFFFFF] transition-colors text-[0.95rem] font-bold" />
              </div>
           </div>
        </div>

        {/* Destination Actor Profile */}
        <div className="w-full bg-[#111111] border border-[#333333] rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
           <span className="text-[#FFFFFF] font-black text-[1.1rem] mb-1">Receiver Info. *</span>
           <div className="flex gap-4">
              <div className="flex-1 relative">
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                 </div>
                 <input type="text" value={receiverInfo.name} onChange={(e) => setReceiverInfo({...receiverInfo, name: e.target.value})} placeholder="Name" className="w-full bg-[#000000] border border-[#333333] text-[#FFFFFF] pl-10 pr-4 py-3.5 rounded-[12px] outline-none focus:border-[#FFFFFF] transition-colors text-[0.95rem] font-bold" />
              </div>
              <div className="flex-1 relative">
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                 </div>
                 <input type="tel" value={receiverInfo.phone} onChange={(e) => setReceiverInfo({...receiverInfo, phone: e.target.value})} placeholder="Phone" className="w-full bg-[#000000] border border-[#333333] text-[#FFFFFF] pl-10 pr-4 py-3.5 rounded-[12px] outline-none focus:border-[#FFFFFF] transition-colors text-[0.95rem] font-bold" />
              </div>
           </div>
        </div>

        {errorPrompt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#ff4444]/10 border border-[#ff4444]/30 text-[#ff4444] px-4 py-3 rounded-xl text-center font-bold text-[0.85rem]">
            {errorPrompt}
          </motion.div>
        )}

        {/* Master Execution Action */}
        <button 
          onClick={handleQuoteGeneration} 
          disabled={isProcessing}
          className="w-full bg-[#FFFFFF] text-[#111111] py-4 rounded-[20px] font-black text-[1.1rem] hover:bg-[#F2F4F7] transition-colors disabled:opacity-50 mt-2 shadow-lg"
        >
          {isProcessing ? 'Processing Framework...' : 'Quote me'}
        </button>

      </div>
    </div>
  );
}