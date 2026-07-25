import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    ShieldCheck, 
    BarChart3, 
    Map, 
    Clock, 
    TerminalSquare, 
    Database, 
    ArrowRight,
    Sun,
    Moon
} from 'lucide-react';
import { useCivicStore } from '../../store/useCivicStore';

export default function CivicHome() {
    const navigate = useNavigate();
    const theme = useCivicStore((state) => state.theme);
    const toggleTheme = useCivicStore((state) => state.toggleTheme);

    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
    };

    return (
        <div className={`min-h-screen font-sans overflow-x-hidden transition-colors duration-300 ${
            theme === 'light' ? 'bg-[#f5f5f5] text-[#111111] selection:bg-black selection:text-white' : 'bg-[#050505] text-white selection:bg-white selection:text-black'
        }`}>
            {/* MASTER HEADER */}
            <header className={`fixed top-0 left-0 right-0 w-full flex items-center justify-between px-6 md:px-12 py-6 z-50 transition-colors backdrop-blur-md ${
                theme === 'light' ? 'bg-[#f5f5f5]/80 border-b border-[#e0e0e0]' : 'bg-[#050505]/80 border-b border-[#111111]'
            }`}>
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
                    <img 
                        src={theme === 'light' ? '/logo-3.png' : '/logo.png'} 
                        alt="Movyra" 
                        className="h-8 w-auto" 
                        onError={(e) => e.target.style.display = 'none'} 
                    />
                    <span className="font-black text-[1.5rem] tracking-tighter ml-[-5px]">
                        ovyra <span className={`${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'} font-medium text-[1.2rem] ml-1`}>Civic</span>
                    </span>
                </div>
                
                <div className="flex items-center gap-6 text-[0.9rem] font-bold">
                    <button 
                        onClick={toggleTheme} 
                        className={`p-2 rounded-full transition-colors outline-none ${
                            theme === 'light' ? 'bg-[#e0e0e0] text-black hover:bg-[#cccccc]' : 'bg-[#222222] text-white hover:bg-[#333333]'
                        }`}
                    >
                        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                    </button>
                    <button 
                        onClick={() => navigate('/civic/auth')} 
                        className={`transition-colors outline-none ${theme === 'light' ? 'text-[#555555] hover:text-black' : 'text-[#888888] hover:text-white'}`}
                    >
                        Sign In
                    </button>
                    <button 
                        onClick={() => navigate('/civic/auth')} 
                        className={`px-5 py-2.5 rounded-full transition-colors outline-none border ${
                            theme === 'light' ? 'bg-black text-white border-black hover:bg-[#222222]' : 'bg-white text-black border-white hover:bg-[#e0e0e0]'
                        }`}
                    >
                        Sign Up
                    </button>
                </div>
            </header>

            {/* HERO SECTION */}
            <section className="relative pt-40 pb-20 px-6 md:px-12 max-w-[1400px] mx-auto min-h-[85vh] flex flex-col justify-center">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="z-10">
                        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
                            <ShieldCheck size={20} className={theme === 'light' ? 'text-black' : 'text-white'} />
                            <span className="text-[0.9rem] font-bold tracking-widest uppercase text-[#888888]">Enterprise Infrastructure Control</span>
                        </motion.div>
                        <motion.h1 variants={fadeUp} className="text-[3.5rem] md:text-[4.5rem] lg:text-[5rem] font-black leading-[1.05] tracking-tighter mb-6">
                            Next-Generation Municipal Operations.
                        </motion.h1>
                        <motion.p variants={fadeUp} className={`text-[1.1rem] md:text-[1.25rem] max-w-[600px] leading-relaxed mb-10 ${
                            theme === 'light' ? 'text-[#555555]' : 'text-[#aaaaaa]'
                        }`}>
                            A secure, unified architecture for documenting civic deficiencies, tracking field personnel resolution metrics, and executing data-driven resource allocation.
                        </motion.p>
                        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4">
                            <button 
                                onClick={() => navigate('/civic/auth')} 
                                className={`w-full sm:w-auto px-8 py-4 rounded-xl font-black text-[1rem] flex items-center justify-center gap-2 transition-colors outline-none ${
                                    theme === 'light' ? 'bg-black text-white hover:bg-[#222222]' : 'bg-white text-black hover:bg-[#e0e0e0]'
                                }`}
                            >
                                Access Control Center <ArrowRight size={18} />
                            </button>
                            <button 
                                onClick={() => navigate('/civic/onboarding')} 
                                className={`w-full sm:w-auto px-8 py-4 rounded-xl font-black text-[1rem] transition-colors outline-none border ${
                                    theme === 'light' ? 'bg-transparent border-[#cccccc] text-black hover:border-black' : 'bg-transparent border-[#333333] text-white hover:border-white'
                                }`}
                            >
                                Platform Overview
                            </button>
                        </motion.div>
                    </motion.div>

                    {/* CUSTOM VECTOR GRAPHIC: Isometric Data Cityscape */}
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="hidden lg:flex justify-end relative">
                        <div className={`w-full aspect-square max-w-[600px] rounded-full absolute -top-20 -right-20 blur-3xl opacity-20 ${theme === 'light' ? 'bg-[#cccccc]' : 'bg-[#333333]'}`}></div>
                        <svg viewBox="0 0 400 400" className="w-full h-auto max-w-[500px] z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Grid Base */}
                            <path d="M50 250 L200 330 L350 250 L200 170 Z" fill={theme === 'light' ? '#e0e0e0' : '#111111'} stroke={theme === 'light' ? '#cccccc' : '#333333'} strokeWidth="2"/>
                            <path d="M50 250 L200 330 L200 350 L50 270 Z" fill={theme === 'light' ? '#cccccc' : '#0a0a0a'} />
                            <path d="M350 250 L200 330 L200 350 L350 270 Z" fill={theme === 'light' ? '#d5d5d5' : '#1a1a1a'} />
                            
                            {/* Block 1 */}
                            <path d="M100 220 L150 245 L200 220 L150 195 Z" fill={theme === 'light' ? '#ffffff' : '#222222'} stroke={theme === 'light' ? '#cccccc' : '#444444'} strokeWidth="1"/>
                            <path d="M100 220 L150 245 L150 150 L100 125 Z" fill={theme === 'light' ? '#f0f0f0' : '#1a1a1a'} />
                            <path d="M200 220 L150 245 L150 150 L200 125 Z" fill={theme === 'light' ? '#e5e5e5' : '#2a2a2a'} />
                            
                            {/* Block 2 (Taller) */}
                            <path d="M220 230 L270 255 L320 230 L270 205 Z" fill={theme === 'light' ? '#ffffff' : '#222222'} stroke={theme === 'light' ? '#cccccc' : '#444444'} strokeWidth="1"/>
                            <path d="M220 230 L270 255 L270 100 L220 75 Z" fill={theme === 'light' ? '#f0f0f0' : '#1a1a1a'} />
                            <path d="M320 230 L270 255 L270 100 L320 75 Z" fill={theme === 'light' ? '#e5e5e5' : '#2a2a2a'} />

                            {/* Data Nodes */}
                            <circle cx="150" cy="150" r="4" fill={theme === 'light' ? '#000000' : '#ffffff'} />
                            <circle cx="270" cy="100" r="4" fill={theme === 'light' ? '#000000' : '#ffffff'} />
                            <circle cx="200" cy="170" r="4" fill={theme === 'light' ? '#000000' : '#ffffff'} />
                            <path d="M150 150 L200 170 L270 100" stroke={theme === 'light' ? '#000000' : '#ffffff'} strokeWidth="2" strokeDasharray="4 4" />
                        </svg>
                    </motion.div>
                </div>
            </section>

            {/* OPERATIONAL FEATURES MATRIX */}
            <section className={`py-24 px-6 md:px-12 border-t ${theme === 'light' ? 'bg-[#ffffff] border-[#e0e0e0]' : 'bg-[#0a0a0a] border-[#111111]'}`}>
                <div className="max-w-[1400px] mx-auto">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="mb-16">
                        <h2 className="text-[2.5rem] md:text-[3rem] font-black tracking-tighter mb-4">Core Capabilities</h2>
                        <p className={`text-[1.1rem] max-w-[600px] ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>Engineered for municipal accountability, field operation velocity, and absolute administrative visibility.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: Map, title: "Geographic Data Routing", desc: "Automated aggregation of infrastructure deficiencies mapped directly to specific municipal wards and operational zones." },
                            { icon: Clock, title: "Service Level Agreements", desc: "Strict tracking protocols that flag overdue tasks, monitor personnel resolution times, and enforce accountability." },
                            { icon: BarChart3, title: "Transparency Analytics", desc: "Live dashboards rendering resolution efficiency, public reporting volumes, and historical operational metrics." },
                            { icon: Database, title: "Immutable Audit Trails", desc: "Every administrative action, status modification, and personnel assignment is recorded into a secure historical ledger." },
                            { icon: ShieldCheck, title: "Secure Authentication", desc: "Isolated administrative access controls ensuring only verified field units and ward officers manage sensitive operational data." },
                            { icon: TerminalSquare, title: "Redundant Offline Support", desc: "Field personnel and citizens can draft reports offline, synchronizing automatically upon network restoration." }
                        ].map((feature, idx) => (
                            <motion.div 
                                key={idx} 
                                initial="hidden" 
                                whileInView="visible" 
                                viewport={{ once: true, margin: "-50px" }} 
                                variants={fadeUp} 
                                className={`p-8 rounded-3xl border transition-colors ${
                                    theme === 'light' ? 'bg-[#f9f9f9] border-[#e0e0e0] hover:border-[#cccccc]' : 'bg-[#111111] border-[#333333] hover:border-[#555555]'
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border ${
                                    theme === 'light' ? 'bg-white border-[#cccccc]' : 'bg-[#222222] border-[#444444]'
                                }`}>
                                    <feature.icon size={20} className={theme === 'light' ? 'text-black' : 'text-white'} />
                                </div>
                                <h3 className="text-[1.25rem] font-black mb-3">{feature.title}</h3>
                                <p className={`text-[0.95rem] leading-relaxed ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* DEVELOPER & INTEGRATION SECTION */}
            <section className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto">
                <div className={`rounded-3xl p-10 md:p-16 border flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden relative ${
                    theme === 'light' ? 'bg-[#f0f0f0] border-[#cccccc]' : 'bg-[#111111] border-[#333333]'
                }`}>
                    <div className="relative z-10 lg:max-w-[50%]">
                        <div className="flex items-center gap-2 mb-4">
                            <TerminalSquare size={18} className={theme === 'light' ? 'text-black' : 'text-[#888888]'} />
                            <span className="text-[0.85rem] font-bold tracking-widest uppercase">Developer Platform</span>
                        </div>
                        <h2 className="text-[2.5rem] font-black tracking-tighter mb-4">System Integration API</h2>
                        <p className={`text-[1.05rem] leading-relaxed mb-8 ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>
                            Connect municipal legacy systems with the Movyra Civic architecture. Access standardized JSON endpoints for operational telemetry, issue extraction, and automated cross-platform state synchronization.
                        </p>
                        <button 
                            className={`px-6 py-3 rounded-xl font-bold text-[0.95rem] border transition-colors outline-none ${
                                theme === 'light' ? 'bg-white text-black border-[#cccccc] hover:border-black' : 'bg-[#000000] text-white border-[#555555] hover:border-white'
                            }`}
                        >
                            View API Documentation
                        </button>
                    </div>

                    {/* API CODE SNIPPET VECTOR */}
                    <div className={`w-full lg:w-auto flex-1 rounded-2xl p-6 font-mono text-[0.8rem] md:text-[0.9rem] leading-loose border relative z-10 shadow-2xl ${
                        theme === 'light' ? 'bg-white border-[#cccccc] text-[#333333]' : 'bg-[#000000] border-[#333333] text-[#aaaaaa]'
                    }`}>
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-dashed border-current opacity-30">
                            <div className="w-3 h-3 rounded-full bg-[#ff4444]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#ffaa00]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#00ff88]"></div>
                        </div>
                        <span className={theme === 'light' ? 'text-[#0055aa]' : 'text-[#44aaff]'}>GET</span> /v1/civic/infrastructure/status<br/>
                        <span className={theme === 'light' ? 'text-[#aa0055]' : 'text-[#ff44aa]'}>Authorization:</span> Bearer [API_KEY]<br/>
                        <br/>
                        {`{`} <br/>
                        &nbsp;&nbsp;<span className={theme === 'light' ? 'text-[#000000]' : 'text-[#ffffff]'}>"status"</span>: 200,<br/>
                        &nbsp;&nbsp;<span className={theme === 'light' ? 'text-[#000000]' : 'text-[#ffffff]'}>"ward_id"</span>: "WD-14A",<br/>
                        &nbsp;&nbsp;<span className={theme === 'light' ? 'text-[#000000]' : 'text-[#ffffff]'}>"active_incidents"</span>: 42,<br/>
                        &nbsp;&nbsp;<span className={theme === 'light' ? 'text-[#000000]' : 'text-[#ffffff]'}>"sla_compliance"</span>: "94.2%",<br/>
                        &nbsp;&nbsp;<span className={theme === 'light' ? 'text-[#000000]' : 'text-[#ffffff]'}>"last_sync"</span>: "2026-07-25T12:35:17Z"<br/>
                        {`}`}
                    </div>
                </div>
            </section>

            {/* FOOTER CTA */}
            <footer className={`py-12 px-6 border-t text-center ${theme === 'light' ? 'bg-[#ffffff] border-[#e0e0e0]' : 'bg-[#050505] border-[#111111]'}`}>
                <h2 className="text-[2rem] font-black tracking-tighter mb-4">Ready to modernize operations?</h2>
                <div className="flex items-center justify-center gap-4 mt-8">
                    <button 
                        onClick={() => navigate('/civic/auth')} 
                        className={`px-8 py-4 rounded-xl font-black text-[1rem] transition-colors outline-none ${
                            theme === 'light' ? 'bg-black text-white hover:bg-[#222222]' : 'bg-white text-black hover:bg-[#e0e0e0]'
                        }`}
                    >
                        Sign Up Now
                    </button>
                </div>
                <p className={`mt-12 text-[0.8rem] font-bold tracking-wider uppercase ${theme === 'light' ? 'text-[#888888]' : 'text-[#555555]'}`}>
                    © {new Date().getFullYear()} Movyra Civic. Secure Enterprise Infrastructure.
                </p>
            </footer>
        </div>
    );
}