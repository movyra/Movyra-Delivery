import React, { useState, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import useBookingStore from '../../store/useBookingStore';

export default function AddressInputSheet({ onAddressesSet }) {
  const { pickup, dropoff, setPickup, setDropoff } = useBookingStore();
  const [activeField, setActiveField] = useState('pickup');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query || query.length < 3) { setResults([]); return; }
    const searchAddress = async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`);
        const data = await res.json();
        setResults(data);
      } catch (err) { console.error(err); } finally { setIsSearching(false); }
    };
    const debounce = setTimeout(searchAddress, 800);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (place) => {
    const loc = { address: place.display_name.split(',').slice(0, 3).join(','), lat: parseFloat(place.lat), lng: parseFloat(place.lon) };
    if (activeField === 'pickup') { setPickup(loc); setActiveField('dropoff'); setQuery(''); } 
    else { setDropoff(loc); setQuery(''); if (pickup) onAddressesSet(); }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-surfaceBlack rounded-t-[40px] px-6 pt-8 pb-12 shadow-[0_-20px_40px_rgba(0,0,0,0.8)] z-40">
      <div className="w-12 h-1.5 bg-surfaceDarker rounded-full mx-auto mb-8"></div>
      <h2 className="text-2xl font-bold text-white mb-6">Where to?</h2>
      <div className="relative pl-8 space-y-4 mb-6">
        <div className="absolute left-[11px] top-[24px] bottom-[24px] w-[2px] bg-surfaceDarker"></div>
        <div className="relative">
          <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-surfaceDarker border-2 border-textGray z-10"></div>
          <div onClick={() => setActiveField('pickup')} className={`w-full bg-surfaceDark rounded-2xl flex items-center px-4 py-3 border ${activeField === 'pickup' ? 'border-movyraMint bg-surfaceDarker' : 'border-white/5'}`}>
            <input type="text" value={activeField === 'pickup' ? query : (pickup?.address || '')} onChange={(e) => setQuery(e.target.value)} placeholder="Current Location" className="bg-transparent w-full outline-none text-white text-sm" />
          </div>
        </div>
        <div className="relative">
          <div className="absolute -left-[35px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-movyraMint/20 flex items-center justify-center z-10"><div className="w-2 h-2 rounded-full bg-movyraMint"></div></div>
          <div onClick={() => setActiveField('dropoff')} className={`w-full bg-surfaceDark rounded-2xl flex items-center px-4 py-3 border ${activeField === 'dropoff' ? 'border-movyraMint bg-surfaceDarker' : 'border-white/5'}`}>
            <input type="text" value={activeField === 'dropoff' ? query : (dropoff?.address || '')} onChange={(e) => setQuery(e.target.value)} placeholder="Destination" className="bg-transparent w-full outline-none text-white text-sm" />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto min-h-[200px]">
        {isSearching ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-movyraMint" size={24} /></div> : 
          <div className="space-y-2">
            {results.map((place, idx) => (
              <div key={idx} onClick={() => handleSelect(place)} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-surfaceDark cursor-pointer">
                <div className="w-10 h-10 bg-surfaceDarker rounded-full flex items-center justify-center text-textGray"><MapPin size={18} /></div>
                <div className="flex-1 overflow-hidden"><p className="font-bold text-sm text-white truncate">{place.display_name.split(',')[0]}</p><p className="text-xs text-textGray truncate">{place.display_name.split(',').slice(1).join(',')}</p></div>
              </div>
            ))}
          </div>}
      </div>
    </div>
  );
}
