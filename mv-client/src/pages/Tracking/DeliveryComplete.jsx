import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Download, ArrowRight, MapPin, Loader2, Receipt } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Real Store Integration
import useBookingStore from '../../store/useBookingStore';

// ============================================================================
// PAGE: DELIVERY COMPLETE & GST INVOICE (STARK MINIMALIST UI)
// Renders the final digital receipt with real math (Base Fare + 18% GST).
// Features native PDF generation for B2B expense tracking.
// ============================================================================

export default function DeliveryComplete() {
  const navigate = useNavigate();
  const receiptRef = useRef(null);
  
  // Real Global State
  const { pickup, dropoffs, pricing, vehicleType, activeOrder } = useBookingStore();
  
  // Local UI State
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Generate precise invoice timestamp
    const now = new Date();
    setCurrentDate(now.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    }));
  }, []);

  // ============================================================================
  // LOGIC: REAL GST MATH CALCULATIONS (18% Logistics Standard)
  // Assumes the final estimated price quoted to the user was inclusive of GST.
  // ============================================================================
  const finalTotal = pricing?.estimatedPrice || 0;
  // Taxable Base Value = Total / 1.18
  const taxableValue = finalTotal / 1.18;
  const cgst = (taxableValue * 0.09); // 9% CGST
  const sgst = (taxableValue * 0.09); // 9% SGST
  
  const orderId = activeOrder || `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // ============================================================================
  // LOGIC: PDF GENERATION ENGINE
  // ============================================================================
  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    setIsDownloading(true);

    try {
      // Capture the physical DOM element of the receipt
      const canvas = await html2canvas(receiptRef.current, {
        scale: 3, // High-res export
        useCORS: true,
        backgroundColor: '#FFFFFF',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Movyra_Tax_Invoice_${orderId}.pdf`);
    } catch (error) {
      console.error("PDF Generation Failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleProceedToRating = () => {
    navigate('/tracking/rating', { replace: true });
  };

  // ============================================================================
  // RENDER UI
  // ============================================================================
  return (
    <div className="min-h-screen bg-[#F6F6F6] text-black flex flex-col font-sans relative">
      
      {/* SECTION 1: Success Header */}
      <div className="pt-16 px-6 pb-6 text-center z-10">
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }} 
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="w-20 h-20 bg-black rounded-full mx-auto flex items-center justify-center mb-6 shadow-[0_15px_30px_rgba(0,0,0,0.2)] border-4 border-white"
        >
          <CheckCircle2 size={40} className="text-white" strokeWidth={2.5} />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-[40px] font-black tracking-tighter text-black leading-none mb-2"
        >
          Delivered.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-[15px] font-bold text-gray-500"
        >
          Your package has reached its destination safely.
        </motion.p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-32 z-10">
        
        {/* SECTION 2: The Digital Receipt Card (Targeted for PDF Export) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-[24px] shadow-sm border border-gray-200 overflow-hidden relative"
        >
          {/* Printable Area Wrapper */}
          <div ref={receiptRef} className="p-6 bg-white">
            
            {/* Receipt Header */}
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
                <span className="block text-[14px] font-black text-black">{orderId}</span>
                <span className="block text-[12px] font-bold text-gray-400 mt-0.5">{currentDate}</span>
              </div>
            </div>

            {/* Route Details */}
            <div className="mb-6 relative border-l-2 border-dashed border-gray-300 ml-3 pl-5 space-y-4">
              <div className="relative">
                <div className="absolute -left-[27px] top-1 w-3 h-3 bg-black rounded-full ring-4 ring-white" />
                <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Pickup</span>
                <p className="text-[14px] font-bold text-black leading-snug">{pickup?.address || 'Origin Address'}</p>
              </div>
              
              <div className="relative">
                <div className="absolute -left-[27px] top-1 w-3 h-3 bg-white border-4 border-black rounded-sm ring-4 ring-white" />
                <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Dropoff</span>
                <p className="text-[14px] font-bold text-black leading-snug">{dropoffs[dropoffs.length - 1]?.address || 'Destination Address'}</p>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="bg-[#F6F6F6] rounded-xl p-4 mb-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[13px] font-bold text-gray-500">Service: {vehicleType ? vehicleType.toUpperCase() : 'DELIVERY'}</span>
                <span className="text-[13px] font-black text-black">₹{taxableValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[13px] font-bold text-gray-500">CGST (9%)</span>
                <span className="text-[13px] font-black text-black">₹{cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-300 mb-3">
                <span className="text-[13px] font-bold text-gray-500">SGST (9%)</span>
                <span className="text-[13px] font-black text-black">₹{sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[16px] font-black text-black uppercase tracking-wide">Total Paid</span>
                <span className="text-[24px] font-black text-black tracking-tight">₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="text-center mt-6">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">GSTIN: 27AADCM9999A1Z9</p>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Thank you for shipping with Movyra</p>
            </div>
          </div>
          
          {/* Perforated Bottom Edge Effect */}
          <div className="absolute bottom-0 left-0 right-0 h-3 flex justify-between px-2 pb-[-4px] overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="w-3 h-3 bg-[#F6F6F6] rounded-full translate-y-1.5 shadow-inner" />
            ))}
          </div>
        </motion.div>

        {/* Download Action */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 flex justify-center">
          <button 
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex items-center gap-2 px-6 py-3 bg-white rounded-full font-bold text-[14px] text-black border-2 border-gray-200 hover:border-black transition-all active:scale-95 shadow-sm disabled:opacity-50"
          >
            {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} strokeWidth={2.5} />}
            {isDownloading ? 'Generating PDF...' : 'Download Invoice PDF'}
          </button>
        </motion.div>

      </div>

      {/* SECTION 3: Floating Bottom CTA (Transition to Rating) */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pt-4 bg-[#F6F6F6]/90 backdrop-blur-md z-50">
        <button 
          onClick={handleProceedToRating}
          className="w-full flex items-center justify-between px-6 bg-black text-white py-4 rounded-full font-bold text-[17px] hover:bg-gray-900 active:scale-[0.98] transition-all h-[60px] shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
        >
          <span className="flex-1 text-center pl-6">Rate Your Driver</span>
          <ArrowRight size={24} className="text-white" />
        </button>
      </div>

    </div>
  );
}