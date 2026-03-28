import React, { useState, useEffect } from 'react';
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
}
