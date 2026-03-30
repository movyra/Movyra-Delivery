import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  ChevronLeft, MapPin, Clock, Receipt, Download, 
  Loader2, AlertCircle, CheckCircle2, XCircle, Truck 
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Real Database Integration
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// ============================================================================
// PAGE: ORDER DETAILS & HISTORICAL INVOICE (STARK MINIMALIST UI)
// Deep-dive into a past order. Generates a read-only map of the route, 
// a timestamped logistics timeline, and a printable B2B GST invoice.
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
  // LOGIC: FETCH REAL ORDER FROM FIRESTORE
  // ============================================================================
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
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

    if (id) fetchOrderDetails();
  }, [id, db]);

  // ============================================================================
  // LOGIC: MAPLIBRE ENGINE (READ-ONLY ROUTE PLOTTING)
  // ============================================================================
  useEffect(() => {
    if (!order || !mapContainer.current || map.current) return;

    // Initialize Read-Only Map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      interactive: false, // Freeze the map for receipt view
      attributionControl: false
    });

    map.current.on('load', () => {
      const bounds = new maplibregl.LngLatBounds();
      
      // Plot Pickup
      if (order.pickup?.lat && order.pickup?.lng) {
        new maplibregl.Marker({ color: '#000000' })
          .setLngLat([order.pickup.lng, order.pickup.lat])
          .addTo(map.current);
        bounds.extend([order.pickup.lng, order.pickup.lat]);
      }

      // Plot Dropoff(s)
      const dropoffs = order.dropoffs || (order.dropoff ? [order.dropoff] : []);
      dropoffs.forEach(drop => {
        if (drop?.lat && drop?.lng) {
          const el = document.createElement('div');
          el.className = 'w-4 h-4 bg-white border-4 border-black rounded-sm shadow-md';
          new maplibregl.Marker(el)
            .setLngLat([drop.lng, drop.lat])
            .addTo(map.current);
          bounds.extend([drop.lng, drop.lat]);
        }
      });

      // Frame the exact route gracefully
      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, { padding: 40, duration: 0 });
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [order]);

  // ============================================================================
  // LOGIC: PDF INVOICE GENERATION
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
      pdf.save(`Movyra_Invoice_${order.id}.pdf`);
    } catch (err) {
      console.error("PDF Engine Error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  // ============================================================================
  // RENDER UI
  // ============================================================================
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

  // Formatting Real Data
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
      
      {/* SECTION 1: Top Navigation */}
      <div className="pt-12 px-6 pb-4 flex items-center justify-between sticky top-0 bg-[#F6F6F6]/90 backdrop-blur-md z-50">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-black hover:bg-white transition-colors active:scale-95 shadow-sm border border-gray-200"
        >
          <ChevronLeft size={28} strokeWidth={2.5} />
        </button>
        <div className="w-8 h-8 rounded-md overflow-hidden bg-black flex items-center justify-center">
          <img src="/logo.png" alt="Movyra" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        
        {/* SECTION 2: Geographic Route Verification */}
        <div className="h-[250px] w-full relative bg-gray-200 border-b-4 border-black">
          <div ref={mapContainer} className="absolute inset-0" />
          
          {/* Status Overlay Badge */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
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

        <div className="px-6 -mt-8 relative z-20">
          
          {/* SECTION 3: Detailed Logistics Timeline */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-200 mb-6">
            <h3 className="text-[18px] font-black text-black mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
              <MapPin size={20} /> Route Timeline
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

            {order.driver && (
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Assigned Partner</span>
                  <p className="text-[16px] font-black text-black">{order.driver.driverName || 'Verified Partner'}</p>
                </div>
                <div className="text-right">
                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Vehicle</span>
                  <p className="text-[16px] font-black text-black capitalize">{order.vehicleType || 'Standard'}</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* SECTION 4: Digital GST Receipt (Printable Target) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div ref={receiptRef} className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-6 pb-6 border-b-2 border-dashed border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-md flex items-center justify-center overflow-hidden">
                    <img src="/logo.png" alt="Movyra" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-[20px] font-black tracking-tight text-black leading-none">Movyra</h2>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Tax Invoice</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-[12px] font-black text-black tracking-wider uppercase">{order.id.slice(-8)}</span>
                  <span className="block text-[11px] font-bold text-gray-400 mt-1">{formattedDate.split(',')[0]}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-[14px] font-bold text-gray-500">Logistics Base Fare</span>
                  <span className="text-[14px] font-black text-black">₹{taxableValue.toFixed(2)}</span>
                </div>
                {order.pricing?.isGroupDelivery && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="text-[14px] font-bold">Group Pool Discount</span>
                    <span className="text-[14px] font-black">Applied</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-[14px] font-bold text-gray-500">CGST (9%)</span>
                  <span className="text-[14px] font-black text-black">₹{cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-[14px] font-bold text-gray-500">SGST (9%)</span>
                  <span className="text-[14px] font-black text-black">₹{sgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[18px] font-black text-black uppercase tracking-wide">Final Total</span>
                  <span className="text-[28px] font-black text-black tracking-tight">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center mt-6 pt-6 border-t border-gray-100">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">GSTIN: 27AADCM9999A1Z9</p>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Paid securely via Movyra App</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* SECTION 5: Floating Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pt-4 bg-[#F6F6F6]/90 backdrop-blur-md z-30">
        <button 
          onClick={handleDownloadInvoice}
          disabled={isDownloading}
          className="w-full flex items-center justify-center gap-3 px-6 bg-black text-white py-4 rounded-full font-bold text-[17px] hover:bg-gray-900 active:scale-[0.98] transition-all h-[60px] shadow-[0_10px_30px_rgba(0,0,0,0.2)] disabled:opacity-50"
        >
          {isDownloading ? <Loader2 size={20} className="animate-spin text-white" /> : <Download size={20} strokeWidth={3} />}
          {isDownloading ? 'Processing PDF...' : 'Download Full Invoice'}
        </button>
      </div>

    </div>
  );
}