import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Info } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import api from '../services/api';

export default function VehicleSelection() {
  const navigate = useNavigate();
  const { bookingData, setVehicle } = useBooking();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    // Strict Guard: Ensure required previous data exists
    if (!bookingData.pickup || !bookingData.dropoff || !bookingData.parcelType) {
      navigate('/location-picker');
      return;
    }

    const fetchPricing = async () => {
      try {
        setLoading(true);
        setError('');
        
        // POST to Rust backend to calculate OSRM distance and real-time pricing
        const response = await api.post('/pricing', {
          pickup: { lat: bookingData.pickup.lat, lng: bookingData.pickup.lng },
          dropoff: { lat: bookingData.dropoff.lat, lng: bookingData.dropoff.lng },
          parcel_id: bookingData.parcelType.id
        });

        // Expected response: array of available vehicles with computed prices
        setVehicles(response.data.vehicles);
      } catch (err) {
        console.error("Pricing API Error:", err);
        setError('Failed to fetch real-time pricing. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, [bookingData, navigate]);

  const handleSelectVehicle = (vehicle) => {
    setVehicle(vehicle);
  };

  const handleNext = () => {
    if (bookingData.vehicle) {
      navigate('/order-confirm');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white font-sans relative">
      <div className="pt-6 pb-4 px-6 flex items-center gap-4 bg-white z-10 border-b border-gray-100 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
          <ArrowLeft size={20} className="text-black" />
        </button>
        <span className="font-bold text-lg text-black tracking-tight">Select Vehicle</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 pb-32">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="font-medium">Calculating optimal routes & pricing...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-red-600 flex items-start gap-3">
            <Info size={20} className="shrink-0 mt-0.5" />
            <p className="font-medium text-sm">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {vehicles.map((v) => {
              const isActive = bookingData.vehicle?.id === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => handleSelectVehicle(v)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    isActive ? 'border-black bg-gray-50 shadow-md' : 'border-gray-100 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Placeholder for actual 3D rendering / vehicle images */}
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-2xl">{v.type === 'bike' ? '🏍️' : v.type === 'tempo' ? '🛻' : '🚛'}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-black">{v.name}</h4>
                      <p className="text-gray-500 text-sm font-medium">{v.eta_mins} mins away • {v.capacity_desc}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-xl text-black">₹{v.price.toFixed(2)}</p>
                    <p className="text-xs text-gray-400 font-bold uppercase mt-1">Est. Total</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 inset-x-0 p-6 bg-white border-t border-gray-100">
        <button
          onClick={handleNext}
          disabled={!bookingData.vehicle || loading}
          className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:bg-gray-400 transition-all shadow-xl active:scale-[0.98]"
        >
          {bookingData.vehicle ? `Choose ${bookingData.vehicle.name}` : 'Select a vehicle'}
        </button>
      </div>
    </div>
  );
}