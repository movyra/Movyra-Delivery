import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    ArrowLeft, 
    CheckCircle, 
    Clock, 
    Wrench, 
    FileText,
    Calendar,
    Image as ImageIcon,
    ShieldCheck
} from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function IssueTracker() {
    const navigate = useNavigate();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [activeRecord, setActiveRecord] = useState(null);
    const [recentRecords, setRecentRecords] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [searchMessage, setSearchMessage] = useState('');

    useEffect(() => {
        const fetchRecentActivity = async () => {
            try {
                const complaintsRef = collection(db, 'civic_complaints');
                const recentQuery = query(complaintsRef, orderBy('createdAt', 'desc'), limit(5));
                const snapshot = await getDocs(recentQuery);
                
                const records = snapshot.docs.map(document => ({
                    id: document.id,
                    ...document.data()
                }));
                setRecentRecords(records);
            } catch (error) {
                console.error("Failed to retrieve recent activity logs:", error);
            }
        };

        fetchRecentActivity();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsProcessing(true);
        setSearchMessage('');
        setActiveRecord(null);

        try {
            const documentRef = doc(db, 'civic_complaints', searchQuery.trim());
            const documentSnapshot = await getDoc(documentRef);

            if (documentSnapshot.exists()) {
                setActiveRecord({ id: documentSnapshot.id, ...documentSnapshot.data() });
            } else {
                setSearchMessage('No administrative record found matching this identification number.');
            }
        } catch (error) {
            console.error("Search execution failed:", error);
            setSearchMessage('Network transmission failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const loadRecordDirectly = (record) => {
        setActiveRecord(record);
        setSearchQuery(record.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const calculateEstimatedResolution = (createdAt, priority) => {
        if (!createdAt) return 'Pending Assignment';
        
        const baseDate = createdAt.toDate();
        let daysToAdd = 7; // Standard Priority default
        
        if (priority === 'Critical') daysToAdd = 1;
        if (priority === 'High') daysToAdd = 3;

        baseDate.setDate(baseDate.getDate() + daysToAdd);
        return baseDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const getTimelineStage = (status) => {
        const stages = ['Submitted', 'Assigned', 'In Progress', 'Completed'];
        const currentIndex = stages.indexOf(status);
        return currentIndex >= 0 ? currentIndex : 0;
    };

    const timelineSteps = [
        { title: 'Incident Registered', icon: FileText, description: 'Report successfully transmitted to municipal database.' },
        { title: 'Personnel Assigned', icon: ShieldCheck, description: 'Departmental review complete and operations team allocated.' },
        { title: 'Maintenance In Progress', icon: Wrench, description: 'Field personnel are actively executing required repairs.' },
        { title: 'Operations Concluded', icon: CheckCircle, description: 'Infrastructure deficiency resolved and verified.' }
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black overflow-x-hidden pt-24 pb-12">
            <div className="max-w-[1000px] mx-auto px-6 md:px-12">
                
                <button 
                    onClick={() => navigate('/civic')}
                    className="flex items-center gap-2 text-[#888888] hover:text-white transition-colors mb-10 outline-none font-bold text-[0.9rem]"
                >
                    <ArrowLeft size={16} /> Return to Operations Portal
                </button>

                <div className="mb-12">
                    <h1 className="text-[2.5rem] md:text-[3.5rem] font-black leading-[1.1] tracking-tighter mb-4">
                        Resolution Tracker
                    </h1>
                    <p className="text-[#aaaaaa] text-[1.1rem]">
                        Monitor the operational status and deployment progress of reported infrastructure deficiencies.
                    </p>
                </div>

                {/* Search Interface */}
                <div className="bg-[#111111] border border-[#333333] rounded-2xl p-6 md:p-8 mb-12">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]" />
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Enter Incident Tracking Identification Number..." 
                                className="w-full bg-[#000000] border border-[#333333] text-white pl-12 pr-4 py-4 rounded-xl outline-none focus:border-white transition-colors text-[0.95rem]"
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={isProcessing || !searchQuery.trim()}
                            className="bg-white text-black px-8 py-4 rounded-xl font-black text-[0.95rem] hover:bg-[#e0e0e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                        >
                            {isProcessing ? 'Querying...' : 'Retrieve Record'}
                        </button>
                    </form>
                    {searchMessage && (
                        <p className="text-[#ff4444] text-[0.9rem] mt-4 font-bold">{searchMessage}</p>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {activeRecord ? (
                        <motion.div 
                            key="active-record"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-[#111111] border border-[#333333] rounded-2xl overflow-hidden"
                        >
                            <div className="p-6 md:p-8 border-b border-[#333333] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-3 py-1 bg-[#222222] text-white text-[0.75rem] font-black tracking-wider uppercase rounded-full">
                                            {activeRecord.category}
                                        </span>
                                        <span className={`px-3 py-1 text-[0.75rem] font-black tracking-wider uppercase rounded-full ${
                                            activeRecord.priority === 'Critical' ? 'bg-[#330000] text-[#ff4444]' : 
                                            activeRecord.priority === 'High' ? 'bg-[#331a00] text-[#ffaa00]' : 
                                            'bg-[#002211] text-[#00ff88]'
                                        }`}>
                                            {activeRecord.priority} Priority
                                        </span>
                                    </div>
                                    <h2 className="text-[1.5rem] font-black text-white">{activeRecord.title}</h2>
                                    <p className="text-[#888888] text-[0.9rem] font-mono mt-1">ID: {activeRecord.id}</p>
                                </div>
                                
                                <div className="bg-[#000000] border border-[#333333] rounded-xl p-4 min-w-[200px]">
                                    <div className="flex items-center gap-2 text-[#888888] text-[0.8rem] font-bold uppercase tracking-wider mb-1">
                                        <Calendar size={14} /> Estimated Resolution
                                    </div>
                                    <div className="text-white font-bold text-[0.95rem]">
                                        {activeRecord.status === 'Completed' ? 'Operations Concluded' : calculateEstimatedResolution(activeRecord.createdAt, activeRecord.priority)}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 md:p-8 border-b border-[#333333]">
                                <h3 className="text-[1.1rem] font-black mb-6">Operational Timeline</h3>
                                <div className="relative">
                                    <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-[#333333] z-0"></div>
                                    
                                    <div className="flex flex-col gap-8 relative z-10">
                                        {timelineSteps.map((step, index) => {
                                            const currentStage = getTimelineStage(activeRecord.status);
                                            const isCompleted = index <= currentStage;
                                            const isCurrent = index === currentStage;
                                            const StepIcon = step.icon;

                                            return (
                                                <div key={index} className="flex gap-6">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${
                                                        isCompleted ? 'bg-white border-white text-black' : 'bg-[#000000] border-[#333333] text-[#555555]'
                                                    }`}>
                                                        <StepIcon size={18} />
                                                    </div>
                                                    <div className="pt-1">
                                                        <h4 className={`text-[1.05rem] font-black ${isCompleted ? 'text-white' : 'text-[#555555]'}`}>
                                                            {step.title}
                                                        </h4>
                                                        <p className={`text-[0.9rem] mt-1 ${isCurrent ? 'text-[#aaaaaa]' : 'text-[#555555]'}`}>
                                                            {step.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 md:p-8 bg-[#0a0a0a] grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-[0.9rem] font-bold text-[#888888] uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <FileText size={16} /> Detailed Assessment
                                    </h3>
                                    <p className="text-[#aaaaaa] text-[0.95rem] leading-relaxed whitespace-pre-wrap">
                                        {activeRecord.description}
                                    </p>
                                </div>
                                
                                {activeRecord.evidenceUrl && (
                                    <div>
                                        <h3 className="text-[0.9rem] font-bold text-[#888888] uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <ImageIcon size={16} /> Initial Documentation
                                        </h3>
                                        <div className="w-full aspect-video rounded-xl overflow-hidden border border-[#333333] bg-[#000000]">
                                            <img 
                                                src={activeRecord.evidenceUrl} 
                                                alt="Infrastructure Deficiency Documentation" 
                                                className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="recent-records"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <h3 className="text-[1.2rem] font-black mb-6 flex items-center gap-2">
                                <Clock size={20} className="text-[#888888]" /> Recent Public Filings
                            </h3>
                            
                            {recentRecords.length === 0 ? (
                                <div className="bg-[#111111] border border-[#333333] rounded-2xl p-10 text-center">
                                    <p className="text-[#888888]">Retrieving administrative records...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {recentRecords.map((record) => (
                                        <div 
                                            key={record.id}
                                            onClick={() => loadRecordDirectly(record)}
                                            className="bg-[#111111] border border-[#333333] p-6 rounded-2xl hover:border-white transition-colors cursor-pointer group"
                                        >
                                            <div className="flex justify-between items-start gap-4 mb-3">
                                                <h4 className="text-[1.1rem] font-black text-white group-hover:underline">{record.title}</h4>
                                                <span className="shrink-0 text-[0.8rem] font-mono text-[#555555]">ID: {record.id.substring(0, 8)}...</span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-[0.85rem] font-bold">
                                                <span className="text-[#aaaaaa]">{record.category}</span>
                                                <span className="w-1 h-1 rounded-full bg-[#333333]"></span>
                                                <span className={record.status === 'Completed' ? 'text-[#00ff88]' : 'text-[#ffaa00]'}>
                                                    Status: {record.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}