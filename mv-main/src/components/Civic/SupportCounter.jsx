import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Navigation } from 'lucide-react';
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
        <div className="flex flex-col gap-4 w-full">
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

            <div className={`w-full h-[300px] rounded-2xl overflow-hidden border ${
                theme === 'light' ? 'border-[#cccccc]' : 'border-[#333333]'
            }`}>
                <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                    <TileLayer url={tileUrl} />
                    <MapController center={position} />
                    <ClickHandler setPosition={setPosition} onLocationSelect={onLocationSelect} />
                    <Marker position={position} />
                </MapContainer>
            </div>
            
            <p className={`text-[0.8rem] font-bold text-center mt-1 ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>
                Click anywhere on the map to place the reporting pin exactly.
            </p>
        </div>
    );
}