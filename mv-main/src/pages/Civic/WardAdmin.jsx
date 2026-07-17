import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, 
    ShieldCheck, 
    Clock, 
    CheckCircle, 
    AlertTriangle, 
    Users, 
    Layers,
    FileText
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function WardAdmin() {
    const navigate = useNavigate();
    
    const [incidents, setIncidents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [statusFilter, setStatusFilter] = useState('Active');

    useEffect(() => {
        const complaintsRef = collection(db, 'civic_complaints');
        const adminQuery = query(complaintsRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(adminQuery, (snapshot) => {
            const records = snapshot.docs.map(document => ({
                id: document.id,
                ...document.data()
            }));
            setIncidents(records);
            setIsLoading(false);
        }, (error) => {
            console.error("Failed to establish real-time administrative stream:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const modifyIncidentStatus = async (incidentId, newStatus) => {
        setProcessingId(incidentId);
        try {
            const incidentRef = doc(db, 'civic_complaints', incidentId);
            await updateDoc(incidentRef, {
                status: newStatus,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error("Status modification failed:", error);
            alert("Authorization failed or network transmission error occurred.");
        } finally {
            setProcessingId(null);
        }
    };

    const determineSLAStatus = (createdAt, status) => {
        if (!createdAt || status === 'Completed' || status === 'Duplicate') return { label: 'Compliant', color: 'text-[#00ff88]' };
        
        const submissionDate = createdAt.toDate();
        const currentDate = new Date();
        const hoursElapsed = (currentDate - submissionDate) / (1000 * 60 * 60);

        if (hoursElapsed > 72) return { label: 'SLA Breached', color: 'text-[#ff4444]' };
        if (hoursElapsed > 48) return { label: 'Approaching Deadline', color: 'text-[#ffaa00]' };
        return { label: 'Compliant', color: 'text-[#00ff88]' };
    };

    const getFilteredIncidents = () => {
        if (statusFilter === 'Active') {
            return incidents.filter(i => ['Submitted', 'Assigned', 'In Progress'].includes(i.status));
        }
        if (statusFilter === 'Completed') {
            return incidents.filter(i => i.status === 'Completed');
        }
        if (statusFilter === 'Duplicate') {
            return incidents.filter(i => i.status === 'Duplicate');
        }
        return incidents;
    };

    const filteredRecords = getFilteredIncidents();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black overflow-x-hidden pt-24 pb-12">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                
                <button 
                    onClick={() => navigate('/civic')}
                    className="flex items-center gap-2 text-[#888888] hover:text-white transition-colors mb-8 outline-none font-bold text-[0.9rem]"
                >
                    <ArrowLeft size={16} /> Return to Operations Portal
                </button>

                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
                >
                    <div>
                        <motion.div variants={itemVariants} className="flex items-center gap-3 mb-4 text-[#888888]">
                            <ShieldCheck size={20} className="text-white" />
                            <span className="text-[0.9rem] font-bold tracking-widest uppercase">Administrative Console</span>
                        </motion.div>
                        <motion.h1 variants={itemVariants} className="text-[2.5rem] md:text-[3.5rem] font-black leading-[1.1] tracking-tighter mb-4">
                            Ward Operations Control
                        </motion.h1>
                        <motion.p variants={itemVariants} className="text-[#aaaaaa] text-[1.1rem] max-w-[700px]">
                            Secure command center for managing infrastructural reports, assigning field personnel, and ensuring service level agreement compliance.
                        </motion.p>
                    </div>

                    <motion.div variants={itemVariants} className="flex bg-[#111111] border border-[#333333] rounded-xl overflow-hidden shrink-0">
                        {['Active', 'Completed', 'Duplicate'].map((filterType) => (
                            <button
                                key={filterType}
                                onClick={() => setStatusFilter(filterType)}
                                className={`px-6 py-4 font-bold text-[0.9rem] transition-colors outline-none border-r border-[#333333] last:border-r-0 ${
                                    statusFilter === filterType ? 'bg-white text-black' : 'text-[#888888] hover:bg-[#222222]'
                                }`}
                            >
                                {filterType}
                            </button>
                        ))}
                    </motion.div>
                </motion.div>

                <div className="bg-[#111111] border border-[#333333] rounded-2xl overflow-hidden min-h-[500px]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#0a0a0a] border-b border-[#333333]">
                                    <th className="p-6 text-[0.8rem] font-bold text-[#888888] uppercase tracking-wider">Tracking ID / Date</th>
                                    <th className="p-6 text-[0.8rem] font-bold text-[#888888] uppercase tracking-wider">Deficiency Details</th>
                                    <th className="p-6 text-[0.8rem] font-bold text-[#888888] uppercase tracking-wider">Priority / SLA</th>
                                    <th className="p-6 text-[0.8rem] font-bold text-[#888888] uppercase tracking-wider">Operational Status</th>
                                    <th className="p-6 text-[0.8rem] font-bold text-[#888888] uppercase tracking-wider text-right">Administrative Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center">
                                            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                            <p className="text-[#888888] font-bold">Synchronizing administrative records...</p>
                                        </td>
                                    </tr>
                                ) : filteredRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center">
                                            <FileText size={32} className="text-[#333333] mx-auto mb-4" />
                                            <p className="text-[#888888] font-bold">No records found matching the current operational filter.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecords.map((incident) => {
                                        const sla = determineSLAStatus(incident.createdAt, incident.status);
                                        const dateString = incident.createdAt ? incident.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown Date';
                                        
                                        return (
                                            <tr key={incident.id} className="border-b border-[#333333] hover:bg-[#1a1a1a] transition-colors">
                                                <td className="p-6 align-top">
                                                    <div className="font-mono text-[0.85rem] text-white mb-1">{incident.id.substring(0, 8).toUpperCase()}</div>
                                                    <div className="text-[0.8rem] text-[#888888] font-bold flex items-center gap-1">
                                                        <Clock size={12} /> {dateString}
                                                    </div>
                                                </td>
                                                <td className="p-6 align-top max-w-[300px]">
                                                    <div className="font-black text-[1rem] text-white mb-1 truncate">{incident.title}</div>
                                                    <div className="text-[0.85rem] text-[#aaaaaa] font-bold mb-2">{incident.category}</div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex items-center gap-1 text-[0.75rem] font-bold text-[#888888]">
                                                            <Users size={12} /> Support: {incident.supportCount || 1}
                                                        </span>
                                                        {incident.evidenceUrl && (
                                                            <span className="flex items-center gap-1 text-[0.75rem] font-bold text-[#00ff88]">
                                                                <Layers size={12} /> Evidence Attached
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-6 align-top">
                                                    <div className={`inline-block px-3 py-1 text-[0.75rem] font-black tracking-wider uppercase rounded-full mb-2 ${
                                                        incident.priority === 'Critical' ? 'bg-[#330000] text-[#ff4444]' : 
                                                        incident.priority === 'High' ? 'bg-[#331a00] text-[#ffaa00]' : 
                                                        'bg-[#002211] text-[#00ff88]'
                                                    }`}>
                                                        {incident.priority}
                                                    </div>
                                                    <div className={`text-[0.8rem] font-bold flex items-center gap-1 ${sla.color}`}>
                                                        <AlertTriangle size={12} /> {sla.label}
                                                    </div>
                                                </td>
                                                <td className="p-6 align-top">
                                                    <span className="text-[0.9rem] font-black text-white">{incident.status}</span>
                                                </td>
                                                <td className="p-6 align-top text-right">
                                                    <div className="flex flex-col gap-2 items-end">
                                                        {incident.status === 'Submitted' && (
                                                            <button 
                                                                onClick={() => modifyIncidentStatus(incident.id, 'Assigned')}
                                                                disabled={processingId === incident.id}
                                                                className="bg-white text-black px-4 py-2 rounded-lg font-bold text-[0.8rem] hover:bg-[#e0e0e0] transition-colors disabled:opacity-50"
                                                            >
                                                                Assign Field Unit
                                                            </button>
                                                        )}
                                                        {incident.status === 'Assigned' && (
                                                            <button 
                                                                onClick={() => modifyIncidentStatus(incident.id, 'In Progress')}
                                                                disabled={processingId === incident.id}
                                                                className="bg-[#222222] text-white border border-[#555555] px-4 py-2 rounded-lg font-bold text-[0.8rem] hover:border-white transition-colors disabled:opacity-50"
                                                            >
                                                                Initiate Operations
                                                            </button>
                                                        )}
                                                        {incident.status === 'In Progress' && (
                                                            <button 
                                                                onClick={() => modifyIncidentStatus(incident.id, 'Completed')}
                                                                disabled={processingId === incident.id}
                                                                className="bg-[#002211] text-[#00ff88] border border-[#00ff88] px-4 py-2 rounded-lg font-bold text-[0.8rem] hover:bg-[#00331a] transition-colors disabled:opacity-50"
                                                            >
                                                                Conclude Operations
                                                            </button>
                                                        )}
                                                        {['Submitted', 'Assigned'].includes(incident.status) && (
                                                            <button 
                                                                onClick={() => modifyIncidentStatus(incident.id, 'Duplicate')}
                                                                disabled={processingId === incident.id}
                                                                className="text-[#888888] hover:text-[#ff4444] px-4 py-2 font-bold text-[0.8rem] transition-colors disabled:opacity-50"
                                                            >
                                                                Merge / Mark Duplicate
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}