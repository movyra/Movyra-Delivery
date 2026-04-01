import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Plus, Home, Briefcase, 
  Trash2, Loader2, X, AlertCircle 
} from 'lucide-react';

// Premium Design System Components
import LineIconRegistry from '../../components/Icons/LineIconRegistry';
import SystemButton from '../../components/UI/SystemButton';

// Real Services & Database Integration
import { fetchUserAddresses, saveAddressPin } from '../../services/firestore';
import { fetchPlacePredictions, geocodeAddress } from '../../services/googleMaps';
import { getFirestore, doc, deleteDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

/**
 * PAGE: SAVED ADDRESSES (PREMIUM CARD UI)
 * Architecture: Detached 32px rounded cards on #F2F4F7 background.
 * Features: 
 * - Real-time Firestore sync with strict onAuthStateChanged listener
 * - OpenStreetMap Photon Geocoding
 * - Animated Custom Location Modals
 * - Strict Line Art & Typography synchronization
 */

export default function SavedAddresses() {
  const navigate = useNavigate();
  const db = getFirestore();
  const auth = getAuth();

  // Local State
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Add New Address Overlay State
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // New Address Draft State
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [labelType, setLabelType] = useState('home'); // 'home' | 'work' | 'custom'
  const [customName, setCustomName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // ============================================================================
  // LOGIC: FETCH SAVED ADDRESSES (WITH STRICT AUTH RACE-CONDITION FIX)
  // ============================================================================
  const loadAddresses = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchUserAddresses();
      setAddresses(data);
    } catch (err) {
      console.error("Failed to load addresses:", err);
      setError('Could not load your address book. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // STRICT FIX: Wait for Firebase Auth to initialize before querying Firestore
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadAddresses();
      } else {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // ============================================================================
  // LOGIC: OPENSTREETMAP AUTOCOMPLETE & GEOCODING
  // ============================================================================
  useEffect(() => {
    const fetchTimer = setTimeout(async () => {
      if (searchQuery.trim().length > 2 && !selectedPlace) {
        setIsSearching(true);
        try {
          const results = await fetchPlacePredictions(searchQuery);
          setPredictions(results || []);
        } catch (err) {
          console.error("Autocomplete Error:", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setPredictions([]);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(fetchTimer);
  }, [searchQuery, selectedPlace]);

  const handleSelectPrediction = async (prediction) => {
    if (!prediction) return;
    
    // Safety check for the OSM description format
    const displayString = prediction.description || 'Unknown Location';
    setSearchQuery(displayString);
    setPredictions([]);
    setIsSearching(true);
    
    try {
      // Passes the embedded coordinates (place_id) or the raw string to the OSM Geocoder
      const geocoded = await geocodeAddress(prediction.place_id || displayString);
      setSelectedPlace(geocoded);
    } catch (err) {
      console.error("Geocoding Error:", err);
      setError('Failed to pinpoint this location on the map.');
    } finally {
      setIsSearching(false);
    }
  };

  // ============================================================================
  // LOGIC: CRUD OPERATIONS (FIRESTORE)
  // ============================================================================
  const handleSaveAddress = async () => {
    if (!selectedPlace) return;
    if (labelType === 'custom' && !customName.trim()) {
      setError('Please provide a name for this custom location.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const newAddress = {
        type: labelType,
        name: labelType === 'custom' ? customName.trim() : labelType.charAt(0).toUpperCase() + labelType.slice(1),
        address: selectedPlace.formattedAddress,
        lat: selectedPlace.lat,
        lng: selectedPlace.lng
      };

      await saveAddressPin(newAddress);
      
      // Reset form and reload list
      setIsAdding(false);
      setSearchQuery('');
      setSelectedPlace(null);
      setLabelType('home');
      setCustomName('');
      loadAddresses();

    } catch (err) {
      console.error("Save Address Error:", err);
      setError('Failed to save the address to your profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      // Optimistic UI update
      setAddresses(prev => prev.filter(addr => addr.id !== id));
      // Real database deletion
      await deleteDoc(doc(db, 'saved_addresses', id));
    } catch (err) {
      console.error("Failed to delete address:", err);
      loadAddresses(); // Revert on failure
    }
  };

  // Helper to render the correct icon based on type
  const getIconForType = (type) => {
    if (type === 'home') return <Home size={20} strokeWidth={2.5} />;
    if (type === 'work') return <Briefcase size={20} strokeWidth={2.5} />;
    return <LineIconRegistry name="mapPin" size={20} strokeWidth={2.5} />;
  };

  // Safe split helper for OSM descriptions
  const getMainAndSecondaryText = (description) => {
    if (!description) return { main: 'Unknown Location', secondary: '' };
    const parts = description.split(',');
    return {
      main: parts[0] ? parts[0].trim() : 'Unknown Location',
      secondary: parts.slice(1).join(',').trim() || ''
    };
  };

  // ============================================================================
  // RENDER UI
  // ============================================================================
  return (
    <div className="min-h-[100dvh] bg-[#F2F4F7] text-[#111111] flex flex-col font-sans relative overflow-hidden">
      
      {/* SECTION 1: Isolated Circular Navigation */}
      <div className="px-6 pt-14 pb-4 flex items-center gap-4 sticky top-0 z-40 bg-[#F2F4F7]/90 backdrop-blur-md">
        <button 
          onClick={() => navigate(-1)} 
          className="w-[46px] h-[46px] bg-white rounded-full flex items-center justify-center text-[#111111] shadow-[0_4px_15px_rgba(0,0,0,0.08)] active:scale-95 transition-all shrink-0"
        >
          <ChevronLeft size={24} strokeWidth={2.5} className="-ml-0.5" />
        </button>
        <h1 className="text-[32px] font-black tracking-tighter text-[#111111] leading-none">
          Saved Places
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col px-6 pt-2 pb-32">
        
        {/* Global Error Display */}
        <AnimatePresence>
          {error && !isAdding && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 text-red-600 px-5 py-4 rounded-[24px] font-bold text-[13px] flex items-start gap-2 mb-6 shadow-sm border border-red-100"
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5" /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION 3: Address List */}
        <div className="space-y-4">
          {isLoading ? (
            // Loading Skeletons
            [1, 2, 3].map(i => (
              <div key={i} className="h-[90px] bg-white rounded-[32px] animate-pulse border border-gray-50/50" />
            ))
          ) : addresses.length === 0 ? (
            // Empty State
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-50">
                <LineIconRegistry name="mapPin" size={24} className="text-gray-400" strokeWidth={2.5} />
              </div>
              <h3 className="text-[20px] font-black text-[#111111] mb-1 tracking-tight">No saved addresses</h3>
              <p className="text-[14px] font-bold text-gray-400">Add locations to book faster.</p>
            </motion.div>
          ) : (
            // Populated List
            <AnimatePresence>
              {addresses.map((addr) => (
                <motion.div
                  key={addr.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-5 rounded-[32px] shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-50/50 hover:border-gray-200 transition-all flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-12 h-12 bg-[#F2F4F7] rounded-[18px] flex items-center justify-center text-gray-500 shrink-0">
                      {getIconForType(addr.type)}
                    </div>
                    <div className="truncate pr-4">
                      <h3 className="text-[16px] font-black text-[#111111] leading-tight mb-0.5 tracking-tight">{addr.name}</h3>
                      <p className="text-[13px] font-bold text-gray-400 truncate">{addr.address}</p>
                    </div>
                  </div>
                  
                  {/* Delete Button */}
                  <button 
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="w-10 h-10 rounded-full bg-[#F2F4F7] flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 active:scale-95 transition-all shrink-0"
                  >
                    <Trash2 size={18} strokeWidth={2.5} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* SECTION 4: Floating Add Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pt-4 bg-[#F2F4F7]/90 backdrop-blur-md border-t border-gray-200/50 z-30">
        <SystemButton onClick={() => setIsAdding(true)} variant="primary" icon={Plus}>
          Add New Address
        </SystemButton>
      </div>

      {/* ============================================================================ */}
      {/* OVERLAY: ADD NEW ADDRESS (FULL SCREEN)                                       */}
      {/* ============================================================================ */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 bg-[#F2F4F7] z-50 flex flex-col font-sans"
          >
            {/* Overlay Header */}
            <div className="pt-12 px-6 pb-4 flex items-center gap-4 bg-white border-b border-gray-100 shrink-0 shadow-sm">
              <button 
                onClick={() => {
                  setIsAdding(false);
                  setSearchQuery('');
                  setSelectedPlace(null);
                  setError('');
                }}
                className="w-[46px] h-[46px] rounded-full bg-[#F6F6F6] flex items-center justify-center text-[#111111] active:scale-95 shrink-0 transition-transform"
              >
                <ChevronLeft size={24} strokeWidth={2.5} className="-ml-0.5" />
              </button>
              <h2 className="text-[24px] font-black tracking-tighter text-[#111111]">New Location</h2>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col">
              
              {/* OpenStreetMap Search Input */}
              <div className="relative mb-6">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <LineIconRegistry name="search" size={20} strokeWidth={2.5} />
                </div>
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedPlace(null);
                    setError('');
                  }}
                  placeholder="Search building, street, or area..."
                  className="w-full bg-white py-4 pl-12 pr-4 rounded-[24px] font-bold text-[15px] text-[#111111] shadow-[0_4px_15px_rgba(0,0,0,0.02)] border-2 border-transparent focus:border-[#111111] transition-all outline-none"
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 size={18} className="animate-spin text-gray-400" />
                  </div>
                )}
              </div>

              {/* OSM Autocomplete Predictions List */}
              <AnimatePresence>
                {predictions.length > 0 && !selectedPlace && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                    className="bg-white border border-gray-100 rounded-[32px] shadow-[0_4px_15px_rgba(0,0,0,0.03)] overflow-hidden mb-6 p-2"
                  >
                    {predictions.map((pred) => {
                      const { main, secondary } = getMainAndSecondaryText(pred.description);
                      return (
                        <button
                          key={pred.place_id || pred.description}
                          onClick={() => handleSelectPrediction(pred)}
                          className="w-full text-left px-4 py-4 rounded-[24px] hover:bg-[#F6F6F6] active:bg-gray-100 transition-colors flex items-start gap-4"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#F2F4F7] flex items-center justify-center text-gray-500 shrink-0 mt-0.5">
                            <LineIconRegistry name="mapPin" size={18} strokeWidth={2.5} />
                          </div>
                          <div className="overflow-hidden flex-1">
                            <span className="block text-[16px] font-black text-[#111111] truncate mb-0.5">{main}</span>
                            {secondary && (
                              <span className="block text-[13px] font-bold text-gray-400 truncate">
                                {secondary}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Configuration Form (Shows only after a place is geocoded/selected) */}
              <AnimatePresence>
                {selectedPlace && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col">
                    
                    {/* Selected Address Preview */}
                    <div className="bg-[#BCE3FF] p-5 rounded-[28px] mb-8 border border-[#A5D5F9] shadow-sm">
                      <span className="block text-[11px] font-black text-[#4A6B85] uppercase tracking-widest mb-1.5">Pinpoint Accurate</span>
                      <p className="text-[15px] font-black text-[#111111] leading-snug">{selectedPlace.formattedAddress}</p>
                    </div>

                    {/* Label Selection */}
                    <h3 className="text-[13px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">Save As</h3>
                    <div className="flex gap-2 mb-6">
                      <button 
                        onClick={() => setLabelType('home')}
                        className={`flex-1 py-3 rounded-full text-[14px] font-bold flex items-center justify-center gap-2 border-2 transition-all active:scale-95 ${labelType === 'home' ? 'bg-[#111111] text-white border-[#111111] shadow-md' : 'bg-white text-[#111111] border-gray-100'}`}
                      >
                        <Home size={18} strokeWidth={2.5} /> Home
                      </button>
                      <button 
                        onClick={() => setLabelType('work')}
                        className={`flex-1 py-3 rounded-full text-[14px] font-bold flex items-center justify-center gap-2 border-2 transition-all active:scale-95 ${labelType === 'work' ? 'bg-[#111111] text-white border-[#111111] shadow-md' : 'bg-white text-[#111111] border-gray-100'}`}
                      >
                        <Briefcase size={18} strokeWidth={2.5} /> Work
                      </button>
                      <button 
                        onClick={() => setLabelType('custom')}
                        className={`flex-1 py-3 rounded-full text-[14px] font-bold flex items-center justify-center gap-2 border-2 transition-all active:scale-95 ${labelType === 'custom' ? 'bg-[#111111] text-white border-[#111111] shadow-md' : 'bg-white text-[#111111] border-gray-100'}`}
                      >
                        <LineIconRegistry name="mapPin" size={18} strokeWidth={2.5} /> Other
                      </button>
                    </div>

                    {/* Custom Label Input */}
                    <AnimatePresence>
                      {labelType === 'custom' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                          <input 
                            type="text"
                            value={customName}
                            onChange={(e) => { setCustomName(e.target.value); setError(''); }}
                            placeholder="e.g. Gym, Mom's House..."
                            className="w-full bg-white py-4 px-5 rounded-[24px] font-bold text-[16px] text-[#111111] shadow-sm border-2 border-transparent focus:border-[#111111] transition-all outline-none mb-6"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Overlay Error Handling */}
                    <AnimatePresence>
                      {error && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="bg-red-50 text-red-600 px-5 py-4 rounded-[24px] font-bold text-[13px] flex items-start gap-2 mb-6 border border-red-100"
                        >
                          <AlertCircle size={18} className="shrink-0 mt-0.5" /> {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Save Action */}
                    <div className="mt-auto pt-4 pb-4">
                      <SystemButton 
                        onClick={handleSaveAddress}
                        disabled={isSaving}
                        loading={isSaving}
                        variant="primary"
                      >
                        Save Address
                      </SystemButton>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}