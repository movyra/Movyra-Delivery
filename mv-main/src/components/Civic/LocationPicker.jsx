import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Navigation, Search, MapPin } from 'lucide-react';
import { useCivicStore } from '../../store/useCivicStore';

// Fix to ensure default map pins load correctly across all browsers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Internal tool to handle user clicks on the map
function ClickHandler({ setPosition, onLocationSelect }) {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]);
            if (onLocationSelect) {
                onLocationSelect({ latitude: lat, longitude: lng });
            }
        }
    });
    return null;
}

// Internal tool to smoothly move the map to a new location
function MapController({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 15);
        }
    }, [center, map]);
    return null;
}

export default function LocationPicker({ onLocationSelect }) {
    const theme = useCivicStore((state) => state.theme);
    
    // Default starting view (Mumbai)
    const [position, setPosition] = useState([19.0760, 72.8777]); 
    const [isLoading, setIsLoading] = useState(false);
    
    // Autocomplete Search States
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchTimeoutRef = useRef(null);

    // Debounced OpenStreetMap Nominatim API call
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (searchQuery.trim().length < 3) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }

        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                // Requesting address details including the postcode
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=5`);
                const data = await response.json();
                setSuggestions(data);
                setShowDropdown(true);
            } catch (error) {
                console.error("Address lookup failed:", error);
            } finally {
                setIsSearching(false);
            }
        }, 600); // 600ms debounce to prevent API rate limiting

        return () => clearTimeout(searchTimeoutRef.current);
    }, [searchQuery]);

    const handleSuggestionSelect = (place) => {
        const lat = parseFloat(place.lat);
        const lon = parseFloat(place.lon);
        
        setPosition([lat, lon]);
        setSearchQuery(place.display_name);
        setShowDropdown(false);
        
        if (onLocationSelect) {
            onLocationSelect({ latitude: lat, longitude: lon });
        }
    };

    const getUserLocation = () => {
        setIsLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setPosition([latitude, longitude]);
                    if (onLocationSelect) {
                        onLocationSelect({ latitude, longitude });
                    }
                    setIsLoading(false);
                },
                (error) => {
                    console.error("Location access denied by user or system.");
                    setIsLoading(false);
                }
            );
        } else {
            setIsLoading(false);
        }
    };

    // Clean map layers that respond to light and dark modes
    const tileUrl = theme === 'light' 
        ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

    return (
        <div className="flex flex-col gap-4 w-full relative">
            
            {/* Search Input Area */}
            <div className="relative z-[900]">
                <div className={`flex items-center px-4 py-3 rounded-xl border transition-colors ${
                    theme === 'light' ? 'bg-[#f5f5f5] border-[#cccccc] focus-within:border-black' : 'bg-[#000000] border-[#333333] focus-within:border-white'
                }`}>
                    <Search size={18} className={`mr-3 ${theme === 'light' ? 'text-[#888888]' : 'text-[#555555]'}`} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for an address or pincode..."
                        className="w-full bg-transparent outline-none text-[0.95rem] font-medium"
                    />
                    {isSearching && (
                        <div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ml-3 ${
                            theme === 'light' ? 'border-black' : 'border-white'
                        }`}></div>
                    )}
                </div>

                {/* Autocomplete Dropdown */}
                {showDropdown && suggestions.length > 0 && (
                    <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-2xl overflow-hidden max-h-[250px] overflow-y-auto ${
                        theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'
                    }`}>
                        {suggestions.map((place) => (
                            <button
                                key={place.place_id}
                                type="button"
                                onClick={() => handleSuggestionSelect(place)}
                                className={`w-full text-left p-4 flex flex-col border-b transition-colors outline-none last:border-b-0 ${
                                    theme === 'light' ? 'border-[#f0f0f0] hover:bg-[#f9f9f9]' : 'border-[#222222] hover:bg-[#1a1a1a]'
                                }`}
                            >
                                <span className={`text-[0.9rem] font-bold mb-1 truncate ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                                    {place.display_name.split(',')[0]}
                                </span>
                                <div className="flex items-center justify-between w-full">
                                    <span className={`text-[0.75rem] truncate max-w-[70%] ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>
                                        {place.display_name}
                                    </span>
                                    {place.address && place.address.postcode && (
                                        <span className={`text-[0.7rem] font-mono px-2 py-0.5 rounded border ${
                                            theme === 'light' ? 'bg-[#f5f5f5] border-[#e0e0e0] text-[#555555]' : 'bg-[#000000] border-[#333333] text-[#aaaaaa]'
                                        }`}>
                                            PIN: {place.address.postcode}
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <button 
                type="button"
                onClick={getUserLocation}
                disabled={isLoading}
                className={`flex items-center justify-center gap-2 p-4 rounded-xl font-bold text-[0.95rem] transition-colors border outline-none ${
                    theme === 'light' ? 'bg-[#f5f5f5] text-black border-[#cccccc] hover:border-black' : 'bg-[#111111] text-white border-[#333333] hover:border-white'
                }`}
            >
                <Navigation size={18} />
                {isLoading ? "Locating Device..." : "Use Current Location"}
            </button>

            <div className={`w-full h-[300px] rounded-2xl overflow-hidden border z-0 relative ${
                theme === 'light' ? 'border-[#cccccc]' : 'border-[#333333]'
            }`}>
                <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                    <TileLayer url={tileUrl} />
                    <MapController center={position} />
                    <ClickHandler setPosition={setPosition} onLocationSelect={onLocationSelect} />
                    <Marker position={position} />
                </MapContainer>
            </div>
            
            <p className={`text-[0.8rem] font-bold text-center mt-1 flex items-center justify-center gap-1 ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>
                <MapPin size={14}/> Click anywhere on the map to place the reporting pin exactly.
            </p>
        </div>
    );
}