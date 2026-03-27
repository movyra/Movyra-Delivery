import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MapPin, Navigation, Search, Loader2 } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import MapLibreWrapper from '../components/MapLibreWrapper';

export default function LocationPicker() {
  const navigate = useNavigate();
  const { setPickup, setDropoff, bookingData } = useBooking();
  
  // Local state for UI inputs
  const [pickupInput, setPickupInput] = useState(bookingData.pickup?.address || '');
  const [dropoffInput, setDropoffInput] = useState(bookingData.dropoff?.address || '');
  
  // Focused input: 'pickup' or 'dropoff'
  const [activeField, setActiveField] = useState('dropoff');
  
  // Autocomplete Suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Debounce ref
  const searchTimeout = useRef(null);

  // Search OpenStreetMap Nominatim API
  const searchAddress = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      // Using standard Nominatim endpoint. In prod, consider rate limits.
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: query,
          format: 'json',
          limit: 5,
          addressdetails: 1
        }
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error("Geocoding error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Input Changes with Debounce
  const handleInputChange = (e, field) => {
    const value = e.target.value;
    if (field === 'pickup') setPickupInput(value);
    else setDropoffInput(value);

    setActiveField(field);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    searchTimeout.current = setTimeout(() => {
      searchAddress(value);
    }, 500); // 500ms debounce
  };

  // Handle Select Suggestion
  const handleSelectSuggestion = (place) => {
    const locationObj = {
      address: place.display_name,
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon)
    };

    if (activeField === 'pickup') {
      setPickupInput(place.display_name);
      setPickup(locationObj);
      if (!dropoffInput) setActiveField('dropoff'); // Auto advance
      else setSuggestions([]);
    } else {
      setDropoffInput(place.display_name);
      setDropoff(locationObj);
      setSuggestions([]);
    }
  };

  const handleConfirmLocations = () => {
    if (bookingData.pickup && bookingData.dropoff) {
      navigate('/parcel-type');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative font-sans">
      {/* Top Absolute UI Panel */}
      <div className="absolute top-0 inset-x-0 z-10 bg-white/95 backdrop-blur-md shadow-md rounded-b-[2rem] pt-6 pb-6 px-4">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold tracking-tight">Plan your delivery</h1>
        </div>

        {/* Input Fields */}
        <div className="relative pl-10 pr-2 space-y-3">
          {/* Timeline Connector Graphic */}
          <div className="absolute left-[15px] top-[22px] bottom-[22px] w-[2px] bg-black"></div>
          
          {/* Pickup Input */}
          <div className="relative flex items-center">
            <div className="absolute left-[-29px] w-2 h-2 rounded-full border-2 border-black bg-white z-20"></div>
            <input
              type="text"
              value={pickupInput}
              onChange={(e) => handleInputChange(e, 'pickup')}
              onFocus={() => setActiveField('pickup')}
              placeholder="Pickup location"
              className="w-full bg-[#F3F3F3] border-none rounded-lg py-3.5 px-4 text-black font-medium focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          {/* Dropoff Input */}
          <div className="relative flex items-center">
            <div className="absolute left-[-29px] w-2 h-2 bg-black z-20"></div>
            <input
              type="text"
              value={dropoffInput}
              onChange={(e) => handleInputChange(e, 'dropoff')}
              onFocus={() => setActiveField('dropoff')}
              placeholder="Where to?"
              className="w-full bg-[#F3F3F3] border-none rounded-lg py-3.5 px-4 text-black font-medium focus:ring-2 focus:ring-black outline-none"
            />
          </div>
        </div>

        {/* Suggestions Dropdown Layer */}
        {suggestions.length > 0 && (
          <div className="mt-4 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto hide-scrollbar">
            {isSearching ? (
              <div className="p-4 flex justify-center text-gray-400"><Loader2 className="animate-spin" size={20}/></div>
            ) : (
              suggestions.map((place) => (
                <div 
                  key={place.place_id}
                  onClick={() => handleSelectSuggestion(place)}
                  className="flex items-start gap-3 p-4 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <MapPin size={18} className="text-gray-400 mt-1 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="font-bold text-[15px] truncate">{place.name || place.display_name.split(',')[0]}</p>
                    <p className="text-sm text-gray-500 truncate">{place.display_name}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Map Background Wrapper */}
      <div className="flex-1 bg-gray-200">
        <MapLibreWrapper 
           pickup={bookingData.pickup ? [bookingData.pickup.lng, bookingData.pickup.lat] : null}
           dropoff={bookingData.dropoff ? [bookingData.dropoff.lng, bookingData.dropoff.lat] : null}
           // We don't have driver or route yet at this stage
           driver={null} 
           routeCoordinates={[]}
        />
      </div>

      {/* Bottom Confirm Button */}
      <div className="absolute bottom-6 inset-x-4 z-10">
        <button
          onClick={handleConfirmLocations}
          disabled={!bookingData.pickup || !bookingData.dropoff}
          className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg shadow-xl disabled:opacity-50 disabled:bg-gray-400 flex justify-center items-center transition-all active:scale-[0.98]"
        >
          {(!bookingData.pickup || !bookingData.dropoff) ? 'Enter locations to continue' : 'Confirm Locations'}
        </button>
      </div>
    </div>
  );
}