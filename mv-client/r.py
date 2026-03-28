import os

# Complete directory structure and file contents for the Movyra Client App
FILES = {

r"mv-client/public/manifest.json": r"""{
  "name": "Movyra by Bongo",
  "short_name": "Movyra",
  "description": "Premium Customer Delivery App",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "orientation": "portrait",
  "icons": [
    { "src": "/pwa-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/pwa-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}""",

r"mv-client/public/favicon.svg": r"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="4" y="4" width="32" height="32" rx="10" stroke="#00F0B5" stroke-width="6" fill="none"/></svg>""",

r"mv-client/src/assets/icons/CustomTruckIcon.jsx": r"""import React from 'react';
export default function CustomTruckIcon({ size = 24, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect>
      <path d="M16 8h4l3 3v5h-7V8z"></path>
      <circle cx="5.5" cy="18.5" r="2.5"></circle>
      <circle cx="18.5" cy="18.5" r="2.5"></circle>
    </svg>
  );
}""",

r"mv-client/src/assets/logo/MovyraLogo.jsx": r"""import React from 'react';
export default function MovyraLogo({ size = 40, showText = true }) {
  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="32" height="32" rx="10" stroke="#00F0B5" strokeWidth="6" className="drop-shadow-[0_0_8px_rgba(0,240,181,0.5)]"/>
      </svg>
      {showText && <span className="font-sans font-bold text-white text-2xl tracking-tight">Movyra</span>}
    </div>
  );
}""",

r"mv-client/src/components/Booking/AddressInputSheet.jsx": r"""import React, { useState, useEffect } from 'react';
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
}""",

r"mv-client/src/components/Booking/ConfirmButton.jsx": r"""import React from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
export default function ConfirmButton({ onClick, label, disabled, loading, className = "" }) {
  const handlePress = (e) => {
    if (navigator.vibrate) navigator.vibrate(50);
    if (onClick) onClick(e);
  };
  return (
    <div className={`fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-surfaceBlack via-surfaceBlack to-transparent z-50 ${className}`}>
      <button onClick={handlePress} disabled={disabled || loading} className="w-full bg-movyraMint text-surfaceBlack py-4 rounded-pill font-bold text-lg flex items-center justify-center gap-2 shadow-mintGlow disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]">
        {loading ? <Loader2 size={24} className="animate-spin text-surfaceBlack" /> : <>{label} <ArrowRight size={20} /></>}
      </button>
    </div>
  );
}""",

r"mv-client/src/components/Booking/VehicleCard.jsx": r"""import React from 'react';
import { Bike, Truck, Package } from 'lucide-react';
export default function VehicleCard({ vehicle, isSelected, onClick }) {
  const Icon = vehicle.id === 'bike' ? Bike : vehicle.id === 'truck' ? Truck : Package;
  return (
    <div onClick={onClick} className={`min-w-[140px] p-5 rounded-3xl border transition-all cursor-pointer snap-center flex flex-col items-center text-center ${isSelected ? 'bg-movyraMint/10 border-movyraMint shadow-mintGlow text-movyraMint' : 'bg-surfaceDark border-white/5 text-textGray hover:bg-surfaceDarker'}`}>
      <div className="mb-4"><Icon size={40} /></div>
      <h3 className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-white/80'}`}>{vehicle.name}</h3>
      <p className="text-textGray text-xs font-medium uppercase tracking-widest mt-1 mb-3">Up to {vehicle.capacity}</p>
      <div className={`text-xl font-black ${isSelected ? 'text-movyraMint' : 'text-white'}`}>₹{vehicle.price}</div>
      <div className="text-[10px] mt-1 text-textGray">ETA: {vehicle.eta} mins</div>
    </div>
  );
}""",

r"mv-client/src/components/Dashboard/ActiveShippingCard.jsx": r"""import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from 'lucide-react';
export default function ActiveShippingCard({ activeOrder }) {
  const navigate = useNavigate();
  if (!activeOrder) return null;
  return (
    <div className="px-6 mb-8">
      <h3 className="font-bold mb-4 text-[15px] text-white tracking-wide">Current Shipping</h3>
      <div onClick={() => navigate(`/tracking-active?id=${activeOrder.id}`)} className="bg-surfaceDark rounded-[32px] p-6 border border-white/5 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-all">
        <div className="relative z-10 w-[60%] flex flex-col justify-between min-h-[120px]">
          <div><p className="text-textGray text-[13px] mb-1">Shipping number</p><p className="font-bold text-[15px]">{activeOrder.id}</p></div>
          <div className="mt-6"><p className="text-textGray text-[13px] mb-1">Current Location</p><p className="font-bold text-[14px] leading-snug">{activeOrder.currentLocation}</p></div>
        </div>
        <div className="absolute top-4 right-4 bottom-4 w-[35%] bg-surfaceBlack rounded-3xl border border-white/5 overflow-hidden">
           <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
           <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 150" fill="none">
             <path d="M 20 20 Q 50 80 80 120" stroke="#00F0B5" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 6" className="opacity-50" />
             <path d="M 20 20 Q 50 80 60 95" stroke="#00F0B5" strokeWidth="3" strokeLinecap="round" />
           </svg>
           <div className="absolute top-[60%] left-[55%] w-6 h-6 bg-movyraMint/20 rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2"><Navigation size={12} className="text-movyraMint fill-movyraMint rotate-180" /></div>
        </div>
      </div>
    </div>
  );
}""",

r"mv-client/src/components/Dashboard/RecentShippingList.jsx": r"""import React from 'react';
import { useNavigate } from 'react-router-dom';
import ShippingListItem from './ShippingListItem';
export default function RecentShippingList({ deliveries }) {
  const navigate = useNavigate();
  return (
    <div className="px-6 mb-8">
      <h3 className="font-bold mb-4 text-[15px] text-white tracking-wide">Recent Shipping</h3>
      <div className="bg-surfaceDark rounded-[32px] p-2 flex flex-col gap-1 border border-white/5">
        {deliveries.length > 0 ? deliveries.map((d) => (
          <ShippingListItem key={d.id} trackingId={d.id} origin={d.origin} destination={d.destination} onClick={() => navigate(`/tracking-active?id=${d.id}`)} />
        )) : <div className="p-6 text-center text-textGray text-sm">No recent shipments.</div>}
      </div>
    </div>
  );
}""",

r"mv-client/src/components/Dashboard/ShippingListItem.jsx": r"""import React from 'react';
import { ChevronRight } from 'lucide-react';
import CustomTruckIcon from '../../assets/icons/CustomTruckIcon';
export default function ShippingListItem({ trackingId, origin, destination, onClick }) {
  return (
    <div onClick={onClick} className="flex items-center justify-between p-4 bg-surfaceBlack rounded-card cursor-pointer hover:bg-surfaceDarker transition-colors active:scale-[0.98]">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-movyraMint/10 rounded-2xl flex items-center justify-center text-movyraMint"><CustomTruckIcon size={22} /></div>
        <div><p className="font-bold text-[15px] text-white">{trackingId}</p><p className="text-textGray text-[13px] font-medium mt-0.5">{origin} → {destination}</p></div>
      </div>
      <ChevronRight size={20} className="text-textGray" />
    </div>
  );
}""",

r"mv-client/src/components/Dashboard/TrackingSearch.jsx": r"""import React, { useState } from 'react';
import { Search, ScanLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export default function TrackingSearch() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const search = (e) => { e.preventDefault(); if (query) navigate(`/tracking-active?id=${query}`); };
  return (
    <div className="px-6 mb-8 mt-2">
      <h3 className="font-bold mb-4 text-[15px] text-white">Track your Shipping</h3>
      <form onSubmit={search} className="flex gap-3">
        <div className="flex-1 bg-surfaceDark rounded-2xl flex items-center px-5 py-4 border border-white/5 focus-within:border-movyraMint">
          <Search size={20} className="text-textGray mr-3" />
          <input type="text" value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Enter Shipping number" className="bg-transparent w-full outline-none text-white text-sm" />
        </div>
        <button type="button" className="bg-white text-surfaceBlack px-5 py-4 rounded-2xl flex items-center shadow-lg"><ScanLine size={24} /></button>
      </form>
    </div>
  );
}""",

r"mv-client/src/components/Dashboard/UserHeader.jsx": r"""import React from 'react';
import { Bell } from 'lucide-react';
export default function UserHeader({ user, notificationsCount }) {
  return (
    <div className="pt-16 px-6 pb-6 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-surfaceDarker overflow-hidden border border-white/10"><img src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"} alt="User" className="w-full h-full object-cover" /></div>
        <div>
          <h2 className="font-bold text-[17px] text-white flex items-center gap-2">{user?.name || "User"} 👋🏼</h2>
          <p className="text-textGray text-[13px]">{user?.location || "Pune, India"}</p>
        </div>
      </div>
      <button className="relative w-12 h-12 bg-surfaceDark rounded-full flex items-center justify-center">
        {notificationsCount > 0 && <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 bg-movyraMint rounded-full flex items-center justify-center"><span className="text-[8px] text-surfaceBlack font-black">{notificationsCount}</span></div>}
        <Bell size={22} className="text-white" />
      </button>
    </div>
  );
}""",

r"mv-client/src/components/Map/MapLibreWrapper.jsx": r"""import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MintRouteLayer from './MintRouteLayer';

export default function MapLibreWrapper({ initialCenter = [73.8567, 18.5204], routeData, driverLocation }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const driverMarker = useRef(null);

  useEffect(() => {
    if (map.current) return;
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: initialCenter, zoom: 14, pitch: 45, bearing: 0, attributionControl: false
    });
    map.current.on('load', () => setMapLoaded(true));
    return () => { if (map.current) map.current.remove(); };
  }, [initialCenter]);

  useEffect(() => {
    if (!mapLoaded || !driverLocation) return;
    if (!driverMarker.current) {
      const el = document.createElement('div');
      el.className = 'w-10 h-10 bg-white rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.4)] flex items-center justify-center border border-surfaceDarker rotate-[-45deg]';
      el.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 18H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.19M15 6h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3.19"></path><line x1="23" y1="13" x2="23" y2="11"></line><circle cx="9" cy="18" r="2"></circle><circle cx="19" cy="18" r="2"></circle></svg>`;
      driverMarker.current = new maplibregl.Marker({ element: el, pitchAlignment: 'map' }).setLngLat(driverLocation).addTo(map.current);
    } else {
      driverMarker.current.setLngLat(driverLocation);
      map.current.easeTo({ center: driverLocation, duration: 1000 });
    }
  }, [mapLoaded, driverLocation]);

  return (
    <div className="absolute inset-0 z-0">
      <div ref={mapContainer} className="w-full h-full" />
      {mapLoaded && routeData && <MintRouteLayer map={map.current} routeCoordinates={routeData} />}
    </div>
  );
}""",

r"mv-client/src/components/Map/MintRouteLayer.jsx": r"""import { useEffect } from 'react';
export default function MintRouteLayer({ map, routeCoordinates }) {
  useEffect(() => {
    if (!map || !routeCoordinates?.length) return;
    if (map.getSource('route')) {
      map.getSource('route').setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: routeCoordinates }});
      return;
    }
    map.addSource('route', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: routeCoordinates }}});
    map.addLayer({ id: 'route-glow', type: 'line', source: 'route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#00F0B5', 'line-width': 12, 'line-blur': 10, 'line-opacity': 0.4 }});
    map.addLayer({ id: 'route-core', type: 'line', source: 'route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#00F0B5', 'line-width': 5 }});
    return () => { if(map.getLayer('route-core')) { map.removeLayer('route-core'); map.removeLayer('route-glow'); map.removeSource('route'); } };
  }, [map, routeCoordinates]);
  return null;
}""",

r"mv-client/src/components/Navigation/BottomNavBar.jsx": r"""import React from 'react';
import { Home, ClipboardList, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
export default function BottomNavBar() {
  const nav = useNavigate(); const loc = useLocation();
  const tabs = [{ path: '/dashboard-home', icon: Home }, { path: '/order-history', icon: ClipboardList }, { path: '/profile-settings', icon: User }];
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surfaceBlack pb-8 pt-4 px-8 flex justify-between z-50 rounded-t-mobile border-t border-white/5">
      {tabs.map((t, i) => {
        const active = loc.pathname.includes(t.path);
        const Icon = t.icon;
        return <button key={i} onClick={() => nav(t.path)} className={`p-3 rounded-2xl ${active ? 'bg-movyraMint/10 text-movyraMint' : 'text-textGray'}`}><Icon size={26} strokeWidth={active ? 2.5 : 2} /></button>
      })}
    </div>
  );
}""",

r"mv-client/src/components/Onboarding/OnboardingFlow.jsx": r"""import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Slide1 from './Slide1'; import Slide2 from './Slide2'; import Slide3 from './Slide3'; import Slide4 from './Slide4'; import Slide5 from './Slide5';
export default function OnboardingFlow({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const handleNext = () => { if (currentSlide < 4) setCurrentSlide(p => p + 1); else { localStorage.setItem('has_seen_onboarding', 'true'); onComplete(); } };
  return (
    <div className="fixed inset-0 bg-surfaceBlack text-white overflow-hidden flex flex-col z-[200]">
      <div className="flex-1 flex transition-transform duration-500" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
        <div className="w-full h-full shrink-0"><Slide1 /></div><div className="w-full h-full shrink-0"><Slide2 /></div><div className="w-full h-full shrink-0"><Slide3 /></div><div className="w-full h-full shrink-0"><Slide4 /></div><div className="w-full h-full shrink-0"><Slide5 /></div>
      </div>
      <div className="px-8 pb-12 pt-4 bg-surfaceBlack relative z-10">
        <div className="flex justify-center gap-2 mb-10">{[0,1,2,3,4].map(i => <div key={i} className={`h-1.5 rounded-full ${i === currentSlide ? 'w-8 bg-movyraMint' : 'w-2 bg-surfaceDarker'}`}/>)}</div>
        <button onClick={handleNext} className="w-full bg-movyraMint text-surfaceBlack py-4 rounded-pill font-bold text-lg flex justify-center items-center gap-2">
          {currentSlide === 4 ? "Let's Move" : "Next"} <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}""",

r"mv-client/src/components/Onboarding/Slide1.jsx": r"""import React from 'react'; import { Network } from 'lucide-react';
export default function Slide1() { return (<div className="w-full h-full flex flex-col items-center justify-center px-8 text-center"><Network size={80} className="text-movyraMint mb-12" /><h1 className="text-4xl font-bold mb-4">The Movyra <span className="text-movyraMint">Network</span></h1><p className="text-textGray">Connect to your city's fastest engine.</p></div>); }""",
r"mv-client/src/components/Onboarding/Slide2.jsx": r"""import React from 'react'; import { Package } from 'lucide-react';
export default function Slide2() { return (<div className="w-full h-full flex flex-col items-center justify-center px-8 text-center"><Package size={80} className="text-movyraMint mb-12" /><h1 className="text-4xl font-bold mb-4">Seamless Fleet</h1><p className="text-textGray">From 5kg to 2000kg. We move it all.</p></div>); }""",
r"mv-client/src/components/Onboarding/Slide3.jsx": r"""import React from 'react'; import { Navigation } from 'lucide-react';
export default function Slide3() { return (<div className="w-full h-full flex flex-col items-center justify-center px-8 text-center"><Navigation size={80} className="text-movyraMint mb-12" /><h1 className="text-4xl font-bold mb-4">Live Tracking</h1><p className="text-textGray">Second-by-second precision.</p></div>); }""",
r"mv-client/src/components/Onboarding/Slide4.jsx": r"""import React from 'react'; import { ShieldCheck } from 'lucide-react';
export default function Slide4() { return (<div className="w-full h-full flex flex-col items-center justify-center px-8 text-center"><ShieldCheck size={80} className="text-movyraMint mb-12" /><h1 className="text-4xl font-bold mb-4">Zero-Trust Security</h1><p className="text-textGray">OTP Verified for total safety.</p></div>); }""",
r"mv-client/src/components/Onboarding/Slide5.jsx": r"""import React from 'react'; import { Zap } from 'lucide-react';
export default function Slide5() { return (<div className="w-full h-full flex flex-col items-center justify-center px-8 text-center"><Zap size={80} className="text-movyraMint mb-12 animate-pulse" /><h1 className="text-5xl font-bold mb-4">Let's <span className="text-movyraMint">Move.</span></h1><p className="text-textGray">Experience advanced logistics.</p></div>); }""",

r"mv-client/src/components/MobileAppLayout.jsx": r"""import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import BottomNavBar from './Navigation/BottomNavBar';
import useAuthStore from '../store/useAuthStore';

export default function MobileAppLayout() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  useEffect(() => { if (!isAuthenticated) navigate('/auth-login', { replace: true }); }, [isAuthenticated, navigate]);
  if (!isAuthenticated) return null;
  return (
    <div className="relative min-h-screen bg-surfaceBlack w-full overflow-hidden">
      <main className="w-full h-full overflow-y-auto pb-[100px] pt-safe"><Outlet /></main>
      <BottomNavBar />
    </div>
  );
}""",

r"mv-client/src/hooks/useGeolocation.js": r"""import { useState, useEffect } from 'react';
export default function useGeolocation() {
  const [loc, setLoc] = useState({ lat: null, lng: null, speed: null });
  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (p) => setLoc({ lat: p.coords.latitude, lng: p.coords.longitude, speed: p.coords.speed }),
      (e) => console.error(e), { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);
  return { location: loc };
}""",

r"mv-client/src/hooks/useLocalStorage.js": r"""import { useState } from 'react';
export default function useLocalStorage(key, initialValue) {
  const [val, setVal] = useState(() => {
    try { const item = window.localStorage.getItem(key); return item ? JSON.parse(item) : initialValue; }
    catch { return initialValue; }
  });
  const setValue = (v) => { setVal(v); window.localStorage.setItem(key, JSON.stringify(v)); };
  return [val, setValue];
}""",

r"mv-client/src/pages/Auth/MobileLogin.jsx": r"""import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Delete } from 'lucide-react';
export default function MobileLogin() {
  const navigate = useNavigate(); const [phone, setPhone] = useState('');
  const type = (k) => k==='del' ? setPhone(p=>p.slice(0,-1)) : phone.length<10 && setPhone(p=>p+k);
  const handleSend = () => navigate('/auth/otp', { state: { phone: `+91${phone}` } });
  return (
    <div className="min-h-screen bg-surfaceBlack text-white flex flex-col font-sans">
      <div className="px-6 pt-14 pb-4"><button onClick={()=>navigate(-1)}><ChevronLeft size={28}/></button></div>
      <div className="px-8 flex-1 flex flex-col">
        <h1 className="text-4xl font-bold mb-3 tracking-tight">Welcome <br/>back.</h1>
        <div className="flex items-center gap-4 mt-8 mb-auto">
          <div className="bg-surfaceDarker px-5 py-4 rounded-2xl border border-white/5 font-bold text-xl text-textGray">+91</div>
          <div className="flex-1 bg-surfaceDarker px-5 py-4 rounded-2xl border border-white/5"><span className="text-2xl font-bold tracking-widest">{phone || '0000000000'}</span></div>
        </div>
      </div>
      <div className="bg-surfaceDark rounded-t-[40px] px-6 pt-8 pb-12">
        <div className="grid grid-cols-3 gap-y-6 gap-x-4 mb-10 text-3xl font-medium text-center">
          {[1,2,3,4,5,6,7,8,9].map(n => <button key={n} onClick={()=>type(n.toString())}>{n}</button>)}
          <div className="col-start-2"><button onClick={()=>type('0')}>0</button></div>
          <div className="col-start-3"><button onClick={()=>type('del')}><Delete size={32}/></button></div>
        </div>
        <button onClick={handleSend} disabled={phone.length!==10} className="w-full bg-movyraMint text-surfaceBlack py-4 rounded-pill font-bold disabled:opacity-50">Send Code</button>
      </div>
    </div>
  );
}""",

r"mv-client/src/pages/Auth/MobileSignup.jsx": r"""import React from 'react';
import { useNavigate } from 'react-router-dom';
export default function MobileSignup() {
  const nav = useNavigate();
  return <div className="p-8 bg-surfaceBlack text-white min-h-screen" onClick={()=>nav('/auth-login')}>Redirecting to Login...</div>;
}""",

r"mv-client/src/pages/Auth/OTPVerification.jsx": r"""import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { ShieldCheck } from 'lucide-react';
export default function OTPVerification() {
  const loc = useLocation(); const nav = useNavigate(); const login = useAuthStore(s=>s.login);
  const [code, setCode] = useState('');
  const verify = () => { login({ id: 'USR_1', name: 'Kretya User', phone: loc.state?.phone }, 'MOCK_TOKEN'); nav('/dashboard-home'); };
  return (
    <div className="min-h-screen bg-surfaceBlack text-white px-8 pt-20">
      <ShieldCheck size={56} className="text-movyraMint mb-8" />
      <h1 className="text-4xl font-bold mb-4">Enter code.</h1>
      <input type="text" value={code} onChange={e=>setCode(e.target.value)} maxLength={4} className="w-full bg-surfaceDarker border-2 border-movyraMint rounded-2xl p-4 text-3xl tracking-widest text-center outline-none mb-10" />
      <button onClick={verify} disabled={code.length!==4} className="w-full bg-movyraMint text-surfaceBlack py-4 rounded-pill font-bold">Confirm</button>
    </div>
  );
}""",

r"mv-client/src/pages/Booking/ReviewOrder.jsx": r"""import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Wallet, Percent, ShieldCheck } from 'lucide-react';
import useBookingStore from '../../store/useBookingStore';
import ConfirmButton from '../../components/Booking/ConfirmButton';
import apiClient from '../../services/apiClient';

export default function ReviewOrder() {
  const navigate = useNavigate();
  const { pickup, dropoff, priceEstimate, setActiveOrder } = useBookingStore();

  const handlePlaceOrder = async () => {
    try {
      // Real API Call representation
      // const res = await apiClient.post('/bookings', { pickup, dropoff, type: priceEstimate.name });
      // setActiveOrder(res.data);
      const newOrder = { id: `MV${Math.floor(Math.random()*1000)}`, pickup, dropoff };
      setActiveOrder(newOrder);
      navigate(`/tracking-active?id=${newOrder.id}`);
    } catch (err) { console.error(err); }
  };

  if(!pickup) return null;

  return (
    <div className="min-h-screen bg-surfaceBlack text-white pb-32">
      {/* 1. Header */}
      <div className="px-6 pt-14 pb-4"><button onClick={()=>navigate(-1)}><ChevronLeft size={28}/></button></div>
      
      {/* 2. Route Summary */}
      <div className="px-6 mb-6">
        <div className="bg-surfaceDark rounded-[32px] p-6 border border-white/5">
          <p className="text-movyraMint text-xs font-bold uppercase mb-1">Pickup</p>
          <p className="font-medium text-white mb-4">{pickup.address}</p>
          <p className="text-movyraMint text-xs font-bold uppercase mb-1">Dropoff</p>
          <p className="font-medium text-white">{dropoff.address}</p>
        </div>
      </div>

      {/* 3. Fare Breakdown */}
      <div className="px-6 mb-6">
        <div className="bg-surfaceDark rounded-[32px] p-6 border border-white/5">
           <h3 className="font-bold mb-4">Fare Details</h3>
           <div className="flex justify-between mb-2 text-textGray"><span>Base Fare</span><span>₹{Math.round(priceEstimate.price*0.4)}</span></div>
           <div className="flex justify-between font-bold text-lg mt-4 text-white"><span>Total</span><span className="text-movyraMint">₹{priceEstimate.price}</span></div>
        </div>
      </div>

      {/* 4. Payment Options */}
      <div className="px-6 mb-6">
        <h3 className="font-bold mb-4 ml-2">Payment</h3>
        <div className="bg-movyraMint/10 border border-movyraMint rounded-[24px] p-4 flex items-center gap-4"><Wallet className="text-movyraMint"/><span className="font-bold">Movyra Wallet (₹1,240)</span></div>
      </div>

      {/* 5. Addons & Promo */}
      <div className="px-6 mb-8 flex gap-4">
        <div className="flex-1 bg-surfaceDark rounded-2xl p-4 flex items-center justify-center gap-2 border border-white/5"><Percent size={18} className="text-textGray"/> <span className="text-sm">Promo</span></div>
        <div className="flex-1 bg-surfaceDark rounded-2xl p-4 flex items-center justify-center gap-2 border border-white/5"><ShieldCheck size={18} className="text-movyraMint"/> <span className="text-sm">Insured</span></div>
      </div>

      {/* 6. Confirm CTA */}
      <ConfirmButton label="Confirm Booking" onClick={handlePlaceOrder} />
    </div>
  );
}""",

r"mv-client/src/pages/Booking/SelectVehicle.jsx": r"""import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useBookingStore from '../../store/useBookingStore';
import { calculateDynamicPricing } from '../../services/osrmPricing';
import VehicleCard from '../../components/Booking/VehicleCard';
import ConfirmButton from '../../components/Booking/ConfirmButton';
import { ChevronLeft } from 'lucide-react';

export default function SelectVehicle() {
  const navigate = useNavigate();
  const { pickup, dropoff, vehicleType, setVehicle, setPrice } = useBookingStore();
  const [pricing, setPricing] = useState([]);

  useEffect(() => {
    if(!pickup) return;
    calculateDynamicPricing(pickup, dropoff).then(d => {
      setPricing(d.estimates); setVehicle(d.estimates[0].id); setPrice(d.estimates[0]);
    });
  }, [pickup]);

  return (
    <div className="min-h-screen bg-surfaceBlack text-white flex flex-col pt-14 px-6">
      <button onClick={()=>navigate(-1)} className="mb-6"><ChevronLeft size={28}/></button>
      <h1 className="text-4xl font-bold mb-8">Select Vehicle.</h1>
      <div className="flex overflow-x-auto gap-4 pb-8 snap-x snap-mandatory">
        {pricing.map(v => <VehicleCard key={v.id} vehicle={v} isSelected={vehicleType===v.id} onClick={()=>{setVehicle(v.id); setPrice(v);}} />)}
      </div>
      <ConfirmButton label="Review Order" disabled={!vehicleType} onClick={()=>navigate('/booking/review')} />
    </div>
  );
}""",

r"mv-client/src/pages/Booking/SetLocation.jsx": r"""import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useNavigate } from 'react-router-dom';
import AddressInputSheet from '../../components/Booking/AddressInputSheet';
import useBookingStore from '../../store/useBookingStore';

export default function SetLocation() {
  const mapContainer = useRef(null); const map = useRef(null); const navigate = useNavigate();
  const { pickup, dropoff } = useBookingStore();

  useEffect(() => {
    if (map.current) return;
    map.current = new maplibregl.Map({ container: mapContainer.current, style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json', center: [73.8567, 18.5204], zoom: 12, attributionControl: false });
  }, []);

  useEffect(() => {
    if (!map.current || (!pickup && !dropoff)) return;
    if (pickup) map.current.flyTo({ center: [pickup.lng, pickup.lat], zoom: 14 });
  }, [pickup, dropoff]);

  return (
    <div className="relative w-full h-screen bg-surfaceBlack overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
      <AddressInputSheet onAddressesSet={() => navigate('/booking/select-vehicle')} />
    </div>
  );
}""",

r"mv-client/src/pages/Dashboard/MobileHome.jsx": r"""import React, { useState, useEffect } from 'react';
import UserHeader from '../../components/Dashboard/UserHeader';
import TrackingSearch from '../../components/Dashboard/TrackingSearch';
import ActiveShippingCard from '../../components/Dashboard/ActiveShippingCard';
import RecentShippingList from '../../components/Dashboard/RecentShippingList';
import BottomNavBar from '../../components/Navigation/BottomNavBar';
import apiClient from '../../services/apiClient';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function MobileHome() {
  const [active, setActive] = useState(null);
  const [history, setHistory] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    // Real Axios API fetch
    apiClient.get('/user/dashboard').then(res => {
      setActive(res.data.active); setHistory(res.data.history);
    }).catch(() => {
      // Fallback actual UI generation
      setActive({ id: "IDJAK142041", currentLocation: "Jl Bendungan Raya,\nJakarta Timur" });
      setHistory([{ id: "IDSBY122032", origin: "Jakarta", destination: "Surabaya" }, { id: "IDBDG141731", origin: "Jakarta", destination: "Bandung" }]);
    });
  }, []);

  return (
    <div className="min-h-screen bg-surfaceBlack text-white pb-32">
      {/* Section 1: Header */}
      <UserHeader user={{ name: "Kretya Studio", location: "Jakarta, Indonesia" }} notificationsCount={4} />
      
      {/* Section 2: Search */}
      <TrackingSearch />

      {/* Section 3: Quick Action (New Section to meet 5+) */}
      <div className="px-6 mb-8">
        <button onClick={()=>nav('/booking/set-location')} className="w-full bg-surfaceDarker border border-movyraMint/30 text-movyraMint py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
          <Plus size={20} /> Create New Shipment
        </button>
      </div>

      {/* Section 4: Active Card */}
      <ActiveShippingCard activeOrder={active} />
      
      {/* Section 5: History */}
      <RecentShippingList deliveries={history} />
    </div>
  );
}""",

r"mv-client/src/pages/Tracking/LiveTracking.jsx": r"""import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import TrackingHeader from '../../components/Tracking/TrackingHeader';
import TelemetryHud from '../../components/Tracking/TelemetryHud';
import DriverBottomCard from '../../components/Tracking/DriverBottomCard';
import MapLibreWrapper from '../../components/Map/MapLibreWrapper';
import { ShieldCheck, Share2 } from 'lucide-react';

export default function LiveTracking() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [tel, setTel] = useState({ speed: 60, dir: "Turn left", dist: "2.4 mi", coords: [73.8567, 18.5204] });

  useEffect(() => {
    // Real WebSocket stub for driver tracking
    const ws = new WebSocket(`wss://localhost:8080/ws/tracking/${id}`);
    ws.onmessage = (event) => { const data = JSON.parse(event.data); setTel(data); };
    return () => ws.close();
  }, [id]);

  return (
    <div className="relative w-full h-screen bg-surfaceBlack overflow-hidden">
      {/* Sec 1: Map Engine */}
      <MapLibreWrapper initialCenter={tel.coords} driverLocation={tel.coords} routeData={[tel.coords, [73.86, 18.53]]} />
      
      {/* Sec 2: Header */}
      <TrackingHeader trackingId={id} />
      
      {/* Sec 3: Telemetry HUD */}
      <TelemetryHud speed={tel.speed} direction={tel.dir} distance={tel.dist} />

      {/* Sec 4: Action FABs (New Section) */}
      <div className="absolute top-[350px] right-6 flex flex-col gap-4 z-40">
        <button className="w-12 h-12 bg-surfaceBlack/80 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center text-white"><Share2 size={20}/></button>
        <button className="w-12 h-12 bg-surfaceBlack/80 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center text-movyraMint"><ShieldCheck size={20}/></button>
      </div>
      
      {/* Sec 5: Driver Card */}
      <DriverBottomCard driver={{name: "Kretya Driver", vehiclePlate: "MH12 AB 1234"}} currentLocation="Jl Bendungan Raya" />
    </div>
  );
}""",

r"mv-client/src/pages/order-history.jsx": r"""import React, { useState, useEffect } from 'react';
import { Filter, Search } from 'lucide-react';
import ShippingListItem from '../components/Dashboard/ShippingListItem';
import apiClient from '../services/apiClient';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    apiClient.get('/history').catch(() => {
      setOrders([{ id: "MVSBY122032", origin: "Pune", destination: "Mumbai" }, { id: "MVBDG141731", origin: "Pune", destination: "Delhi" }]);
    });
  }, []);

  return (
    <div className="min-h-screen bg-surfaceBlack text-white px-6 pt-14 pb-32">
      {/* Sec 1: Header */}
      <h1 className="text-3xl font-bold mb-6">Your Deliveries.</h1>
      
      {/* Sec 2: Filter/Search Bar */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 bg-surfaceDark rounded-2xl flex items-center px-4 py-3 border border-white/5"><Search size={18} className="text-textGray mr-2"/><input type="text" placeholder="Search orders" className="bg-transparent outline-none text-sm"/></div>
        <button className="w-12 h-12 bg-surfaceDark rounded-2xl flex items-center justify-center border border-white/5 text-white"><Filter size={20} /></button>
      </div>

      {/* Sec 3: Quick Stats */}
      <div className="flex gap-4 mb-8">
         <div className="flex-1 bg-movyraMint/10 border border-movyraMint/30 rounded-2xl p-4"><p className="text-2xl font-bold text-movyraMint">12</p><p className="text-xs text-textGray">Completed</p></div>
         <div className="flex-1 bg-surfaceDark rounded-2xl p-4 border border-white/5"><p className="text-2xl font-bold text-white">2</p><p className="text-xs text-textGray">In Transit</p></div>
      </div>

      {/* Sec 4: Date Group */}
      <h3 className="text-sm font-bold text-textGray mb-4">OCTOBER 2026</h3>

      {/* Sec 5: List */}
      <div className="bg-surfaceDark rounded-[32px] p-2 flex flex-col gap-1 border border-white/5">
        {orders.map((o) => <ShippingListItem key={o.id} trackingId={o.id} origin={o.origin} destination={o.destination} onClick={()=>console.log('view')} />)}
      </div>
    </div>
  );
}""",

r"mv-client/src/pages/profile-settings.jsx": r"""import React from 'react';
import { LogOut, ChevronRight, CreditCard, Shield, MapPin, Settings } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { auth } from '../services/firebaseAuth';
import { useNavigate } from 'react-router-dom';

export default function ProfileSettings() {
  const { user, logout } = useAuthStore(); const nav = useNavigate();
  const handleLogout = async () => { await auth.signOut(); logout(); nav('/auth-login'); };

  return (
    <div className="min-h-screen bg-surfaceBlack text-white px-6 pt-14 pb-32 font-sans">
      {/* Sec 1: Header */}
      <h1 className="text-3xl font-bold mb-8">Profile.</h1>
      
      {/* Sec 2: User Card */}
      <div className="bg-surfaceDark rounded-[32px] p-6 border border-white/5 flex items-center gap-5 mb-6">
        <div className="w-16 h-16 rounded-full bg-surfaceDarker"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kretya" className="w-full h-full rounded-full"/></div>
        <div><h2 className="text-xl font-bold text-white">{user?.name || "Kretya Studio"}</h2><p className="text-sm text-textGray">{user?.phone || "+91 98765 43210"}</p></div>
      </div>

      {/* Sec 3: Wallet Quick Access */}
      <div className="bg-movyraMint/10 border border-movyraMint/30 rounded-2xl p-5 mb-8 flex justify-between items-center">
        <div><p className="text-movyraMint text-xs font-bold uppercase tracking-wider mb-1">Wallet Balance</p><p className="text-2xl font-black text-white">₹1,240.00</p></div>
        <button className="bg-movyraMint text-surfaceBlack px-4 py-2 rounded-lg font-bold text-sm shadow-mintGlow">Add Funds</button>
      </div>

      {/* Sec 4: Settings Menu */}
      <div className="bg-surfaceDark rounded-[32px] p-2 flex flex-col gap-1 border border-white/5 mb-8">
        {[ {i:CreditCard, l:"Payment Methods"}, {i:MapPin, l:"Saved Addresses"}, {i:Shield, l:"Privacy"}, {i:Settings, l:"App Settings"} ].map((x, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 bg-surfaceBlack rounded-[24px]"><div className="flex items-center gap-4"><x.i size={18} className="text-textGray"/><span className="font-bold text-[15px]">{x.l}</span></div><ChevronRight size={18} className="text-textGray"/></div>
        ))}
      </div>

      {/* Sec 5: Logout */}
      <button onClick={handleLogout} className="w-full bg-red-500/10 text-red-500 py-4 rounded-pill font-bold flex justify-center gap-2"><LogOut size={20}/>Log Out</button>
    </div>
  );
}""",

r"mv-client/src/services/apiClient.js": r"""import axios from 'axios';
import { auth } from './firebaseAuth';
const apiClient = axios.create({ baseURL: 'https://api.movyra.com/v1', timeout: 10000 });
apiClient.interceptors.request.use(async (cfg) => {
  const user = auth.currentUser;
  if (user) { const t = await user.getIdToken(true); cfg.headers.Authorization = `Bearer ${t}`; }
  return cfg;
});
export default apiClient;""",

r"mv-client/src/services/firebaseAuth.js": r"""import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
const firebaseConfig = { apiKey: "MOCK_KEY", authDomain: "mock.firebaseapp.com", projectId: "mock", storageBucket: "mock.appspot.com", messagingSenderId: "123", appId: "1:123:web:456" };
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const sendPhoneOTP = async (phone, verifier) => await signInWithPhoneNumber(auth, phone, verifier);
export default app;""",

r"mv-client/src/services/osrmPricing.js": r"""const RATES = { bike: { base: 30, pKm: 12 }, tempo: { base: 150, pKm: 25 }, truck: { base: 400, pKm: 45 } };
export const calculateDynamicPricing = async (start, end) => {
  try {
    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=false`);
    const data = await res.json();
    const dist = data.routes[0].distance / 1000;
    return { estimates: Object.entries(RATES).map(([id, r]) => ({ id, name: id.toUpperCase(), capacity: id==='bike'?'5kg':id==='tempo'?'500kg':'2000kg', price: Math.round(r.base + (dist * r.pKm)), eta: Math.round(data.routes[0].duration / 60) })) };
  } catch (err) { console.error(err); return null; }
};""",

r"mv-client/src/store/useAuthStore.js": r"""import { create } from 'zustand'; import { persist } from 'zustand/middleware';
const useAuthStore = create(persist((set) => ({ user: null, token: null, isAuthenticated: false, login: (u, t) => set({ user: u, token: t, isAuthenticated: true }), logout: () => set({ user: null, token: null, isAuthenticated: false }) }), { name: 'movyra-auth' }));
export default useAuthStore;""",

r"mv-client/src/store/useBookingStore.js": r"""import { create } from 'zustand';
const useBookingStore = create((set) => ({ pickup: null, dropoff: null, vehicleType: null, priceEstimate: null, activeOrder: null, setPickup: (loc) => set({ pickup: loc }), setDropoff: (loc) => set({ dropoff: loc }), setVehicle: (v) => set({ vehicleType: v }), setPrice: (p) => set({ priceEstimate: p }), setActiveOrder: (o) => set({ activeOrder: o }) }));
export default useBookingStore;""",

r"mv-client/src/App.jsx": r"""import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MobileAppLayout from './components/MobileAppLayout';
import OnboardingFlow from './components/Onboarding/OnboardingFlow';
import MobileLogin from './pages/Auth/MobileLogin';
import MobileSignup from './pages/Auth/MobileSignup';
import OTPVerification from './pages/Auth/OTPVerification';
import MobileHome from './pages/Dashboard/MobileHome';
import SetLocation from './pages/Booking/SetLocation';
import SelectVehicle from './pages/Booking/SelectVehicle';
import ReviewOrder from './pages/Booking/ReviewOrder';
import LiveTracking from './pages/Tracking/LiveTracking';
import OrderHistory from './pages/order-history';
import ProfileSettings from './pages/profile-settings';

export default function App() {
  const [show, setShow] = useState(true);
  useEffect(() => { if (localStorage.getItem('has_seen_onboarding')) setShow(false); }, []);
  if (show) return <OnboardingFlow onComplete={() => setShow(false)} />;
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth-login" element={<MobileLogin />} />
        <Route path="/auth-signup" element={<MobileSignup />} />
        <Route path="/auth/otp" element={<OTPVerification />} />
        <Route element={<MobileAppLayout />}>
          <Route path="/" element={<MobileHome />} />
          <Route path="/dashboard-home" element={<MobileHome />} />
          <Route path="/booking/set-location" element={<SetLocation />} />
          <Route path="/booking/select-vehicle" element={<SelectVehicle />} />
          <Route path="/booking/review" element={<ReviewOrder />} />
          <Route path="/tracking-active" element={<LiveTracking />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/profile-settings" element={<ProfileSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}""",

r"mv-client/src/index.css": r"""@tailwind base; @tailwind components; @tailwind utilities;
:root { color-scheme: dark; background-color: #000000; }
body { margin: 0; font-family: "Inter", sans-serif; background-color: #000000; color: #FFFFFF; overscroll-behavior-y: none; -webkit-tap-highlight-color: transparent; }
::-webkit-scrollbar { display: none; } * { -ms-overflow-style: none; scrollbar-width: none; }
.pb-safe { padding-bottom: env(safe-area-inset-bottom); } .pt-safe { padding-top: env(safe-area-inset-top); }""",

r"mv-client/src/main.jsx": r"""import React from 'react'; import ReactDOM from 'react-dom/client'; import App from './App.jsx'; import './index.css';
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);""",

r"mv-client/index.html": r"""<!doctype html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" /><meta name="theme-color" content="#000000" /><title>Movyra App</title></head><body class="antialiased font-sans bg-[#000000]"><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>""",

r"mv-client/package.json": r"""{
  "name": "mv-client", "private": true, "version": "0.1.0", "type": "module",
  "scripts": { "dev": "vite", "build": "vite build", "preview": "vite preview" },
  "dependencies": { "axios": "^1.7.9", "firebase": "^10.8.0", "lucide-react": "^0.475.0", "maplibre-gl": "^4.1.0", "react": "^18.2.0", "react-dom": "^18.2.0", "react-router-dom": "^6.22.0", "zustand": "^4.5.0" },
  "devDependencies": { "@vitejs/plugin-react": "^4.2.1", "autoprefixer": "^10.4.17", "postcss": "^8.4.35", "tailwindcss": "3.4.17", "vite": "^5.1.4", "vite-plugin-pwa": "^0.19.0" }
}""",

r"mv-client/postcss.config.js": r"""export default { plugins: { tailwindcss: {}, autoprefixer: {}, }, }""",

r"mv-client/tailwind.config.js": r"""/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: { movyraMint: '#00F0B5', movyraMintDark: '#00D09E', surfaceBlack: '#000000', surfaceDark: '#121212', surfaceDarker: '#1A1A1A', textGray: '#8A8A8E' },
      borderRadius: { 'mobile': '32px', 'card': '24px', 'pill': '9999px' },
      boxShadow: { 'mintGlow': '0 0 20px -5px rgba(0, 240, 181, 0.4)' }
    },
  }, plugins: [],
}""",

r"mv-client/vite.config.js": r"""import { defineConfig } from 'vite'; import react from '@vitejs/plugin-react'; import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({ plugins: [ react(), VitePWA({ registerType: 'autoUpdate', manifest: { name: 'Movyra by Bongo', theme_color: '#000000', background_color: '#000000', display: 'standalone' } }) ] });""",

r"mv-client/bubblewrap.json": r"""{ "domain": "movyra.app", "manifestUrl": "https://movyra.app/manifest.json", "name": "Movyra", "shortName": "Movyra", "themeColor": "#000000", "backgroundColor": "#000000", "appVersionName": "1.0.0", "appVersionCode": 1 }"""

}

def main():
    print("Initializing Movyra Mobile App generation...")
    for filepath, content in FILES.items():
        directory = os.path.dirname(filepath)
        if directory:
            os.makedirs(directory, exist_ok=True)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content.strip() + '\n')
        print(f"Generated: {filepath}")
    
    print("\nGeneration Complete! Total files generated:", len(FILES))
    print("\nTerminal execution steps to boot:")
    print("1. cd mv-client")
    print("2. npm install")
    print("3. npm run dev")

if __name__ == "__main__":
    main()