import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Loader2, Navigation, CreditCard } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import api from '../services/api';

export default function OrderConfirm() {
  const navigate = useNavigate();
  const { bookingData, setTrackingId } = useBooking();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Guard clause
  if (!bookingData.vehicle) {
    navigate('/location-picker');
    return null;
  }

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Execute Real Order Creation against Rust backend
      const payload = {
        pickup_address: bookingData.pickup.address,
        pickup_lat: bookingData.pickup.lat,
        pickup_lng: bookingData.pickup.lng,
        dropoff_address: bookingData.dropoff.address,
        dropoff_lat: bookingData.dropoff.lat,
        dropoff_lng: bookingData.dropoff.lng,
        parcel_type_id: bookingData.parcelType.id,
        vehicle_id: bookingData.vehicle.id,
        agreed_price: bookingData.vehicle.price,
      };

      const response = await api.post('/bookings', payload);
      
      // Save Tracking ID securely to state
      setTrackingId(response.data.tracking_id);
      
      // Keep order OTP in local component state to pass via router state, 
      // or save securely. We'll pass it to tracking.
      navigate('/tracking-active', { state: { otp: response.data.otp } });
      
    } catch (err) {
      console.error("Booking Creation Error:", err);
      setError('Failed to create booking. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 font-sans">
      <div className="pt-6 pb-4 px-6 flex items-center gap-4 bg-white z-10 border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
          <ArrowLeft size={20} className="text-black" />
        </button>
        <span className="font-bold text-lg text-black tracking-tight">Review & Confirm</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        {/* Route Summary Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-black mb-4 flex items-center gap-2"><Navigation size={18}/> Route Summary</h3>
          <div className="relative pl-6 space-y-4">
            <div className="absolute left-[7px] top-[14px] bottom-[14px] w-[2px] bg-gray-200"></div>
            
            <div className="relative">
              <div className="absolute left-[-29px] w-3 h-3 rounded-full border-[3px] border-black bg-white mt-1"></div>
              <p className="font-bold text-[15px] text-black leading-tight">{bookingData.pickup.address.split(',')[0]}</p>
              <p className="text-sm text-gray-500 line-clamp-1">{bookingData.pickup.address}</p>
            </div>
            
            <div className="relative">
              <div className="absolute left-[-29px] w-3 h-3 bg-red-500 rounded-[2px] mt-1"></div>
              <p className="font-bold text-[15px] text-black leading-tight">{bookingData.dropoff.address.split(',')[0]}</p>
              <p className="text-sm text-gray-500 line-clamp-1">{bookingData.dropoff.address}</p>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <div className="text-gray-500 font-medium text-sm">Parcel Type</div>
            <div className="font-bold text-black">{bookingData.parcelType.name}</div>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <div className="text-gray-500 font-medium text-sm">Vehicle</div>
            <div className="font-bold text-black">{bookingData.vehicle.name}</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
              <CreditCard size={18} /> Payment (Cash)
            </div>
            <div className="text-2xl font-black text-black">₹{bookingData.vehicle.price.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 p-6 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button
          onClick={handleConfirmOrder}
          disabled={isSubmitting}
          className="w-full bg-[#00A3FF] text-white py-4 rounded-xl font-black text-lg shadow-[0_5px_20px_rgba(0,163,255,0.4)] disabled:opacity-70 transition-all active:scale-[0.98] flex items-center justify-center gap-2 tracking-widest uppercase italic"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : 'Confirm Delivery'}
        </button>
      </div>
    </div>
  );
}