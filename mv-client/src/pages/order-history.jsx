import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Info, MapPin, Package, CheckCircle2, Navigation } from 'lucide-react';
import api from '../services/api';

export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        setLoading(true);
        setError('');
        // Real logic: Fetching user's actual past bookings from the Rust backend
        const response = await api.get('/bookings/history');
        setOrders(response.data.orders || []);
      } catch (err) {
        console.error("Failed to fetch order history:", err);
        setError('Failed to load activity. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, []);

  return (
    <div className="flex flex-col h-full bg-white font-sans">
      {/* Sticky Header */}
      <div className="pt-8 pb-4 px-6 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10 border-b border-gray-100">
        <h1 className="text-3xl font-bold tracking-tight text-black">Activity</h1>
        <button className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors">
           <Search size={20} className="text-black" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        <h2 className="font-bold text-lg mb-4 px-2">Past Deliveries</h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <Loader2 className="animate-spin mb-3" size={28} />
            <p className="font-medium text-sm">Loading your activity...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-red-600 flex items-start gap-3 mx-2">
            <Info size={20} className="shrink-0 mt-0.5" />
            <p className="font-medium text-sm">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-center px-4">
            <Package size={48} className="mb-4 text-gray-200" />
            <p className="font-bold text-lg text-black mb-1">No activity yet</p>
            <p className="font-medium text-sm text-gray-500">You don't have any past deliveries with Movyra.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all cursor-pointer hover:shadow-md"
                onClick={() => navigate(`/tracking-active`, { state: { trackingId: order.tracking_id, otp: order.otp } })}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#F3F3F3] rounded-xl flex items-center justify-center shrink-0">
                      <Package size={24} className="text-black" />
                    </div>
                    <div>
                      <p className="font-bold text-black text-lg">{new Date(order.created_at).toLocaleDateString()}</p>
                      <p className="text-sm font-medium text-gray-500">{order.vehicle_name} • {order.parcel_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg text-black">₹{order.price.toFixed(2)}</p>
                    <div className="flex items-center gap-1 mt-1 justify-end">
                      {order.status === 'COMPLETED' ? (
                        <><CheckCircle2 size={12} className="text-green-500" /><span className="text-xs font-bold text-green-500">Completed</span></>
                      ) : (
                        <><Navigation size={12} className="text-[#00A3FF]" /><span className="text-xs font-bold text-[#00A3FF]">In Transit</span></>
                      )}
                    </div>
                  </div>
                </div>

                {/* Route Summary Miniature */}
                <div className="bg-gray-50 rounded-xl p-3 relative pl-8 mt-2 border border-gray-100">
                  <div className="absolute left-[15px] top-[18px] bottom-[18px] w-[2px] bg-gray-300"></div>
                  
                  <div className="relative mb-3">
                    <div className="absolute left-[-23px] w-2 h-2 rounded-full border-[2px] border-black bg-white mt-1"></div>
                    <p className="text-sm text-gray-600 line-clamp-1 font-medium">{order.pickup_address}</p>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute left-[-23px] w-2 h-2 bg-black mt-1"></div>
                    <p className="text-sm text-gray-600 line-clamp-1 font-medium">{order.dropoff_address}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Minimal Search Icon specifically for this component
const Search = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);