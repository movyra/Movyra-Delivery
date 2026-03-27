import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Box, PackagePlus, FileText } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export default function ParcelType() {
  const navigate = useNavigate();
  const { bookingData, setParcelType } = useBooking();

  // Redirect back if locations are not set
  useEffect(() => {
    if (!bookingData.pickup || !bookingData.dropoff) {
      navigate('/location-picker');
    }
  }, [bookingData, navigate]);

  const parcelTypes = [
    { id: 'small', name: 'Small parcel', desc: '8 x 38 x 64 cm, up to 5 kg', icon: Box },
    { id: 'medium', name: 'Medium parcel', desc: '19 x 38 x 64 cm, up to 15 kg', icon: PackagePlus },
    { id: 'big', name: 'Big parcel', desc: '41 x 38 x 64 cm, up to 25 kg', icon: Box },
    { id: 'documents', name: 'Documents', desc: 'Except for documents "classified"', icon: FileText },
    { id: 'oversize', name: 'Oversize parcel', desc: '82 x 76 x 128 cm, up to 50 kg', icon: Box },
  ];

  const handleSelect = (parcel) => {
    setParcelType(parcel);
  };

  const handleNext = () => {
    if (bookingData.parcelType) {
      navigate('/vehicle-selection');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] text-white font-sans overflow-y-auto">
      {/* Header */}
      <div className="pt-6 pb-4 px-6 flex items-center gap-4 sticky top-0 bg-[#0A0A0A]/90 backdrop-blur-md z-10">
        <button onClick={() => navigate(-1)} className="p-2 bg-[#1A1A1A] rounded-full hover:bg-[#2A2A2A] transition-colors">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <span className="font-bold text-sm tracking-widest uppercase text-gray-400">Step 2 of 4</span>
      </div>

      <div className="px-6 py-4 flex-1">
        <h1 className="text-4xl font-black text-white leading-none mb-2 tracking-tight">PARCEL TYPE</h1>
        <p className="text-gray-500 text-sm font-medium mb-8">Select the size that best fits yours.</p>
        
        <div className="space-y-4 mb-24">
          {parcelTypes.map((item) => {
            const Icon = item.icon;
            const isActive = bookingData.parcelType?.id === item.id;
            
            return (
              <div 
                key={item.id} 
                onClick={() => handleSelect(item)}
                className={`p-5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer active:scale-[0.98] ${
                  isActive 
                    ? 'bg-[#1A1A1A] border-[#00A3FF] shadow-[0_0_20px_rgba(0,163,255,0.1)]' 
                    : 'bg-transparent border-[#2A2A2A] hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`${isActive ? 'text-[#00A3FF]' : 'text-gray-500'} transition-colors`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-base">{item.name}</h4>
                    <p className="text-gray-500 text-[11px] uppercase tracking-wider mt-1">{item.desc}</p>
                  </div>
                </div>
                
                {/* Custom Radio Button */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isActive ? 'border-[#00A3FF]' : 'border-gray-600'
                }`}>
                  {isActive && <div className="w-3 h-3 bg-[#00A3FF] rounded-full animate-in zoom-in"></div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="fixed sm:absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent">
        <button
          onClick={handleNext}
          disabled={!bookingData.parcelType}
          className="w-full bg-white text-black py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:bg-gray-700 disabled:text-gray-400 transition-all shadow-xl active:scale-[0.98]"
        >
          {bookingData.parcelType ? 'Continue to Vehicles' : 'Select a parcel type'}
        </button>
      </div>
    </div>
  );
}