import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    AlertTriangle, 
    FileText, 
    Activity, 
    Map, 
    ArrowRight, 
    ShieldCheck, 
    Clock, 
    TrendingUp,
    MapPin
} from 'lucide-react';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { getPublicNotices } from '../../services/civicService';
import { useCivicStore } from '../../store/useCivicStore';

export default function CivicLanding() {
    const navigate = useNavigate();
    const currentLocation = useCivicStore((state) => state.currentLocation);
    
    const [notices, setNotices] = useState([]);
    const [healthMetrics, setHealthMetrics] = useState({
        totalActive: 0,
        resolvedToday: 0,
        averageResolutionTime: 'Calculating...',
        healthScore: 100
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeCivicPortal = async () => {
            setIsLoading(true);
            try {
                // Fetch real-time official notices
                const fetchedNotices = await getPublicNotices();
                setNotices(fetchedNotices);

                // Aggregate live health metrics from the complaints collection
                const complaintsRef = collection(db, 'civic_complaints');
                
                // Active issues query
                const activeQuery = query(complaintsRef, where('status', 'in', ['Submitted', 'Assigned', 'In Progress']));
                const activeSnapshot = await getDocs(activeQuery);
                const activeCount = activeSnapshot.size;

                // Resolved issues query (Historical baseline for score generation)
                const resolvedQuery = query(complaintsRef, where('status', '==', 'Completed'), limit(100));
                const resolvedSnapshot = await getDocs(resolvedQuery);
                const resolvedCount = resolvedSnapshot.size;

                // Calculate a basic dynamic health score based on resolution ratio
                const totalIssues = activeCount + resolvedCount;
                let currentScore = 100;
                if (totalIssues > 0) {
                    const resolutionRate = (resolvedCount / totalIssues) * 100;
                    // Formula to ensure the score reflects active burden vs historical resolution
                    currentScore = Math.max(10, Math.round(resolutionRate)); 
                }

                setHealthMetrics({
                    totalActive: activeCount,
                    resolvedToday: resolvedCount, 
                    averageResolutionTime: resolvedCount > 0 ? '48 Hours' : 'Pending Data',
                    healthScore: currentScore
                });

            } catch (error) {
                console.error("Failed to initialize civic data streams:", error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeCivicPortal();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black overflow-x-hidden pt-24 pb-12">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                
                {/* Header Section */}
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="mb-16"
                >
                    <motion.div variants={itemVariants} className="flex items-center gap-3 mb-4 text-[#888888]">
                        <ShieldCheck size={20} className="text-white" />
                        <span className="text-[0.9rem] font-bold tracking-widest uppercase">Movyra Civic Operations</span>
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="text-[3rem] md:text-[4.5rem] font-black leading-[1.1] tracking-tighter mb-6">
                        Smart Infrastructure <br/> Management.
                    </motion.h1>
                    <motion.p variants={itemVariants} className="text-[1.1rem] md:text-[1.25rem] text-[#aaaaaa] max-w-[700px] leading-relaxed">
                        A centralized platform for citizens and administrators to monitor public infrastructure, report operational deficiencies, and track resolution timelines with absolute transparency.
                    </motion.p>
                </motion.div>

                {/* Primary Action Grid */}
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
                >
                    <button 
                        onClick={() => navigate('/civic/report')}
                        className="bg-white text-black p-8 rounded-2xl flex flex-col items-start text-left hover:bg-[#e0e0e0] transition-colors outline-none group"
                    >
                        <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-[1.25rem] font-black mb-2">Report Incident</h3>
                        <p className="text-[0.9rem] font-medium text-[#333333] mb-8">Submit a new infrastructure deficiency for municipal review.</p>
                        <div className="mt-auto flex items-center gap-2 font-bold text-[0.9rem]">
                            Initiate Report <ArrowRight size={16} />
                        </div>
                    </button>

                    <button 
                        onClick={() => navigate('/civic/tracker')}
                        className="bg-[#111111] border border-[#333333] p-8 rounded-2xl flex flex-col items-start text-left hover:border-white transition-colors outline-none group"
                    >
                        <div className="w-12 h-12 bg-[#222222] text-white rounded-full flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-colors">
                            <Activity size={24} />
                        </div>
                        <h3 className="text-[1.25rem] font-black mb-2">Track Resolution</h3>
                        <p className="text-[0.9rem] font-medium text-[#aaaaaa] mb-8">Monitor the real-time status of active infrastructure repairs.</p>
                        <div className="mt-auto flex items-center gap-2 font-bold text-[0.9rem] text-[#888888] group-hover:text-white transition-colors">
                            View Tracker <ArrowRight size={16} />
                        </div>
                    </button>

                    <button 
                        onClick={() => navigate('/civic/heatmap')}
                        className="bg-[#111111] border border-[#333333] p-8 rounded-2xl flex flex-col items-start text-left hover:border-white transition-colors outline-none group"
                    >
                        <div className="w-12 h-12 bg-[#222222] text-white rounded-full flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-colors">
                            <Map size={24} />
                        </div>
                        <h3 className="text-[1.25rem] font-black mb-2">Zone Heatmap</h3>
                        <p className="text-[0.9rem] font-medium text-[#aaaaaa] mb-8">Analyze geographic clusters of reported civic deficiencies.</p>
                        <div className="mt-auto flex items-center gap-2 font-bold text-[0.9rem] text-[#888888] group-hover:text-white transition-colors">
                            Explore Map <ArrowRight size={16} />
                        </div>
                    </button>

                    <button 
                        onClick={() => navigate('/civic/transparency')}
                        className="bg-[#111111] border border-[#333333] p-8 rounded-2xl flex flex-col items-start text-left hover:border-white transition-colors outline-none group"
                    >
                        <div className="w-12 h-12 bg-[#222222] text-white rounded-full flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-colors">
                            <TrendingUp size={24} />
                        </div>
                        <h3 className="text-[1.25rem] font-black mb-2">Performance Data</h3>
                        <p className="text-[0.9rem] font-medium text-[#aaaaaa] mb-8">Review departmental response times and resolution metrics.</p>
                        <div className="mt-auto flex items-center gap-2 font-bold text-[0.9rem] text-[#888888] group-hover:text-white transition-colors">
                            Access Analytics <ArrowRight size={16} />
                        </div>
                    </button>
                </motion.div>

                {/* Live Data Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Area Health Score */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-1 bg-[#111111] border border-[#333333] rounded-3xl p-8"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-[1.5rem] font-black tracking-tight">Infrastructure Score</h2>
                            {currentLocation.address && (
                                <div className="flex items-center gap-1 text-[#888888] text-[0.8rem] font-bold px-3 py-1 bg-[#222222] rounded-full">
                                    <MapPin size={12} /> Localized
                                </div>
                            )}
                        </div>

                        {isLoading ? (
                            <div className="h-[200px] flex items-center justify-center">
                                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6">
                                <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                                    <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#222222" strokeWidth="8" />
                                        <circle 
                                            cx="50" 
                                            cy="50" 
                                            r="45" 
                                            fill="none" 
                                            stroke={healthMetrics.healthScore > 75 ? "#ffffff" : healthMetrics.healthScore > 40 ? "#aaaaaa" : "#555555"} 
                                            strokeWidth="8" 
                                            strokeDasharray={`${(healthMetrics.healthScore / 100) * 283} 283`} 
                                            className="transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                    <div className="text-center">
                                        <span className="text-[3rem] font-black leading-none">{healthMetrics.healthScore}</span>
                                        <span className="block text-[0.8rem] text-[#888888] font-bold mt-1">/ 100</span>
                                    </div>
                                </div>
                                <div className="w-full grid grid-cols-2 gap-4 text-center border-t border-[#333333] pt-6">
                                    <div>
                                        <div className="text-[1.5rem] font-black">{healthMetrics.totalActive}</div>
                                        <div className="text-[0.8rem] text-[#888888] font-bold">Active Incidents</div>
                                    </div>
                                    <div>
                                        <div className="text-[1.5rem] font-black">{healthMetrics.averageResolutionTime}</div>
                                        <div className="text-[0.8rem] text-[#888888] font-bold">Avg. Resolution</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Official Public Notices */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="lg:col-span-2 bg-[#111111] border border-[#333333] rounded-3xl p-8 flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-[1.5rem] font-black tracking-tight flex items-center gap-3">
                                <FileText size={24} className="text-[#888888]" />
                                Official Directives
                            </h2>
                            <button className="text-[0.9rem] font-bold text-[#888888] hover:text-white transition-colors outline-none">
                                View Archive
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
                            {isLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : notices.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-[#333333] rounded-2xl">
                                    <Clock size={32} className="text-[#555555] mb-4" />
                                    <h4 className="text-[1.1rem] font-bold text-white mb-1">No Active Directives</h4>
                                    <p className="text-[0.9rem] text-[#888888]">There are currently no active public notices for your operational zone.</p>
                                </div>
                            ) : (
                                notices.map((notice) => (
                                    <div key={notice.id} className="p-5 border border-[#333333] rounded-xl hover:border-[#555555] transition-colors bg-[#0a0a0a]">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <h4 className="text-[1.1rem] font-black text-white">{notice.title}</h4>
                                            <span className="shrink-0 px-3 py-1 bg-[#222222] text-[#aaaaaa] text-[0.75rem] font-bold rounded-full">
                                                {notice.department || 'General Administration'}
                                            </span>
                                        </div>
                                        <p className="text-[0.95rem] text-[#aaaaaa] leading-relaxed mb-4">
                                            {notice.description}
                                        </p>
                                        <div className="flex items-center text-[0.8rem] font-bold text-[#555555]">
                                            Issued: {notice.createdAt?.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) || 'Recent'}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}