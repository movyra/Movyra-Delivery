import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

/**
 * ============================================================================
 * COMPONENT: ADVANCED BOOKING ENGINE
 * Purpose: Handles complex logistics routing including multi-stop waypoints,
 * specific handling tags, and future scheduling.
 * Design System: Black (#000000), White (#FFFFFF), Grey (#F2F4F7), 
 * Stark (#111111), Accent (#00A9F7).
 * ============================================================================
 */

export default function AdvancedBookingEngine({ user, initialPickup, initialDropoff, onRouteToBids }) {
  const [pickup, setPickup] = useState(initialPickup);
  const [dropoff, setDropoff] = useState(initialDropoff);
  const [waypoints, setWaypoints] = useState([]);
  
  const [vehicle, setVehicle] = useState('2 Wheeler');
  const [scheduleType, setScheduleType] = useState('Immediate'); // Immediate, Scheduled, Recurring
  const [selectedTags, setSelectedTags] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [waypointSuggestions, setWaypointSuggestions] = useState([]);
  const [activeWaypointIndex, setActiveWaypointIndex] = useState(null);

  const handlingTags = [
    { id: 'fragile', label: 'Fragile', icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l8 4-8 4-8-4 8-4z"/><path d="M12 10v12"/><path d="M20 6v12l-8 4-8-4V6"/><path d="M12 2v8"/><path d="M4 6l8 4 8-4"/></svg> },
    { id: 'waterproof', label: 'Waterproof', icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
    { id: 'temp_control', label: 'Temp Control', icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg> }
  ];

  // OpenStreetMap LocationIQ Integration
  const fetchAddressSuggestions = async (query, targetType, index = null) => {
    if (query.length < 3) {
      if (targetType === 'pickup') setPickupSuggestions([]);
      else if (targetType === 'dropoff') setDropoffSuggestions([]);
      else setWaypointSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`https://us1.locationiq.com/v1/autocomplete?key=${import.meta.env.VITE_LOCATIONIQ_API_KEY}&q=${encodeURIComponent(query)}&limit=4&countrycodes=in`);
      if (!response.ok) throw new Error('Network payload rejected');
      const data = await response.json();
      
      const formattedData = data.map(item => ({
        id: item.place_id,
        address: item.display_name,
        lat: item.lat,
        lon: item.lon
      }));

      if (targetType === 'pickup') setPickupSuggestions(formattedData);
      else if (targetType === 'dropoff') setDropoffSuggestions(formattedData);
      else {
        setWaypointSuggestions(formattedData);
        setActiveWaypointIndex(index);
      }
    } catch (error) {
      console.error("Geographic service failed:", error);
    }
  };

  const handleSelectSuggestion = (address, targetType, index = null) => {
    if (targetType === 'pickup') {
      setPickup(address);
      setPickupSuggestions([]);
    } else if (targetType === 'dropoff') {
      setDropoff(address);
      setDropoffSuggestions([]);
    } else {
      const updatedWaypoints = [...waypoints];
      updatedWaypoints[index] = address;
      setWaypoints(updatedWaypoints);
      setWaypointSuggestions([]);
      setActiveWaypointIndex(null);
    }
  };

  const toggleHandlingTag = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

  const addWaypoint = () => {
    if (waypoints.length < 3) {
      setWaypoints([...waypoints, '']);
    }
  };

  const removeWaypoint = (index) => {
    setWaypoints(waypoints.filter((_, i) => i !== index));
  };

  const executeLogisticsDispatch = async () => {
    if (!pickup || !dropoff || !user) return;
    setIsProcessing(true);

    try {
      const payload = {
        userId: user.uid,
        vehicleType: vehicle,
        status: 'Pending Bids',
        pickupLocation: pickup,
        dropoffLocation: dropoff,
        waypoints: waypoints.filter(wp => wp.trim() !== ''),
        handlingTags: selectedTags,
        scheduleType: scheduleType,
        createdAt: serverTimestamp(),
        basePriceEstimate: Math.floor(Math.random() * 500) + 150
      };

      // Route to appropriate collection based on complexity
      const collectionName = (waypoints.length > 0 || scheduleType !== 'Immediate') 
        ? 'delivery_multi_stop' 
        : 'delivery_orders';

      await addDoc(collection(db, collectionName), payload);
      
      setIsProcessing(false);
      onRouteToBids(); // Transition to Live Bidding module
    } catch (error) {
      console.error("Advanced dispatch failed:", error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="pb-24">
      {/* Brand Header */}
      <div className="bg-[#111111] px-4 pt-4 pb-6 border-b border-[#333333] sticky top-0 z-40">
        <div className="flex items-center justify-between mb-4">
          <img src="/logo.png" alt="Movyra" className="h-6 w-auto invert" onError={(e) => e.target.style.display = 'none'} />
          <span className="text-[#FFFFFF] font-black text-[0.85rem] bg-[#00A9F7] px-3 py-1 rounded-full">Pro Route</span>
        </div>
        <h1 className="text-[#FFFFFF] font-black text-[1.5rem]">Configure Dispatch</h1>
      </div>

      <div className="p-4 flex flex-col gap-6 mt-2">
        
        {/* Geographic Routing Array */}
        <div className="bg-[#111111] border border-[#333333] rounded-[24px] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[#FFFFFF] font-black text-[1.1rem]">Route Matrix</span>
            {waypoints.length < 3 && (
              <button onClick={addWaypoint} className="text-[#00A9F7] font-bold text-[0.8rem] flex items-center gap-1 hover:underline">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add Stop
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4 relative">
            <div className="absolute left-[15px] top-[24px] bottom-[24px] w-0.5 bg-[#333333] z-0"></div>
            
            {/* Pickup Node */}
            <div className="relative z-10 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#000000] border-2 border-[#00A9F7] flex items-center justify-center shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-[#00A9F7]"></div>
              </div>
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={pickup} 
                  onChange={(e) => { setPickup(e.target.value); fetchAddressSuggestions(e.target.value, 'pickup'); }} 
                  placeholder="Pickup Coordinates" 
                  className="w-full bg-[#000000] border border-[#333333] text-[#FFFFFF] px-4 py-3 rounded-xl outline-none focus:border-[#00A9F7] transition-colors text-[0.9rem]" 
                />
                {pickupSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-[#111111] border border-[#333333] rounded-xl overflow-hidden z-20 shadow-xl">
                    {pickupSuggestions.map(s => (
                      <div key={s.id} onClick={() => handleSelectSuggestion(s.address, 'pickup')} className="px-4 py-3 text-[0.8rem] text-[#888888] hover:bg-[#222222] hover:text-[#FFFFFF] cursor-pointer border-b border-[#333333] last:border-0 truncate">
                        {s.address}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Waypoint Nodes */}
            <AnimatePresence>
              {waypoints.map((wp, index) => (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} key={`wp-${index}`} className="relative z-10 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#000000] border-2 border-[#888888] flex items-center justify-center shrink-0 mt-1">
                    <span className="text-[#888888] text-[0.6rem] font-black">{index + 1}</span>
                  </div>
                  <div className="flex-1 relative flex gap-2">
                    <div className="flex-1 relative">
                      <input 
                        type="text" 
                        value={wp} 
                        onChange={(e) => {
                          const updated = [...waypoints];
                          updated[index] = e.target.value;
                          setWaypoints(updated);
                          fetchAddressSuggestions(e.target.value, 'waypoint', index);
                        }} 
                        placeholder={`Stop ${index + 1} Coordinates`} 
                        className="w-full bg-[#000000] border border-[#333333] text-[#FFFFFF] px-4 py-3 rounded-xl outline-none focus:border-[#00A9F7] transition-colors text-[0.9rem]" 
                      />
                      {activeWaypointIndex === index && waypointSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 w-full mt-1 bg-[#111111] border border-[#333333] rounded-xl overflow-hidden z-20 shadow-xl">
                          {waypointSuggestions.map(s => (
                            <div key={s.id} onClick={() => handleSelectSuggestion(s.address, 'waypoint', index)} className="px-4 py-3 text-[0.8rem] text-[#888888] hover:bg-[#222222] hover:text-[#FFFFFF] cursor-pointer border-b border-[#333333] last:border-0 truncate">
                              {s.address}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <button onClick={() => removeWaypoint(index)} className="w-11 h-11 bg-[#ff4444]/10 text-[#ff4444] border border-[#ff4444]/30 rounded-xl flex items-center justify-center hover:bg-[#ff4444]/20 transition-colors shrink-0 mt-0.5">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Drop-off Node */}
            <div className="relative z-10 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#000000] border-2 border-[#00ff88] flex items-center justify-center shrink-0 mt-1">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#00ff88" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={dropoff} 
                  onChange={(e) => { setDropoff(e.target.value); fetchAddressSuggestions(e.target.value, 'dropoff'); }} 
                  placeholder="Final Destination" 
                  className="w-full bg-[#000000] border border-[#333333] text-[#FFFFFF] px-4 py-3 rounded-xl outline-none focus:border-[#00A9F7] transition-colors text-[0.9rem]" 
                />
                {dropoffSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-[#111111] border border-[#333333] rounded-xl overflow-hidden z-20 shadow-xl">
                    {dropoffSuggestions.map(s => (
                      <div key={s.id} onClick={() => handleSelectSuggestion(s.address, 'dropoff')} className="px-4 py-3 text-[0.8rem] text-[#888888] hover:bg-[#222222] hover:text-[#FFFFFF] cursor-pointer border-b border-[#333333] last:border-0 truncate">
                        {s.address}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Fleet & Execution Timing */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#111111] border border-[#333333] rounded-[24px] p-4 shadow-sm flex flex-col">
            <span className="text-[#888888] font-bold text-[0.75rem] uppercase tracking-widest mb-3">Vehicle</span>
            <select value={vehicle} onChange={(e) => setVehicle(e.target.value)} className="w-full bg-[#000000] border border-[#333333] text-[#FFFFFF] px-3 py-2.5 rounded-xl outline-none font-black text-[0.95rem] appearance-none cursor-pointer">
              <option value="2 Wheeler">2 Wheeler</option>
              <option value="3 Wheeler">3 Wheeler (Auto)</option>
              <option value="Truck (Light)">Light Truck</option>
              <option value="Truck (Heavy)">Heavy Truck</option>
              <option value="EV">EV Carrier</option>
            </select>
          </div>
          
          <div className="bg-[#111111] border border-[#333333] rounded-[24px] p-4 shadow-sm flex flex-col">
            <span className="text-[#888888] font-bold text-[0.75rem] uppercase tracking-widest mb-3">Schedule</span>
            <select value={scheduleType} onChange={(e) => setScheduleType(e.target.value)} className="w-full bg-[#000000] border border-[#333333] text-[#00A9F7] px-3 py-2.5 rounded-xl outline-none font-black text-[0.95rem] appearance-none cursor-pointer">
              <option value="Immediate">Immediate</option>
              <option value="Scheduled">Later Today</option>
              <option value="Recurring">Recurring Daily</option>
            </select>
          </div>
        </div>

        {/* Specialized Handling Tags */}
        <div className="bg-[#111111] border border-[#333333] rounded-[24px] p-5 shadow-sm">
          <span className="text-[#FFFFFF] font-black text-[1.1rem] mb-4 block">Specialized Handling</span>
          <div className="flex flex-wrap gap-3">
            {handlingTags.map(tag => (
              <button 
                key={tag.id}
                onClick={() => toggleHandlingTag(tag.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-[0.85rem] transition-colors ${selectedTags.includes(tag.id) ? 'bg-[#00A9F7]/10 border-[#00A9F7] text-[#00A9F7]' : 'bg-[#000000] border-[#333333] text-[#888888] hover:border-[#FFFFFF] hover:text-[#FFFFFF]'}`}
              >
                {tag.icon}
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Master Execution Trigger */}
        <button 
          onClick={executeLogisticsDispatch} 
          disabled={isProcessing || !pickup || !dropoff} 
          className="w-full bg-[#FFFFFF] text-[#000000] py-4 rounded-[20px] font-black text-[1.2rem] hover:bg-[#F2F4F7] transition-colors disabled:opacity-50 mt-2 shadow-lg"
        >
          {isProcessing ? 'Processing Routing Matrix...' : 'Request Fleet Bids'}
        </button>

      </div>
    </div>
  );
}