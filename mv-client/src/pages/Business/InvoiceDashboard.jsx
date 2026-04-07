import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, FileText, Download, Building2, 
  Search, TrendingUp, Calendar, CheckCircle2, 
  Clock, AlertCircle, Loader2, Receipt
} from 'lucide-react';

// Real Store, Auth & Services Integration
import { auth } from '../../services/firebaseAuth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Premium Design System Components
import SystemCard from '../../components/UI/SystemCard';
import SystemButton from '../../components/UI/SystemButton';

/**
 * PAGE: B2B INVOICE DASHBOARD
 * Architecture: Enterprise dashboard for Business accounts.
 * Features:
 * - Real-time memory aggregation of historical orders into monthly invoices
 * - Native CSV Export generation
 * - Tax (GST) mathematical breakdown
 * - YTD Spend Analytics
 * - Dynamic Dark Mode compatibility
 */

// Utility for strict isolated tenant DB paths
const getAppId = () => {
  if (typeof window !== 'undefined' && window.__app_id) return window.__app_id;
  if (typeof __app_id !== 'undefined') return __app_id;
  return 'default-app-id';
};

export default function InvoiceDashboard() {
  const navigate = useNavigate();
  const db = getFirestore();
  
  // State Management
  const [isLoading, setIsLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [ytdSpend, setYtdSpend] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const currentUser = auth.currentUser;
  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || "Business Account";

  // ============================================================================
  // LOGIC: REAL-TIME FIRESTORE AGGREGATION & TAX ENGINE
  // ============================================================================
  useEffect(() => {
    const fetchAndAggregateInvoices = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        const appId = getAppId();
        // STRICT PATH RULE: Private user data path
        const ordersRef = collection(db, 'artifacts', appId, 'users', currentUser.uid, 'orders');
        
        // Fetch all orders (bypassing index requirements)
        const snapshot = await getDocs(ordersRef);
        
        const groupedInvoices = {};
        let totalSpend = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          
          // Only aggregate completed deliveries
          if (data.status === 'delivered') {
            const date = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
            const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
            
            const amount = data.pricing?.estimatedPrice || data.totalFare || 0;
            totalSpend += amount;

            if (!groupedInvoices[monthYear]) {
              groupedInvoices[monthYear] = {
                id: monthYear.replace(/\s+/g, '-').toLowerCase(),
                month: monthYear,
                dateObj: date,
                totalOrders: 0,
                totalAmount: 0,
                orders: []
              };
            }

            groupedInvoices[monthYear].totalOrders += 1;
            groupedInvoices[monthYear].totalAmount += amount;
            groupedInvoices[monthYear].orders.push({
              id: doc.id,
              date: date.toLocaleDateString(),
              amount: amount,
              status: data.status
            });
          }
        });

        // Convert object to array and sort chronologically (newest first)
        const sortedInvoices = Object.values(groupedInvoices).sort((a, b) => b.dateObj - a.dateObj);
        
        setInvoices(sortedInvoices);
        setYtdSpend(totalSpend);
        setIsLoading(false);

      } catch (err) {
        console.error("Failed to aggregate invoices:", err);
        setError("Unable to compile invoice data. Please check your connection.");
        setIsLoading(false);
      }
    };

    fetchAndAggregateInvoices();
  }, [currentUser, db]);

  // ============================================================================
  // LOGIC: NATIVE CSV EXPORT ENGINE
  // ============================================================================
  const handleDownloadCSV = (invoice) => {
    // Generate CSV Header
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Order ID,Base Fare (INR),CGST 9% (INR),SGST 9% (INR),Total (INR),Status\n";

    // Generate CSV Rows with Tax Math
    invoice.orders.forEach(order => {
      const total = order.amount;
      const base = (total / 1.18).toFixed(2);
      const taxHalf = ((total - base) / 2).toFixed(2);
      
      const row = `${order.date},${order.id},${base},${taxHalf},${taxHalf},${total},${order.status}`;
      csvContent += row + "\n";
    });

    // Native Browser Download Trigger
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Movyra_Tax_Invoice_${invoice.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  const filteredInvoices = invoices.filter(inv => 
    inv.month.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentMonthStr = `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`;

  return (
    <div className="min-h-[100dvh] bg-[#F2F4F7] dark:bg-[#111111] text-[#111111] dark:text-[#F6F6F6] font-sans relative flex flex-col transition-colors duration-300">
      
      {/* Top Navigation */}
      <div className="px-6 pt-14 pb-4 flex items-center gap-4 sticky top-0 z-50 bg-[#F2F4F7]/90 dark:bg-[#111111]/90 backdrop-blur-md transition-colors duration-300">
        <button 
          onClick={() => navigate(-1)} 
          className="w-[46px] h-[46px] bg-white dark:bg-[#222222] rounded-full flex items-center justify-center text-[#111111] dark:text-white shadow-[0_4px_15px_rgba(0,0,0,0.08)] active:scale-95 transition-all shrink-0"
        >
          <ChevronLeft size={24} strokeWidth={2.5} className="-ml-0.5" />
        </button>
        <h1 className="text-[32px] font-black tracking-tighter text-[#111111] dark:text-white leading-none">
          Tax Invoices
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-2 pb-32 space-y-4">
        
        {/* Business Identity & Analytics Header */}
        <SystemCard animated variant="white" className="!p-6 dark:bg-[#1A1A1A] dark:border-[#333333] transition-colors relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#276EF1] blur-[100px] opacity-10 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-[#111111] dark:bg-white rounded-full flex items-center justify-center text-white dark:text-[#111111] shrink-0 shadow-lg">
                <Building2 size={24} strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-[20px] font-black text-[#111111] dark:text-white tracking-tight leading-tight">{displayName}</h2>
                <p className="text-[12px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">B2B Verified Account</p>
              </div>
            </div>

            <div className="bg-[#F6F6F6] dark:bg-[#222222] rounded-[24px] p-5 flex items-center justify-between border border-gray-100 dark:border-gray-800 transition-colors">
              <div>
                <p className="text-[13px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <TrendingUp size={14} /> YTD Spend
                </p>
                <h3 className="text-[28px] font-black text-[#111111] dark:text-white tracking-tighter leading-none">
                  ₹{ytdSpend.toLocaleString('en-IN')}
                </h3>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                <Receipt size={24} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </SystemCard>

        {/* Search Bar */}
        <div className="relative">
          <Search size={20} strokeWidth={2.5} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by month (e.g., October)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#222222] py-4 pl-14 pr-4 rounded-[24px] font-bold text-[15px] text-[#111111] dark:text-white outline-none shadow-sm border border-transparent focus:border-[#111111] dark:focus:border-white transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Loading / Error / Empty States */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-[#111111] dark:text-white mb-3" />
            <p className="text-[14px] font-bold text-gray-500">Compiling ledger...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 p-5 rounded-[24px] flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-[14px] font-bold text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-white dark:bg-[#222222] rounded-full flex items-center justify-center shadow-sm mb-4">
              <FileText size={32} className="text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-[20px] font-black text-[#111111] dark:text-white tracking-tight">No Invoices Found</h3>
            <p className="text-[14px] font-bold text-gray-500 dark:text-gray-400 mt-2 max-w-[250px]">
              Completed deliveries will be aggregated here at the end of each month.
            </p>
          </div>
        ) : (
          /* Invoice List Engine */
          <div className="space-y-4">
            <AnimatePresence>
              {filteredInvoices.map((invoice, index) => {
                const isCurrentMonth = invoice.month === currentMonthStr;
                const baseAmount = (invoice.totalAmount / 1.18);
                const taxAmount = invoice.totalAmount - baseAmount;

                return (
                  <motion.div
                    key={invoice.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <SystemCard variant="white" className="!p-5 dark:bg-[#222222] dark:border-gray-800 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar size={16} className="text-[#276EF1]" />
                            <h3 className="text-[18px] font-black tracking-tight text-[#111111] dark:text-white">{invoice.month}</h3>
                          </div>
                          <p className="text-[13px] font-bold text-gray-500">
                            {invoice.totalOrders} Completed Deliveries
                          </p>
                        </div>
                        
                        {/* Dynamic Status Indicator */}
                        {isCurrentMonth ? (
                          <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                            <Clock size={12} strokeWidth={3} /> Unbilled
                          </span>
                        ) : (
                          <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                            <CheckCircle2 size={12} strokeWidth={3} /> Generated
                          </span>
                        )}
                      </div>

                      {/* Tax Mathematics Engine UI */}
                      <div className="bg-[#F6F6F6] dark:bg-[#1A1A1A] rounded-[16px] p-4 mb-4 border border-gray-100 dark:border-[#333333]">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[13px] font-bold text-gray-500">Taxable Value</span>
                          <span className="text-[13px] font-black text-[#111111] dark:text-white">₹{baseAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[13px] font-bold text-gray-500">GST (18%)</span>
                          <span className="text-[13px] font-black text-[#111111] dark:text-white">₹{taxAmount.toFixed(2)}</span>
                        </div>
                        <div className="h-px w-full bg-gray-200 dark:bg-gray-700 mb-3" />
                        <div className="flex justify-between items-center">
                          <span className="text-[14px] font-black text-[#111111] dark:text-white tracking-tight">Total Invoice</span>
                          <span className="text-[18px] font-black text-[#276EF1] dark:text-[#4dabf7] tracking-tighter">₹{invoice.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>

                      <SystemButton 
                        onClick={() => handleDownloadCSV(invoice)}
                        variant="secondary"
                        icon={Download}
                        className="w-full !py-3.5 !bg-white dark:!bg-[#2A2A2A] border-2 border-gray-100 dark:border-gray-700 text-[#111111] dark:text-white active:scale-[0.98]"
                      >
                        Download Report (.csv)
                      </SystemButton>
                    </SystemCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}