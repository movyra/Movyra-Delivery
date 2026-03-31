import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  ChevronLeft, MapPin, Clock, Download, 
  Loader2, AlertCircle, CheckCircle2, XCircle, Truck,
  Package, ShieldAlert, Diamond, UserCircle2, HelpCircle
} from 'lucide-react';

// Corrected import for production build compatibility
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Real Database Integration
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// ============================================================================
// PAGE: ORDER DETAILS & HISTORICAL INVOICE (STRICT OSM ARCHITECTURE)
// Deep-dive into a past order using Leaflet Raster Tiles for maximum stability.
// Generates a read-only route map, logistics timeline, and GST invoice.
// ============================================================================

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const db = getFirestore();
  
  const mapContainer = useRef(null);
  const map = useRef(null);
  const receiptRef = useRef(null);

  // Local Data & UI State
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  // ============================================================================
  // FEATURE 1: REAL-TIME FIRESTORE DATA SYNC
  // ============================================================================
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        if (!id) return;
        const orderRef = doc(db, 'orders', id);
        const snapshot = await getDoc(orderRef);
        
        if (snapshot.exists()) {
          setOrder({ id: snapshot.id, ...snapshot.data() });
        } else {
          setError('Order not found or has been removed from the database.');
        }
      } catch (err) {
        console.error("Firestore Fetch Error:", err);
        setError('Failed to securely fetch order details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, db]);

  // ============================================================================
  // FEATURE 2: OPENSTREETMAP ENGINE (LEAFLET READ-ONLY PLOTTING)
  // ============================================================================
  useEffect(() => {
    if (!order || !mapContainer.current || map.current) return;

    // Determine Map Center
    const pickupLat = order.pickup?.lat || 28.6139;
    const pickupLng = order.pickup?.lng || 77.2090;

    // Initialize Leaflet Map (Raster based - immune to WebGL blanking)
    map.current = L.map(mapContainer.current, {
      center: [pickupLat, pickupLng],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      touchZoom: false
    });

    // Add OSM Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map.current);

    const points = [];

    // Plot Pickup Marker
    if (order.pickup?.lat) {
      const pickupIcon = L.divIcon({
        className: '',
        html: `<div class="w-4 h-4 bg-white border-4 border-black rounded-full shadow-md"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      L.marker([order.pickup.lat, order.pickup.lng], { icon: pickupIcon }).addTo(map.current);
      points.push([order.pickup.lat, order.pickup.lng]);
    }

    // Plot Dropoff Marker(s)
    const dropoffs = order.dropoffs || (order.dropoff ? [order.dropoff] : []);
    dropoffs.forEach((drop, idx) => {
      if (drop?.lat) {
        const dropIcon = L.divIcon({
          className: '',
          html: `<div class="w-5 h-5 bg-black text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-md">${idx + 1}</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        L.marker([drop.lat, drop.lng], { icon: dropIcon }).addTo(map.current);
        points.push([drop.lat, drop.lng]);
      }
    });

    // Fit bounds to show entire route
    if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.current.fitBounds(bounds, { padding: [40, 40] });
    }

    // Force layout update for Leaflet
    setTimeout(() => map.current?.invalidateSize(), 200);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [order]);

  // ============================================================================
  // FEATURE 7: B2B GST INVOICE GENERATOR
  // ============================================================================
  const handleDownloadInvoice = async () => {
    if (!receiptRef.current || !order) return;
    setIsDownloading(true);

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#FFFFFF',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Movyra_Invoice_${order.id.slice(-8)}.pdf`);
    } catch (err) {
      console.error("PDF Engine Error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans">
        <Loader2 size={40} className="animate-spin text-black mb-4" />
        <p className="text-[14px] font-bold text-gray-500 uppercase tracking-widest">Decrypting Record</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <AlertCircle size={48} className="text-red-500 mb-4" strokeWidth={2} />
        <h1 className="text-[24px] font-black text-black mb-2">Record Unavailable</h1>
        <p className="text-[15px] font-medium text-gray-500 mb-8">{error}</p>
        <button onClick={() => navigate(-1)} className="px-8 py-3 bg-black text-white rounded-full font-bold">Go Back</button>
      </div>
    );
  }

  const dateObj = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();
  const formattedDate = dateObj.toLocaleString('en-IN', { 
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true 
  });
  
  const totalAmount = order.pricing?.estimatedPrice || order.totalFare || 0;
  const taxableValue = totalAmount / 1.18;
  const cgst = taxableValue * 0.09;
  const sgst = taxableValue * 0.09;
  const dropoffsArray = order.dropoffs || (order.dropoff ? [order.dropoff] : []);

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-black flex flex-col font-sans relative">
      
      {/* HEADER */}
      <div className="pt-12 px-6 pb-4 flex items-center justify-between sticky top-0 bg-[#F6F6F6]/90 backdrop-blur-md z-50">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-black hover:bg-white transition-colors active:scale-95 shadow-sm border border-gray-200"
        >
          <ChevronLeft size={28} strokeWidth={2.5} />
        </button>
        <div className="w-10 h-10 rounded-md overflow-hidden bg-black flex items-center justify-center p-1">
          <img src="/logo.png" alt="Movyra" className="w-full h-full object-contain" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        
        {/* FEATURE 3: OSM LOGISTICS MAP */}
        <div className="h-[250px] w-full relative bg-gray-100 border-b-4 border-black">
          <div ref={mapContainer} className="absolute inset-0" />
          
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
            <span className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-black uppercase tracking-widest shadow-lg ${
              order.status === 'delivered' ? 'bg-black text-white' : 
              order.status === 'cancelled' ? 'bg-[#FF3B30] text-white' : 
              'bg-[#276EF1] text-white'
            }`}>
              {order.status === 'delivered' && <CheckCircle2 size={16} strokeWidth={3} />}
              {order.status === 'cancelled' && <XCircle size={16} strokeWidth={3} />}
              {order.status !== 'delivered' && order.status !== 'cancelled' && <Truck size={16} strokeWidth={3} />}
              {order.status || 'Processing'}
            </span>
          </div>
        </div>

        <div className="px-6 -mt-8 relative z-20 space-y-6">
          
          {/* PACKAGE DETAILS */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-200">
            <h3 className="font-bold text-[13px] text-gray-400 uppercase tracking-widest mb-4">Package Config</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F6F6F6] rounded-full flex items-center justify-center text-black">
                  <Package size={18} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">Item Type</span>
                  <span className="text-[14px] font-black text-black">{order.packageDetails?.itemType || 'Package'}</span>
                </div>
              </div>
              
              {order.packageDetails?.isFragile && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                    <ShieldAlert size={18} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-red-400 uppercase">Safety</span>
                    <span className="text-[14px] font-black text-red-600">Fragile</span>
                  </div>
                </div>
              )}
            </div>

            {order.packageDetails?.requiresSecureOTP && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Diamond size={16} className="text-[#276EF1]" strokeWidth={2.5} />
                  <span className="text-[13px] font-bold text-gray-500 uppercase tracking-widest">Delivery PIN</span>
                </div>
                <span className="text-[20px] font-black tracking-widest text-black bg-gray-100 px-3 py-1 rounded-lg">
                  {order.packageDetails.secureOTP || '****'}
                </span>
              </div>
            )}
          </motion.div>

          {/* PARTNER ASSIGNMENT */}
          {order.selectedBid && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 border border-gray-200">
                  <UserCircle2 size={24} strokeWidth={2} />
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Assigned Partner</span>
                  <p className="text-[16px] font-black text-black">{order.selectedBid.driverName}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Vehicle</span>
                <p className="text-[14px] font-black text-[#276EF1] capitalize bg-blue-50 px-3 py-1 rounded-full">{order.selectedBid.vehicleType || 'Standard'}</p>
              </div>
            </motion.div>
          )}

          {/* TIMELINE */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-200">
            <h3 className="text-[18px] font-black text-black mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
              <MapPin size={20} /> Logistics Timeline
            </h3>
            
            <div className="relative border-l-2 border-dashed border-gray-300 ml-3 pl-6 space-y-6">
              <div className="relative">
                <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 bg-black rounded-full ring-4 ring-white shadow-sm" />
                <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pickup • {formattedDate}</span>
                <p className="text-[15px] font-bold text-black leading-snug">{order.pickup?.address || 'Origin Address Unavailable'}</p>
              </div>

              {dropoffsArray.map((drop, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 bg-white border-[4px] border-black rounded-sm ring-4 ring-white shadow-sm" />
                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Dropoff {idx + 1}</span>
                  <p className="text-[15px] font-bold text-black leading-snug">{drop.address || 'Destination Address Unavailable'}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* TAX INVOICE */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div ref={receiptRef} className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-8 pb-8 border-b-2 border-dashed border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center overflow-hidden p-1.5 shadow-md">
                    <img src="/logo.png" alt="Movyra" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h2 className="text-[24px] font-black tracking-tight text-black leading-none">Movyra</h2>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Tax Invoice</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-[13px] font-black text-black tracking-wider uppercase">{order.id.slice(-8).toUpperCase()}</span>
                  <span className="block text-[11px] font-bold text-gray-400 mt-1">{formattedDate.split(',')[0]}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-[15px]">
                  <span className="font-bold text-gray-500">Logistics Base Fare</span>
                  <span className="font-black text-black">₹{taxableValue.toFixed(2)}</span>
                </div>
                {order.pricing?.isGroupDelivery && (
                  <div className="flex justify-between items-center text-green-600 bg-green-50 p-2 rounded-lg text-[13px]">
                    <span className="font-bold">Group Pool Discount</span>
                    <span className="font-black">Applied</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-[15px]">
                  <span className="font-bold text-gray-500">CGST (9%)</span>
                  <span className="font-black text-black">₹{cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-100 text-[15px]">
                  <span className="font-bold text-gray-500">SGST (9%)</span>
                  <span className="font-black text-black">₹{sgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[18px] font-black text-black uppercase tracking-wide">Final Total</span>
                  <span className="text-[28px] font-black text-black tracking-tight">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center mt-6 pt-6 border-t border-gray-100">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">GSTIN: 27AADCM9999A1Z9</p>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">This is a computer generated invoice.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pt-4 bg-[#F6F6F6]/90 backdrop-blur-md z-30 flex gap-3">
        <button 
          onClick={() => navigate('/support/dispute')}
          className="w-14 h-[60px] flex items-center justify-center bg-white border border-gray-200 text-black rounded-2xl active:scale-95 transition-transform shadow-sm shrink-0"
        >
          <HelpCircle size={24} strokeWidth={2.5} />
        </button>
        <button 
          onClick={handleDownloadInvoice}
          disabled={isDownloading}
          className="flex-1 flex items-center justify-center gap-3 px-6 bg-black text-white py-4 rounded-2xl font-bold text-[17px] hover:bg-gray-900 active:scale-[0.98] transition-all h-[60px] shadow-[0_10px_30px_rgba(0,0,0,0.2)] disabled:opacity-50"
        >
          {isDownloading ? <Loader2 size={20} className="animate-spin text-white" /> : <Download size={20} strokeWidth={3} />}
          {isDownloading ? 'Processing...' : 'Download Invoice'}
        </button>
      </div>

    </div>
  );
}