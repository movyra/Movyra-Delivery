import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    ShieldCheck, 
    BarChart3, 
    Map, 
    TerminalSquare, 
    ArrowRight,
    Sun,
    Moon,
    Activity,
    Lock,
    Smartphone,
    Users
} from 'lucide-react';
import { useCivicStore } from '../../store/useCivicStore';

export default function CivicHome() {
    const navigate = useNavigate();
    const theme = useCivicStore((state) => state.theme);
    const toggleTheme = useCivicStore((state) => state.toggleTheme);

    // Variables for the standardized footer
    const localCity = "Mumbai";
    const currentT = { careers: "Careers" };

    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    return (
        <div className={`min-h-screen font-sans overflow-x-hidden flex flex-col transition-colors duration-300 ${
            theme === 'light' ? 'bg-[#f5f5f5] text-[#111111] selection:bg-black selection:text-white' : 'bg-[#050505] text-white selection:bg-white selection:text-black'
        }`}>
            <style>
                {`
                @keyframes fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade { animation: fade 0.6s ease-out forwards; }
                .stagger-3 { animation-delay: 0.3s; }
                `}
            </style>

            {/* MASTER HEADER */}
            <header className={`fixed top-0 left-0 right-0 w-full flex items-center justify-between px-6 md:px-12 py-6 z-50 transition-colors backdrop-blur-md ${
                theme === 'light' ? 'bg-[#f5f5f5]/90 border-b border-[#e0e0e0]' : 'bg-[#050505]/90 border-b border-[#111111]'
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
                        className={`px-6 py-2.5 rounded-full transition-colors outline-none border ${
                            theme === 'light' ? 'bg-black text-white border-black hover:bg-[#222222]' : 'bg-white text-black border-white hover:bg-[#e0e0e0]'
                        }`}
                    >
                        Sign Up
                    </button>
                </div>
            </header>

            {/* SECTION 1: HERO */}
            <section className="relative pt-48 pb-20 px-6 md:px-12 max-w-[1400px] mx-auto flex flex-col justify-center w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="z-10">
                        <motion.div variants={fadeUp} className={`inline-flex items-center gap-3 px-4 py-2 rounded-full mb-8 border ${theme === 'light' ? 'bg-white border-[#cccccc]' : 'bg-[#111111] border-[#333333]'}`}>
                            <div className="w-2 h-2 rounded-full bg-[#00aa55] animate-pulse"></div>
                            <span className="text-[0.85rem] font-bold tracking-widest uppercase">Smart City Operations</span>
                        </motion.div>
                        <motion.h1 variants={fadeUp} className="text-[3.5rem] md:text-[4.5rem] font-black leading-[1.1] tracking-tighter mb-6">
                            Manage City Services Fast & Securely.
                        </motion.h1>
                        <motion.p variants={fadeUp} className={`text-[1.1rem] md:text-[1.2rem] max-w-[500px] leading-relaxed mb-10 ${
                            theme === 'light' ? 'text-[#555555]' : 'text-[#aaaaaa]'
                        }`}>
                            A simple, secure platform to report issues, track work progress, and manage daily municipal tasks in real time.
                        </motion.p>
                        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4">
                            <button 
                                onClick={() => navigate('/civic/auth')} 
                                className={`w-full sm:w-auto px-8 py-4 rounded-xl font-black text-[1rem] flex items-center justify-center gap-2 transition-colors outline-none ${
                                    theme === 'light' ? 'bg-black text-white hover:bg-[#222222]' : 'bg-white text-black hover:bg-[#e0e0e0]'
                                }`}
                            >
                                Get Started <ArrowRight size={18} />
                            </button>
                        </motion.div>
                    </motion.div>

                    {/* HERO GRAPHIC: Animated Network SVG */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="hidden lg:flex justify-end relative">
                        <svg viewBox="0 0 400 400" className="w-full h-auto max-w-[500px]" fill="none">
                            <circle cx="200" cy="200" r="180" stroke={theme === 'light' ? '#e0e0e0' : '#1a1a1a'} strokeWidth="2" strokeDasharray="8 8"/>
                            <circle cx="200" cy="200" r="120" stroke={theme === 'light' ? '#cccccc' : '#222222'} strokeWidth="1" />
                            <motion.circle cx="200" cy="200" r="60" fill={theme === 'light' ? '#000000' : '#ffffff'} initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }} />
                            {/* Connectors */}
                            <path d="M200 140 L200 50 M260 200 L350 200 M200 260 L200 350 M140 200 L50 200" stroke={theme === 'light' ? '#000000' : '#ffffff'} strokeWidth="3"/>
                            {/* Nodes */}
                            <circle cx="200" cy="50" r="8" fill={theme === 'light' ? '#000000' : '#ffffff'} />
                            <circle cx="350" cy="200" r="8" fill={theme === 'light' ? '#000000' : '#ffffff'} />
                            <circle cx="200" cy="350" r="8" fill={theme === 'light' ? '#000000' : '#ffffff'} />
                            <circle cx="50" cy="200" r="8" fill={theme === 'light' ? '#000000' : '#ffffff'} />
                        </svg>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 2: CORE VALUES */}
            <section className={`py-24 px-6 md:px-12 border-t ${theme === 'light' ? 'bg-[#ffffff] border-[#e0e0e0]' : 'bg-[#0a0a0a] border-[#111111]'}`}>
                <div className="max-w-[1400px] mx-auto">
                    <div className="mb-16">
                        <h2 className="text-[2.5rem] font-black tracking-tighter mb-4">Why Choose Us?</h2>
                        <p className={`text-[1.1rem] ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>Built for speed, transparency, and simple tracking.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: Map, title: "Location Tracking", desc: "Pinpoint exact locations for faster field response." },
                            { icon: Activity, title: "Live Updates", desc: "Watch the status of work change from pending to complete." },
                            { icon: ShieldCheck, title: "Secure Records", desc: "All data is stored safely with controlled access." }
                        ].map((feature, idx) => (
                            <div key={idx} className={`p-8 rounded-3xl border transition-colors ${theme === 'light' ? 'bg-[#f9f9f9] border-[#e0e0e0] hover:border-black' : 'bg-[#111111] border-[#333333] hover:border-white'}`}>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border ${theme === 'light' ? 'bg-white border-[#cccccc]' : 'bg-[#222222] border-[#444444]'}`}>
                                    <feature.icon size={20} className={theme === 'light' ? 'text-black' : 'text-white'} />
                                </div>
                                <h3 className="text-[1.25rem] font-black mb-2">{feature.title}</h3>
                                <p className={`text-[0.95rem] ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 3: LIVE ANALYTICS PREVIEW */}
            <section className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto w-full">
                <div className={`rounded-3xl p-10 md:p-16 border flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden relative ${
                    theme === 'light' ? 'bg-white border-[#cccccc]' : 'bg-[#111111] border-[#333333]'
                }`}>
                    <div className="relative z-10 lg:max-w-[40%]">
                        <BarChart3 size={32} className={`mb-6 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                        <h2 className="text-[2.5rem] font-black tracking-tighter mb-4">Clear Analytics.</h2>
                        <p className={`text-[1.1rem] leading-relaxed mb-8 ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>
                            View performance dashboards instantly. Track total reports, resolution speed, and active areas without complex menus.
                        </p>
                    </div>

                    {/* Animated Bar Chart Graphic */}
                    <div className="w-full lg:w-[50%] h-[300px] flex items-end gap-4 relative z-10">
                        <div className={`absolute bottom-0 left-0 w-full h-[1px] ${theme === 'light' ? 'bg-[#cccccc]' : 'bg-[#333333]'}`}></div>
                        {[40, 70, 45, 90, 60, 100].map((height, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ height: 0 }}
                                whileInView={{ height: `${height}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: idx * 0.1 }}
                                className={`flex-1 rounded-t-lg ${theme === 'light' ? 'bg-black' : 'bg-white'}`}
                            ></motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 4: CITIZEN WORKFLOW */}
            <section className={`py-24 px-6 md:px-12 border-t ${theme === 'light' ? 'bg-[#f9f9f9] border-[#e0e0e0]' : 'bg-[#0a0a0a] border-[#111111]'}`}>
                <div className="max-w-[1400px] mx-auto text-center">
                    <h2 className="text-[2.5rem] font-black tracking-tighter mb-16">How It Works</h2>
                    
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 relative">
                        {/* Connecting Line (Hidden on Mobile) */}
                        <div className={`hidden md:block absolute top-1/2 left-0 w-full h-[2px] -translate-y-1/2 z-0 ${theme === 'light' ? 'bg-[#cccccc]' : 'bg-[#333333]'}`}></div>

                        {[
                            { num: "1", title: "Report", desc: "Submit details." },
                            { num: "2", title: "Assign", desc: "Routed to team." },
                            { num: "3", title: "Resolve", desc: "Work completed." }
                        ].map((step, idx) => (
                            <div key={idx} className={`relative z-10 w-full md:w-1/3 p-8 rounded-3xl border flex flex-col items-center text-center ${
                                theme === 'light' ? 'bg-white border-[#cccccc]' : 'bg-[#111111] border-[#333333]'
                            }`}>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-[1.2rem] mb-4 ${
                                    theme === 'light' ? 'bg-black text-white' : 'bg-white text-black'
                                }`}>
                                    {step.num}
                                </div>
                                <h3 className="text-[1.25rem] font-black mb-2">{step.title}</h3>
                                <p className={`text-[0.95rem] ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 5: DEVELOPER INTEGRATION */}
            <section className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto w-full">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="lg:max-w-[40%]">
                        <div className="flex items-center gap-2 mb-4">
                            <TerminalSquare size={18} className={theme === 'light' ? 'text-black' : 'text-[#888888]'} />
                            <span className="text-[0.85rem] font-bold tracking-widest uppercase">Developers</span>
                        </div>
                        <h2 className="text-[2.5rem] font-black tracking-tighter mb-4">Connect Systems.</h2>
                        <p className={`text-[1.1rem] leading-relaxed mb-8 ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>
                            Use our simple API to pull active task data into your existing tools. Standard JSON responses make integration fast.
                        </p>
                        <button className={`px-6 py-3 rounded-xl font-bold text-[0.95rem] border transition-colors outline-none ${
                            theme === 'light' ? 'bg-white text-black border-[#cccccc] hover:border-black' : 'bg-[#000000] text-white border-[#555555] hover:border-white'
                        }`}>
                            Read API Docs
                        </button>
                    </div>

                    <div className={`w-full lg:w-[50%] rounded-2xl p-6 font-mono text-[0.85rem] leading-loose border shadow-xl ${
                        theme === 'light' ? 'bg-[#f5f5f5] border-[#cccccc] text-[#333333]' : 'bg-[#0a0a0a] border-[#222222] text-[#aaaaaa]'
                    }`}>
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#333333]/20">
                            <div className="w-3 h-3 rounded-full bg-[#ff4444]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#ffaa00]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#00ff88]"></div>
                        </div>
                        <span className={theme === 'light' ? 'text-[#0055aa]' : 'text-[#44aaff]'}>GET</span> /api/status<br/><br/>
                        {`{`} <br/>
                        &nbsp;&nbsp;<span className={theme === 'light' ? 'text-[#000000]' : 'text-[#ffffff]'}>"active_tasks"</span>: 42,<br/>
                        &nbsp;&nbsp;<span className={theme === 'light' ? 'text-[#000000]' : 'text-[#ffffff]'}>"success_rate"</span>: "94%"<br/>
                        {`}`}
                    </div>
                </div>
            </section>

            {/* SECTION 6: ENTERPRISE SECURITY */}
            <section className={`py-24 px-6 md:px-12 border-t ${theme === 'light' ? 'bg-[#ffffff] border-[#e0e0e0]' : 'bg-[#050505] border-[#111111]'}`}>
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="order-2 lg:order-1 flex justify-center lg:justify-start">
                        {/* Custom Isometric Security Lock Vector */}
                        <svg viewBox="0 0 200 200" className="w-full max-w-[300px] h-auto" fill="none">
                            <motion.path 
                                d="M60 100 V70 C60 40 140 40 140 70 V100" 
                                stroke={theme === 'light' ? '#111111' : '#ffffff'} 
                                strokeWidth="16" strokeLinecap="round"
                                initial={{ y: 20 }} animate={{ y: 0 }} transition={{ repeat: Infinity, duration: 2, repeatType: "reverse", ease: "easeInOut" }}
                            />
                            <rect x="40" y="90" width="120" height="90" rx="16" fill={theme === 'light' ? '#111111' : '#ffffff'} />
                            <circle cx="100" cy="135" r="12" fill={theme === 'light' ? '#ffffff' : '#111111'} />
                            <path d="M96 145 L92 160 H108 L104 145 Z" fill={theme === 'light' ? '#ffffff' : '#111111'} />
                        </svg>
                    </motion.div>
                    <div className="order-1 lg:order-2">
                        <Lock size={32} className={`mb-6 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                        <h2 className="text-[2.5rem] font-black tracking-tighter mb-4">Data Privacy First.</h2>
                        <p className={`text-[1.1rem] leading-relaxed ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>
                            Your reports and personal details are protected by enterprise-grade security. We ensure that sensitive operational data is only accessible to authorized municipal personnel.
                        </p>
                    </div>
                </div>
            </section>

            {/* SECTION 7: MOBILE ACCESSIBILITY */}
            <section className={`py-24 px-6 md:px-12 border-t ${theme === 'light' ? 'bg-[#f9f9f9] border-[#e0e0e0]' : 'bg-[#0a0a0a] border-[#111111]'}`}>
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <Smartphone size={32} className={`mb-6 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                        <h2 className="text-[2.5rem] font-black tracking-tighter mb-4">Access Anywhere.</h2>
                        <p className={`text-[1.1rem] leading-relaxed ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>
                            Report issues on the go. Our platform is fully optimized for smartphones and tablets, ensuring you can manage and track tasks from any field location.
                        </p>
                    </div>
                    <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="flex justify-center lg:justify-end">
                        {/* Custom Animated Smartphone Vector */}
                        <svg viewBox="0 0 200 200" className="w-full max-w-[300px] h-auto" fill="none">
                            <rect x="50" y="20" width="100" height="160" rx="20" fill={theme === 'light' ? '#e0e0e0' : '#222222'} stroke={theme === 'light' ? '#cccccc' : '#333333'} strokeWidth="4" />
                            <rect x="56" y="26" width="88" height="148" rx="14" fill={theme === 'light' ? '#ffffff' : '#050505'} />
                            <motion.rect x="66" y="50" width="56" height="12" rx="4" fill={theme === 'light' ? '#cccccc' : '#333333'} initial={{ opacity: 0.3 }} animate={{ opacity: 1 }} transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }} />
                            <rect x="66" y="70" width="68" height="8" rx="4" fill={theme === 'light' ? '#e0e0e0' : '#222222'} />
                            <rect x="66" y="86" width="48" height="8" rx="4" fill={theme === 'light' ? '#e0e0e0' : '#222222'} />
                            <circle cx="100" cy="155" r="8" stroke={theme === 'light' ? '#cccccc' : '#333333'} strokeWidth="2" />
                        </svg>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 8: COMMUNITY IMPACT */}
            <section className={`py-24 px-6 md:px-12 border-t ${theme === 'light' ? 'bg-[#ffffff] border-[#e0e0e0]' : 'bg-[#050505] border-[#111111]'}`}>
                <div className="max-w-[1400px] mx-auto text-center flex flex-col items-center">
                    <Users size={32} className={`mb-6 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                    <h2 className="text-[2.5rem] font-black tracking-tighter mb-4">Better Cities Together.</h2>
                    <p className={`text-[1.1rem] max-w-[600px] leading-relaxed mb-12 ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>
                        Join thousands of citizens and municipal officials working in harmony. A unified network ensures faster resolutions and improves local infrastructure for everyone.
                    </p>
                    
                    {/* Custom Animated Network Nodes Vector */}
                    <div className="relative w-full max-w-[400px] aspect-video">
                        <svg viewBox="0 0 400 200" className="w-full h-full" fill="none">
                            <path d="M50 100 C150 150 250 50 350 100" stroke={theme === 'light' ? '#cccccc' : '#333333'} strokeWidth="2" strokeDasharray="6 6" />
                            <motion.circle cx="50" cy="100" r="10" fill={theme === 'light' ? '#111111' : '#ffffff'} initial={{ scale: 1 }} animate={{ scale: 1.5, opacity: 0.5 }} transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }} />
                            <motion.circle cx="200" cy="100" r="14" fill={theme === 'light' ? '#111111' : '#ffffff'} initial={{ scale: 1 }} animate={{ scale: 1.3, opacity: 0.8 }} transition={{ repeat: Infinity, duration: 2, repeatType: "reverse", delay: 0.5 }} />
                            <motion.circle cx="350" cy="100" r="10" fill={theme === 'light' ? '#111111' : '#ffffff'} initial={{ scale: 1 }} animate={{ scale: 1.5, opacity: 0.5 }} transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse", delay: 1 }} />
                        </svg>
                    </div>
                </div>
            </section>

            {/* FOOTER ALIGNMENT */}
            <footer className={`w-full max-w-[1400px] mx-auto mt-auto flex flex-col md:flex-row items-center justify-between gap-8 px-8 md:px-16 py-12 border-t opacity-0 animate-fade stagger-3 relative z-10 ${
                theme === 'light' ? 'border-[#e0e0e0] bg-[#ffffff]' : 'border-[#111111] bg-[#050505]'
            }`}>
                
                {/* Custom SVG Social Icons */}
                <div className={`flex items-center gap-8 ${theme === 'light' ? 'text-[#666666]' : 'text-[#555555]'}`}>
                    <a href="https://www.linkedin.com/company/getmovyra/" target="_blank" rel="noopener noreferrer" className={`transition-colors ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    </a>
                    <a href="#youtube" className={`transition-colors ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                    </a>
                    <a href="https://www.instagram.com/getmovyra" target="_blank" rel="noopener noreferrer" className={`transition-colors ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                    </a>
                    <a href="#x" className={`transition-colors ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.006 4.15H5.078z"/></svg>
                    </a>
                </div>
                
                <div className={`flex flex-col md:flex-row items-center gap-6 text-[0.8rem] font-bold ${theme === 'light' ? 'text-[#666666]' : 'text-[#555555]'}`}>
                    <div className="flex items-center gap-6">
                        <Link to="/careers" className={`transition-colors ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>{currentT.careers}</Link>
                        <span className={`w-1 h-1 rounded-full ${theme === 'light' ? 'bg-[#cccccc]' : 'bg-[#333333]'}`}></span>
                        <div className={`flex items-center gap-2 transition-colors cursor-default ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            {localCity}, IN
                        </div>
                    </div>
                    
                    <span className={`hidden md:block w-1 h-1 rounded-full ${theme === 'light' ? 'bg-[#cccccc]' : 'bg-[#333333]'}`}></span>
                    
                    {/* Attribution Link */}
                    <div className={`text-[0.75rem] uppercase tracking-wider ${theme === 'light' ? 'text-[#888888]' : 'text-[#666666]'}`}>
                        Built by <a href="https://rebrand.ly/aatns" target="_blank" rel="noopener noreferrer" className={`transition-colors underline decoration-[#444444] underline-offset-4 ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>AnyAstro</a>
                    </div>
                </div>

            </footer>
        </div>
    );
}