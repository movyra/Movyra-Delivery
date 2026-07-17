import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Map, 
    ArrowLeft, 
    Layers, 
    Filter,
    AlertCircle,
    Activity
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function CivicHeatmap() {
    const navigate = useNavigate();
    
    const [activeIncidents, setActiveIncidents] = useState([]);
    const [filteredIncidents, setFilteredIncidents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Real-time data aggregation
    useEffect(() => {
        const fetchGeographicData = async () => {
            setIsLoading(true);
            try {
                const complaintsRef = collection(db, 'civic_complaints');
                // Retrieve only currently active operations to prevent historical data skew
                const activeQuery = query(
                    complaintsRef, 
                    where('status', 'in', ['Submitted', 'Assigned', 'In Progress'])
                );
                
                const snapshot = await getDocs(activeQuery);
                const records = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })).filter(record => record.location && record.location.latitude && record.location.longitude);
                
                setActiveIncidents(records);
                setFilteredIncidents(records);
            } catch (error) {
                console.error("Geographic data retrieval failed:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGeographicData();
    }, []);

    // Departmental filtering logic
    useEffect(() => {
        if (selectedCategory === 'All') {
            setFilteredIncidents(activeIncidents);
        } else {
            const filtered = activeIncidents.filter(incident => incident.category === selectedCategory);
            setFilteredIncidents(filtered);
        }
    }, [selectedCategory, activeIncidents]);

    const operationalCategories = [
        'All',
        'Road Maintenance',
        'Sanitation Services',
        'Water Supply',
        'Electrical Grid',
        'Public Safety'
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black overflow-hidden flex flex-col pt-24">
            
            {/* Header Area */}
            <div className="shrink-0 px-6 md:px-12 mb-6">
                <button 
                    onClick={() => navigate('/civic')}
                    className="flex items-center gap-2 text-[#888888] hover:text-white transition-colors mb-6 outline-none font-bold text-[0.9rem]"
                >
                    <ArrowLeft size={16} /> Return to Operations Portal
                </button>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-[2.5rem] font-black leading-[1.1] tracking-tighter mb-2">
                            Geographic Distribution
                        </h1>
                        <p className="text-[#aaaaaa] text-[1rem] max-w-[600px]">
                            Identify high-density infrastructural deficiency zones to optimize municipal resource allocation and deployment routes.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-[#111111] border border-[#333333] px-6 py-4 rounded-xl">
                        <div className="flex flex-col">
                            <span className="text-[0.8rem] font-bold text-[#888888] uppercase tracking-wider">Active Plots</span>
                            <span className="text-[1.5rem] font-black text-white leading-none">{filteredIncidents.length}</span>
                        </div>
                        <div className="w-[1px] h-10 bg-[#333333] mx-2"></div>
                        <Activity size={24} className="text-[#555555]" />
                    </div>
                </div>
            </div>

            {/* Main Visualizer Area */}
            <div className="flex-1 flex flex-col md:flex-row border-t border-[#333333] relative">
                
                {/* Control Panel Sidebar */}
                <div className="w-full md:w-[350px] shrink-0 bg-[#0a0a0a] border-r border-[#333333] flex flex-col z-10">
                    <div className="p-6 border-b border-[#333333]">
                        <h3 className="text-[1.1rem] font-black flex items-center gap-2 mb-1">
                            <Filter size={18} /> Departmental Filters
                        </h3>
                        <p className="text-[0.85rem] text-[#888888]">Isolate data points by operational division.</p>
                    </div>
                    
                    <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-2">
                        {operationalCategories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`w-full text-left px-5 py-4 rounded-xl font-bold text-[0.95rem] transition-colors outline-none flex items-center justify-between ${
                                    selectedCategory === category 
                                        ? 'bg-white text-black' 
                                        : 'bg-[#111111] border border-[#333333] text-[#aaaaaa] hover:border-[#555555]'
                                }`}
                            >
                                {category}
                                {selectedCategory === category && <Layers size={16} />}
                            </button>
                        ))}
                    </div>

                    <div className="p-6 border-t border-[#333333] bg-[#050505]">
                        <h4 className="text-[0.8rem] font-bold text-[#888888] uppercase tracking-wider mb-3">Density Legend</h4>
                        <div className="flex items-center gap-3 text-[0.85rem] font-bold">
                            <div className="w-4 h-4 rounded-full bg-[#ff4444] opacity-30 border border-[#ff4444]"></div>
                            <span>Isolated Incident</span>
                        </div>
                        <div className="flex items-center gap-3 text-[0.85rem] font-bold mt-2">
                            <div className="w-4 h-4 rounded-full bg-[#ff4444] opacity-90 border border-[#ff4444]"></div>
                            <span>High-Density Cluster</span>
                        </div>
                    </div>
                </div>

                {/* Map Interface */}
                <div className="flex-1 relative bg-[#111111] min-h-[500px]">
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] z-20">
                            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                            <span className="text-[0.9rem] font-bold text-[#888888]">Rendering geographic data points...</span>
                        </div>
                    ) : (
                        <MapContainer 
                            center={[19.0760, 72.8777]} // Default operational zone
                            zoom={12} 
                            style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
                            zoomControl={true}
                        >
                            {/* Dark mode cartographic layer for high contrast visualizer */}
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            />
                            
                            {filteredIncidents.map((incident) => (
                                <CircleMarker
                                    key={incident.id}
                                    center={[incident.location.latitude, incident.location.longitude]}
                                    radius={20}
                                    pathOptions={{
                                        color: '#ff4444',
                                        fillColor: '#ff4444',
                                        fillOpacity: 0.3, // Overlapping low opacity generates the heat effect
                                        stroke: false
                                    }}
                                >
                                    <Popup className="civic-custom-popup">
                                        <div className="p-1">
                                            <div className="text-[0.7rem] font-bold text-[#888888] uppercase tracking-wider mb-1">
                                                {incident.category}
                                            </div>
                                            <div className="font-black text-[1rem] text-black leading-tight mb-2">
                                                {incident.title}
                                            </div>
                                            <div className="text-[0.8rem] font-bold text-[#555555] flex items-center gap-1">
                                                <AlertCircle size={12} /> Status: {incident.status}
                                            </div>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            ))}
                        </MapContainer>
                    )}
                </div>

            </div>
            
            {/* Custom CSS overrides for Leaflet Popups to match dark theme requirements */}
            <style>
                {`
                    .leaflet-popup-content-wrapper {
                        background-color: #ffffff;
                        color: #000000;
                        border-radius: 12px;
                        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
                    }
                    .leaflet-popup-tip {
                        background-color: #ffffff;
                    }
                    .leaflet-container {
                        font-family: inherit;
                    }
                `}
            </style>
        </div>
    );
}