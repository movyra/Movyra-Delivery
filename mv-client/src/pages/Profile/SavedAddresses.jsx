import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Plus, MapPin, Home, Briefcase, 
  Trash2, Loader2, Search, X, AlertCircle 
} from 'lucide-react';

// Real Services & Database Integration
import { fetchUserAddresses, saveAddressPin } from '../../services/firestore';
import { fetchPlacePredictions, geocodeAddress } from '../../services/googleMaps';
import { getFirestore, doc, deleteDoc } from 'firebase/firestore';

// ============================================================================
// PAGE: SAVED ADDRESSES (STARK MINIMALIST UI)
// Fully functional persistent address book. Connects directly to Firestore
// and utilizes the real OpenStreetMap Nominatim APIs.
// ============================================================================

export default function SavedAddresses() {
  const navigate = useNavigate();
  const db = getFirestore();

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
  // LOGIC: FETCH SAVED ADDRESSES
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
    loadAddresses();
  }, []);

  // ============================================================================
  // LOGIC: OPENSTREETMAP AUTOCOMPLETE & GEOCODING
  // ============================================================================
  useEffect(() => {
    const fetchTimer = setTimeout(async () => {
      if (searchQuery.trim().length > 2 && !selectedPlace) {
        setIsSearching(true);
        try {
          const results = await fetchPlacePredictions(searchQuery);
          setPredictions(results);
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
    setSearchQuery(prediction.description);
    setPredictions([]);
    setIsSearching(true);
    
    try {
      // Convert the human-readable string (or place_id coordinates) into exact GPS coordinates
      // Our refactored service allows passing the description directly to Nominatim
      const geocoded = await geocodeAddress(prediction.place_id || prediction.description);
      setSelectedPlace(geocoded);
    } catch (err) {
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
    return <MapPin size={20} strokeWidth={2.5} />;
  };

  // ============================================================================
  // RENDER UI
  // ============================================================================
  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans relative overflow-hidden">
      
      {/* SECTION 1: Top Navigation */}
      <div className="pt-12 px-6 pb-2 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-40 border-b border-gray-50">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-black hover:bg-gray-100 transition-colors active:scale-95"
        >
          <ChevronLeft size={28} strokeWidth={2.5} />
        </button>
        <div className="w-8 h-8 rounded-md overflow-hidden bg-black flex items-center justify-center">
          <img src="/logo.png" alt="Movyra" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col px-6 pt-6 pb-32">
        
        {/* SECTION 2: Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-[40px] font-black text-black leading-[1.05] tracking-tighter mb-3">
            Saved <br/>Addresses.
          </h1>
          <p className="text-[15px] text-gray-500 font-medium">
            Manage your frequent pickup and dropoff locations for faster booking.
          </p>
        </motion.div>

        {/* Global Error Display */}
        <AnimatePresence>
          {error && !isAdding && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 text-red-600 p-4 rounded-2xl font-bold text-sm flex items-start gap-2 mb-6"
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
              <div key={i} className="h-24 bg-[#F6F6F6] rounded-[24px] animate-pulse" />
            ))
          ) : addresses.length === 0 ? (
            // Empty State
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin size={24} className="text-gray-400" strokeWidth={2.5} />
              </div>
              <h3 className="text-[18px] font-black text-black mb-1">No saved addresses</h3>
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
                  className="bg-[#F6F6F6] p-5 rounded-[24px] border border-transparent hover:border-gray-200 transition-all flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-black shrink-0">
                      {getIconForType(addr.type)}
                    </div>
                    <div className="truncate pr-4">
                      <h3 className="text-[16px] font-black text-black leading-tight mb-0.5">{addr.name}</h3>
                      <p className="text-[13px] font-bold text-gray-500 truncate">{addr.address}</p>
                    </div>
                  </div>
                  
                  {/* Delete Button */}
                  <button 
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-red-500 hover:bg-red-50 active:scale-95 transition-all shrink-0 shadow-sm"
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
      <div className="fixed bottom-0 left-0 right-0 p-6 pt-4 bg-white/90 backdrop-blur-md border-t border-gray-100 z-30">
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center gap-2 px-6 bg-black text-white py-4 rounded-full font-bold text-[17px] hover:bg-gray-900 active:scale-[0.98] transition-all h-[60px] shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
        >
          <Plus size={20} strokeWidth={3} /> Add New Address
        </button>
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
            className="fixed inset-0 bg-white z-50 flex flex-col font-sans"
          >
            {/* Overlay Header */}
            <div className="pt-12 px-6 pb-4 flex items-center justify-between border-b border-gray-100 shrink-0">
              <h2 className="text-[24px] font-black tracking-tight text-black">New Location</h2>
              <button 
                onClick={() => {
                  setIsAdding(false);
                  setSearchQuery('');
                  setSelectedPlace(null);
                  setError('');
                }}
                className="w-10 h-10 rounded-full bg-[#F6F6F6] flex items-center justify-center text-black active:scale-95"
              >
                <X size={24} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col">
              
              {/* OpenStreetMap Search Input */}
              <div className="relative mb-6">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search size={20} strokeWidth={2.5} />
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
                  className="w-full bg-[#F6F6F6] py-4 pl-12 pr-4 rounded-2xl font-bold text-[16px] text-black border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none"
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 size={18} className="animate-spin text-gray-400" />
                  </div>
                )}
              </div>

              {/* Autocomplete Predictions List */}
              <AnimatePresence>
                {predictions.length > 0 && !selectedPlace && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                    className="bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden mb-6"
                  >
                    {predictions.map((pred) => (
                      <button
                        key={pred.place_id}
                        onClick={() => handleSelectPrediction(pred)}
                        className="w-full text-left px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-[#F6F6F6] active:bg-gray-100 transition-colors flex items-start gap-3"
                      >
                        <MapPin size={18} className="text-gray-400 shrink-0 mt-0.5" />
                        <div>
                          {/* Split the Nominatim comma-separated string to simulate Google's main_text / secondary_text UI */}
                          <span className="block text-[15px] font-bold text-black">{pred.description.split(',')[0]}</span>
                          <span className="block text-[13px] font-medium text-gray-500 truncate">
                            {pred.description.split(',').slice(1).join(',').trim() || pred.description}
                          </span>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Configuration Form (Shows only after a place is geocoded/selected) */}
              <AnimatePresence>
                {selectedPlace && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col">
                    
                    {/* Selected Address Preview */}
                    <div className="bg-[#E8F0FE] p-4 rounded-2xl mb-8 border border-blue-100">
                      <span className="block text-[11px] font-bold text-[#276EF1] uppercase tracking-widest mb-1">Pinpoint Accurate</span>
                      <p className="text-[14px] font-bold text-black leading-snug">{selectedPlace.formattedAddress}</p>
                    </div>

                    {/* Label Selection */}
                    <h3 className="text-[15px] font-bold text-gray-400 uppercase tracking-widest mb-4">Save As</h3>
                    <div className="flex gap-2 mb-6">
                      <button 
                        onClick={() => setLabelType('home')}
                        className={`flex-1 py-3 rounded-full text-[14px] font-bold flex items-center justify-center gap-2 border-2 transition-all active:scale-95 ${labelType === 'home' ? 'bg-black text-white border-black' : 'bg-[#F6F6F6] text-black border-transparent'}`}
                      >
                        <Home size={18} /> Home
                      </button>
                      <button 
                        onClick={() => setLabelType('work')}
                        className={`flex-1 py-3 rounded-full text-[14px] font-bold flex items-center justify-center gap-2 border-2 transition-all active:scale-95 ${labelType === 'work' ? 'bg-black text-white border-black' : 'bg-[#F6F6F6] text-black border-transparent'}`}
                      >
                        <Briefcase size={18} /> Work
                      </button>
                      <button 
                        onClick={() => setLabelType('custom')}
                        className={`flex-1 py-3 rounded-full text-[14px] font-bold flex items-center justify-center gap-2 border-2 transition-all active:scale-95 ${labelType === 'custom' ? 'bg-black text-white border-black' : 'bg-[#F6F6F6] text-black border-transparent'}`}
                      >
                        <MapPin size={18} /> Other
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
                            className="w-full bg-[#F6F6F6] py-4 px-5 rounded-2xl font-bold text-[16px] text-black border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none mb-6"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Overlay Error Handling */}
                    <AnimatePresence>
                      {error && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="bg-red-50 text-red-600 p-4 rounded-2xl font-bold text-sm flex items-start gap-2 mb-6"
                        >
                          <AlertCircle size={18} className="shrink-0 mt-0.5" /> {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Save Action */}
                    <div className="mt-auto pt-4">
                      <button 
                        onClick={handleSaveAddress}
                        disabled={isSaving}
                        className="w-full flex items-center justify-center gap-2 px-6 bg-black text-white py-4 rounded-full font-bold text-[17px] hover:bg-gray-900 active:scale-[0.98] transition-all h-[60px] shadow-[0_10px_30px_rgba(0,0,0,0.2)] disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 size={24} className="animate-spin" /> : 'Save Address'}
                      </button>
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