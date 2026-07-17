import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, 
    BarChart, 
    CheckCircle, 
    Clock, 
    TrendingUp,
    ShieldCheck
} from 'lucide-react';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function TransparencyDashboard() {
    const navigate = useNavigate();
    
    const [isLoading, setIsLoading] = useState(true);
    const [performanceMetrics, setPerformanceMetrics] = useState({
        totalVolume: 0,
        resolvedVolume: 0,
        overallResolutionRate: 0,
        departmentStats: {}
    });

    useEffect(() => {
        const generateLiveAnalytics = async () => {
            setIsLoading(true);
            try {
                const complaintsRef = collection(db, 'civic_complaints');
                // Retrieve a significant operational sample for accurate analytics
                const analyticsQuery = query(complaintsRef, orderBy('createdAt', 'desc'), limit(500));
                const snapshot = await getDocs(analyticsQuery);
                
                let total = 0;
                let resolved = 0;
                const departments = {};

                snapshot.forEach((document) => {
                    const data = document.data();
                    const category = data.category || 'Uncategorized Operations';
                    const isCompleted = data.status === 'Completed';

                    total += 1;
                    if (isCompleted) resolved += 1;

                    if (!departments[category]) {
                        departments[category] = { total: 0, resolved: 0 };
                    }
                    
                    departments[category].total += 1;
                    if (isCompleted) {
                        departments[category].resolved += 1;
                    }
                });

                const overallRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

                setPerformanceMetrics({
                    totalVolume: total,
                    resolvedVolume: resolved,
                    overallResolutionRate: overallRate,
                    departmentStats: departments
                });

            } catch (error) {
                console.error("Failed to aggregate live operational analytics:", error);
            } finally {
                setIsLoading(false);
            }
        };

        generateLiveAnalytics();
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
            <div className="max-w-[1200px] mx-auto px-6 md:px-12">
                
                <button 
                    onClick={() => navigate('/civic')}
                    className="flex items-center gap-2 text-[#888888] hover:text-white transition-colors mb-10 outline-none font-bold text-[0.9rem]"
                >
                    <ArrowLeft size={16} /> Return to Operations Portal
                </button>

                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="mb-12"
                >
                    <motion.div variants={itemVariants} className="flex items-center gap-3 mb-4 text-[#888888]">
                        <BarChart size={20} className="text-white" />
                        <span className="text-[0.9rem] font-bold tracking-widest uppercase">Public Accountability</span>
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="text-[2.5rem] md:text-[3.5rem] font-black leading-[1.1] tracking-tighter mb-4">
                        Performance Analytics
                    </motion.h1>
                    <motion.p variants={itemVariants} className="text-[#aaaaaa] text-[1.1rem] max-w-[700px]">
                        Live operational data reflecting municipal efficiency, departmental workloads, and overall resolution rates.
                    </motion.p>
                </motion.div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-[#888888] font-bold">Aggregating live database records...</p>
                    </div>
                ) : (
                    <motion.div 
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                    >
                        {/* High-Level Executive Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <motion.div variants={itemVariants} className="bg-[#111111] border border-[#333333] rounded-2xl p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[#888888] font-bold text-[0.9rem] uppercase tracking-wider">Total Incidents</h3>
                                    <BarChart size={20} className="text-white" />
                                </div>
                                <div className="text-[3rem] font-black leading-none mb-2">{performanceMetrics.totalVolume}</div>
                                <p className="text-[#555555] text-[0.85rem] font-bold">Documented Operational Cycle</p>
                            </motion.div>

                            <motion.div variants={itemVariants} className="bg-[#111111] border border-[#333333] rounded-2xl p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[#888888] font-bold text-[0.9rem] uppercase tracking-wider">Resolved</h3>
                                    <CheckCircle size={20} className="text-[#00ff88]" />
                                </div>
                                <div className="text-[3rem] font-black leading-none mb-2">{performanceMetrics.resolvedVolume}</div>
                                <p className="text-[#555555] text-[0.85rem] font-bold">Successfully Concluded</p>
                            </motion.div>

                            <motion.div variants={itemVariants} className="bg-[#111111] border border-[#333333] rounded-2xl p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[#888888] font-bold text-[0.9rem] uppercase tracking-wider">Efficiency Rate</h3>
                                    <TrendingUp size={20} className="text-white" />
                                </div>
                                <div className="text-[3rem] font-black leading-none mb-2">{performanceMetrics.overallResolutionRate}%</div>
                                <p className="text-[#555555] text-[0.85rem] font-bold">Aggregate Departmental Output</p>
                            </motion.div>
                        </div>

                        {/* Departmental Breakdown */}
                        <motion.h2 variants={itemVariants} className="text-[1.5rem] font-black mb-6 flex items-center gap-2">
                            <ShieldCheck size={24} className="text-[#888888]" /> Departmental Analysis
                        </motion.h2>
                        
                        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(performanceMetrics.departmentStats).length === 0 ? (
                                <div className="col-span-1 md:col-span-2 bg-[#111111] border border-[#333333] rounded-2xl p-10 text-center">
                                    <p className="text-[#888888] font-bold">Insufficient operational data to generate departmental metrics.</p>
                                </div>
                            ) : (
                                Object.entries(performanceMetrics.departmentStats).map(([department, stats]) => {
                                    const rate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
                                    return (
                                        <div key={department} className="bg-[#111111] border border-[#333333] rounded-2xl p-6">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="font-black text-[1.1rem] text-white">{department}</h3>
                                                <span className="px-3 py-1 bg-[#222222] text-white text-[0.75rem] font-black tracking-wider uppercase rounded-full">
                                                    {rate}% Resolution
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center justify-between text-[0.9rem] font-bold text-[#888888] mb-2">
                                                <span>Workload Progress</span>
                                                <span>{stats.resolved} / {stats.total} Concluded</span>
                                            </div>
                                            
                                            <div className="w-full bg-[#222222] rounded-full h-3 overflow-hidden">
                                                <div 
                                                    className="bg-white h-full rounded-full transition-all duration-1000"
                                                    style={{ width: `${rate}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}