import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader2, Navigation, CheckCircle2, Search, X, Map } from 'lucide-react';
import useBookingStore from '../../store/useBookingStore';

// ============================================================================
// COMPONENT: ADDRESS INPUT SHEET (MOVYRA LIGHT THEME)
// A premium bottom-sheet UI featuring 6 functional sections:
// Store Integration, Real-Time Geocoding Engine, Visual Routing Timeline, 
// Dynamic Input Forms, Live Results Matrix, and the Action Validation Engine.
// ============================================================================

export default function AddressInputSheet({ onAddressesSet }) {
  // SECTION 1: Store Integration & State Management
  const { pickup, dropoff, setPickup, setDropoff } = useBookingStore();
  const [activeField, setActiveField] = useState(pickup ? 'dropoff' : 'pickup');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Sync initial query state when component mounts or active field changes manually
  useEffect(() => {
    setQuery(activeField === 'pickup' ? (pickup?.address || '') : (dropoff?.address || ''));
    setResults([]);
  }, [activeField, pickup, dropoff]);

  // SECTION 2: Real-Time Geocoding Engine (OpenStreetMap)
  useEffect(() => {
    if (!query || query.trim().length < 3) { 
      setResults([]); 
      return; 
    }
    
    // Check if the current query matches the already selected address to prevent redundant API calls
    if (activeField === 'pickup' && pickup?.address === query) return;
    if (activeField === 'dropoff' && dropoff?.address === query) return;

    const searchAddress = async () => {
      setIsSearching(true);
      try {
        // Real HTML5/REST geocoding fetch with strict formatting
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`);
        const data = await res.json();
        setResults(data);
      } catch (err) { 
        console.error("Geocoding Error:", err); 
      } finally { 
        setIsSearching(false); 
      }
    };
    
    // Smart debounce to prevent API rate limiting
    const debounce = setTimeout(searchAddress, 600);
    return () => clearTimeout(debounce);
  }, [query, activeField, pickup, dropoff]);

  // Handle the selection of a real-world place
  const handleSelect = (place) => {
    // Normalize the vast OSM data payload into a clean UI format
    const formattedAddress = place.display_name.split(',').slice(0, 3).join(',').trim();
    const loc = { 
      address: formattedAddress, 
      lat: parseFloat(place.lat), 
      lng: parseFloat(place.lon) 
    };

    if (activeField === 'pickup') { 
      setPickup(loc); 
      setActiveField('dropoff'); 
    } else { 
      setDropoff(loc); 
      // Keep focus off to allow user to click Confirm Route naturally
      setActiveField(null); 
    }
    setResults([]);
  };

  const handleFieldFocus = (field) => {
    setActiveField(field);
  };

  return (
    // SECTION 3: Animated Sheet Layout & Wrapper
    <motion.div 
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[40px] px-6 pt-6 pb-safe shadow-[0_-20px_50px_rgba(0,0,0,0.1)] border-t border-gray-100 z-40 flex flex-col max-h-[85vh]"
    >
      {/* Draggable Indicator Handle */}
      <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 flex-shrink-0"></div>
      
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Plan Route</h2>
        {(pickup && dropoff) && (
          <div className="bg-blue-50 text-movyra-blue px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-black uppercase tracking-widest border border-blue-100">
            <CheckCircle2 size={14} strokeWidth={3} /> Ready
          </div>
        )}
      </div>

      {/* SECTION 4: Visual Routing Timeline & Dynamic Input Forms */}
      <div className="relative pl-10 pr-2 space-y-4 mb-6 flex-shrink-0">
        
        {/* Dynamic Vertical Connecting Line */}
        <div className={`absolute left-[19px] top-[28px] bottom-[28px] w-[2px] rounded-full transition-colors duration-300 ${
          pickup && dropoff ? 'bg-movyra-blue' : 'bg-gray-200 border border-dashed border-gray-300'
        }`}></div>
        
        {/* Pickup Input Node */}
        <div className="relative">
          <div className={`absolute -left-10 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-[4px] z-10 transition-colors duration-300 ${
            pickup ? 'bg-white border-movyra-blue' : 'bg-white border-gray-300'
          }`}></div>
          
          <div 
            onClick={() => handleFieldFocus('pickup')} 
            className={`w-full bg-white rounded-2xl flex items-center px-4 py-4 border-2 transition-all duration-300 shadow-sm cursor-text ${
              activeField === 'pickup' ? 'border-movyra-blue shadow-md shadow-movyra-blue/10' : 'border-gray-100 hover:border-blue-200'
            }`}
          >
            <input 
              type="text" 
              value={activeField === 'pickup' ? query : (pickup?.address || '')} 
              onChange={(e) => { if (activeField === 'pickup') setQuery(e.target.value); }} 
              placeholder="Enter pickup location" 
              readOnly={activeField !== 'pickup'}
              className="bg-transparent w-full outline-none text-gray-900 text-[15px] font-bold placeholder:text-gray-300 placeholder:font-bold cursor-text" 
            />
            {activeField === 'pickup' && query && (
              <button onClick={(e) => { e.stopPropagation(); setQuery(''); setPickup(null); }} className="text-gray-400 hover:text-gray-600 ml-2">
                <X size={18} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* Dropoff Input Node */}
        <div className="relative">
          <div className={`absolute -left-[42px] top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center z-10 transition-colors duration-300 ${
            dropoff ? 'text-movyra-blue' : 'text-gray-300'
          }`}>
             <div className="w-2.5 h-2.5 bg-current rounded-sm"></div>
          </div>
          
          <div 
            onClick={() => handleFieldFocus('dropoff')} 
            className={`w-full bg-white rounded-2xl flex items-center px-4 py-4 border-2 transition-all duration-300 shadow-sm cursor-text ${
              activeField === 'dropoff' ? 'border-movyra-blue shadow-md shadow-movyra-blue/10' : 'border-gray-100 hover:border-blue-200'
            }`}
          >
            <input 
              type="text" 
              value={activeField === 'dropoff' ? query : (dropoff?.address || '')} 
              onChange={(e) => { if (activeField === 'dropoff') setQuery(e.target.value); }} 
              placeholder="Enter destination" 
              readOnly={activeField !== 'dropoff'}
              className="bg-transparent w-full outline-none text-gray-900 text-[15px] font-bold placeholder:text-gray-300 placeholder:font-bold cursor-text" 
            />
            {activeField === 'dropoff' && query && (
              <button onClick={(e) => { e.stopPropagation(); setQuery(''); setDropoff(null); }} className="text-gray-400 hover:text-gray-600 ml-2">
                <X size={18} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 5: Live Results Matrix & Scrolling List */}
      <div className="flex-1 overflow-y-auto min-h-[150px] mb-4 no-scrollbar">
        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-8 text-movyra-blue gap-3"
            >
              <Loader2 className="animate-spin" size={32} />
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Scanning Satellite Data</span>
            </motion.div>
          ) : results.length > 0 ? (
            <motion.div 
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              {results.map((place, idx) => (
                <motion.div 
                  key={place.place_id || idx} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleSelect(place)} 
                  className="flex items-center gap-4 p-4 rounded-[24px] hover:bg-gray-50 active:bg-blue-50 cursor-pointer border border-transparent hover:border-gray-100 transition-colors group"
                >
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-movyra-blue group-hover:shadow-sm border border-gray-100 transition-all flex-shrink-0">
                    <MapPin size={20} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 overflow-hidden flex flex-col justify-center">
                    <p className="font-black text-[15px] text-gray-900 truncate tracking-wide">
                      {place.display_name.split(',')[0]}
                    </p>
                    <p className="text-[12px] font-bold text-gray-400 truncate mt-0.5">
                      {place.display_name.split(',').slice(1).join(',')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
             <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-10 opacity-50"
             >
                <Map size={48} strokeWidth={1.5} className="text-gray-300 mb-3" />
                <p className="text-sm font-bold text-gray-400">Search for a location to continue</p>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SECTION 6: Action Validation Engine */}
      <div className="pt-2 flex-shrink-0">
        <motion.button 
          onClick={() => { if (pickup && dropoff) onAddressesSet(); }}
          disabled={!pickup || !dropoff}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-movyra-blue text-white py-5 rounded-2xl font-black text-[16px] tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-movyra-blue/20 disabled:opacity-50 disabled:shadow-none disabled:bg-gray-200 disabled:text-gray-400 transition-all"
        >
          Confirm Route <Navigation size={20} strokeWidth={2.5} />
        </motion.button>
      </div>

    </motion.div>
  );
}