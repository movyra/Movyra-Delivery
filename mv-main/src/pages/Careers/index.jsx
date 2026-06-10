import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; 
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ============================================================================
 * COMPONENT: CORPORATE RECRUITMENT PORTAL (mv-main)
 * Purpose: Secure intake gateway for prospective team members.
 * Behavior: Multi-stage evaluation process featuring dynamic, role-specific 
 * technical and operational questionnaires. Submits encrypted payloads to
 * the isolated career_applications database node.
 * Structural Constraint: Strict zero emoji vector configuration. Black and 
 * white minimalist design architecture.
 * ============================================================================
 */

export default function Careers() {
  const [lang, setLang] = useState('en');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langDropdownRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState('IDLE'); // IDLE, SUCCESS, ERROR

  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', city: '', state: '',
    linkedin: '', github: '', portfolio: '',
    roleCategory: '', specificRole: '', employmentType: 'Full-Time', expectedSalary: '',
    // Startup Mindset Qs
    startupReason: '', budgetStrategy: '',
    // Role Specific Qs
    techArch: '', nearestPartner: '', aiPrompt: '', aiHallucination: '', 
    marketingAcquisition: '', opsPeakHours: '', opsFraud: ''
  });

  useEffect(() => {
    const sysLang = navigator.language.slice(0, 2);
    const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
    if (supported.includes(sysLang)) setLang(sysLang);

    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languageOptions = [
    { code: 'en', label: 'English' }, { code: 'hi', label: 'हिन्दी' }, { code: 'hinglish', label: 'Hinglish' },
    { code: 'mr', label: 'मराठी' }, { code: 'gu', label: 'ગુજરાતી' }, { code: 'te', label: 'తెలుగు' },
    { code: 'ta', label: 'தமிழ்' }, { code: 'pa', label: 'ਪੰਜਾਬੀ' }, { code: 'bho', label: 'भोजपुरी' },
    { code: 'ar', label: 'العربية' }, { code: 'es', label: 'Español' }, { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' }
  ];

  const t = {
    en: { title: "Build the Future of Logistics", sub: "Join the core grid architecture team.", next: "Continue", submit: "Submit Application", back: "Previous Step" },
    hi: { title: "लॉजिस्टिक्स का भविष्य बनाएं", sub: "कोर ग्रिड आर्किटेक्चर टीम में शामिल हों।", next: "आगे बढ़ें", submit: "आवेदन जमा करें", back: "पिछला कदम" },
    hinglish: { title: "Logistics ka Future Build Karein", sub: "Core grid architecture team join karein.", next: "Continue", submit: "Submit Application", back: "Back" },
    mr: { title: "लॉजिस्टिक्सचे भविष्य घडवा", sub: "कोर टीममध्ये सामील व्हा.", next: "पुढे जा", submit: "अर्ज सबमिट करा", back: "मागे" },
    gu: { title: "લોજિસ્ટિક્સનું ભવિષ્ય બનાવો", sub: "કોર ટીમમાં જોડાઓ.", next: "આગળ", submit: "સબમિટ કરો", back: "પાછળ" },
    te: { title: "లాజిస్టిక్స్ భవిష్యత్తును నిర్మించండి", sub: "కోర్ టీమ్‌లో చేరండి.", next: "కొనసాగించు", submit: "సమర్పించండి", back: "వెనుకకు" },
    ta: { title: "லாஜிஸ்டிக்ஸின் எதிர்காலத்தை உருவாக்குங்கள்", sub: "முக்கிய குழுவில் சேரவும்.", next: "தொடரவும்", submit: "சமர்ப்பிக்கவும்", back: "முந்தைய" },
    pa: { title: "ਲੌਜਿਸਟਿਕਸ ਦਾ ਭਵਿੱਖ ਬਣਾਓ", sub: "ਕੋਰ ਟੀਮ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ।", next: "ਜਾਰੀ ਰੱਖੋ", submit: "ਜਮ੍ਹਾਂ ਕਰੋ", back: "ਪਿੱਛੇ" },
    bho: { title: "लॉजिस्टिक्स के भविष्य बनाईं", sub: "कोर टीम में शामिल होईं।", next: "आगे बढ़ीं", submit: "जमा करीं", back: "पाछे" },
    ar: { title: "بناء مستقبل الخدمات اللوجستية", sub: "انضم إلى الفريق الأساسي.", next: "متابعة", submit: "إرسال", back: "السابق" },
    es: { title: "Construye el futuro de la logística", sub: "Únete al equipo principal.", next: "Continuar", submit: "Enviar aplicación", back: "Anterior" },
    fr: { title: "Construire l'avenir de la logistique", sub: "Rejoignez l'équipe principale.", next: "Continuer", submit: "Soumettre", back: "Précédent" },
    de: { title: "Gestalten Sie die Zukunft der Logistik", sub: "Werden Sie Teil des Kernteams.", next: "Weiter", submit: "Einreichen", back: "Zurück" }
  };

  const currentT = t[lang] || t['en'];

  const handleNext = (e) => {
    e.preventDefault();
    setCurrentStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'career_applications'), {
        ...formData,
        status: 'Pending Review',
        timestamp: serverTimestamp()
      });
      setSubmissionStatus('SUCCESS');
    } catch (error) {
      console.error("Submission Failure:", error);
      setSubmissionStatus('ERROR');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#000000] text-white font-sans selection:bg-white selection:text-black flex flex-col items-center">
      
      {/* HEADER */}
      <header className="w-full max-w-[1000px] flex items-center justify-between px-6 py-8 border-b border-[#1c1c1c]">
        <div className="flex items-center gap-2">
        <img src="/logo.png" alt="Movyra" className="h-8 w-auto" onError={(e) => e.target.style.display = 'none'} />
        <span className="font-black text-[1.5rem] tracking-tighter ml-[-5px]">ovyra Careers</span>
        </div>
        
        {/* LANGUAGE SELECTOR */}
        <div className="relative" ref={langDropdownRef}>
          <button 
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="flex items-center gap-2 text-[#888888] hover:text-white transition-colors outline-none text-[0.85rem] font-bold"
          >
            {languageOptions.find(opt => opt.code === lang)?.label || 'Language'}
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${isLangMenuOpen ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          <AnimatePresence>
            {isLangMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                className="absolute right-0 mt-4 w-48 bg-[#0a0a0a] border border-[#222222] rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50 max-h-[60vh] overflow-y-auto"
              >
                {languageOptions.map((option) => (
                  <button 
                    key={option.code}
                    onClick={() => { setLang(option.code); setIsLangMenuOpen(false); }}
                    className={`px-4 py-3 text-left hover:bg-[#111111] transition-colors ${lang === option.code ? 'text-white font-black' : 'text-[#888888] font-bold'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="w-full max-w-[800px] px-6 py-12 flex-1">
        
        {submissionStatus === 'SUCCESS' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center text-center py-20">
            <div className="w-20 h-20 border-2 border-white rounded-full flex items-center justify-center mb-6">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h1 className="text-[2.5rem] font-black tracking-tight mb-4">Application Received</h1>
            <p className="text-[#888888] text-[1.1rem] max-w-[400px]">Your professional profile has been securely logged. Our assessment systems will process your data shortly.</p>
          </motion.div>
        ) : (
          <>
            <div className="mb-12">
              <h1 className="text-[2.5rem] md:text-[3.5rem] font-black tracking-tighter leading-[1.1] mb-4">{currentT.title}</h1>
              <p className="text-[#888888] text-[1.1rem] max-w-[600px]">{currentT.sub}</p>
            </div>

            {/* PROGRESS INDICATOR */}
            <div className="flex items-center justify-between mb-12">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex-1 flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[0.85rem] transition-colors ${currentStep >= stepNumber ? 'bg-white text-black' : 'bg-[#111111] text-[#666666] border border-[#333333]'}`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 4 && (
                    <div className={`h-[2px] flex-1 mx-2 rounded-full transition-colors ${currentStep > stepNumber ? 'bg-white' : 'bg-[#222222]'}`}></div>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={currentStep === 4 ? handleFinalSubmit : handleNext} className="bg-[#050505] border border-[#1c1c1c] p-8 md:p-12 rounded-[2rem] shadow-2xl">
              
              {/* STEP 1: BASIC INFORMATION */}
              {currentStep === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="text-[1.5rem] font-black mb-8 border-b border-[#1c1c1c] pb-4">Professional Profile</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#888888] mb-2">Legal Full Name</label>
                      <input required type="text" value={formData.fullName} onChange={(e)=>setFormData({...formData, fullName: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#888888] mb-2">Contact Number</label>
                      <input required type="tel" value={formData.phone} onChange={(e)=>setFormData({...formData, phone: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors" />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#888888] mb-2">Email Address</label>
                    <input required type="email" value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#888888] mb-2">LinkedIn URL</label>
                      <input required type="url" value={formData.linkedin} onChange={(e)=>setFormData({...formData, linkedin: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors" placeholder="https://linkedin.com/in/..." />
                    </div>
                    <div>
                      <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#888888] mb-2">GitHub / Portfolio URL</label>
                      <input type="url" value={formData.github} onChange={(e)=>setFormData({...formData, github: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors" placeholder="Optional" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: ROLE SELECTION */}
              {currentStep === 2 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="text-[1.5rem] font-black mb-8 border-b border-[#1c1c1c] pb-4">Position Allocation</h2>
                  
                  <div className="mb-6">
                    <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#888888] mb-2">Target Department</label>
                    <div className="relative">
                      <select required value={formData.roleCategory} onChange={(e)=>setFormData({...formData, roleCategory: e.target.value, specificRole: ''})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors appearance-none cursor-pointer">
                        <option value="" disabled>Select Department</option>
                        <option value="Engineering & Tech">Engineering & Architecture</option>
                        <option value="AI & Data">Artificial Intelligence & Prompt Engineering</option>
                        <option value="Operations & Logistics">Operations & Fleet Logistics</option>
                        <option value="Marketing & Sales">Growth, Marketing & Business Development</option>
                      </select>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                  </div>

                  {formData.roleCategory && (
                    <div className="mb-6">
                      <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#888888] mb-2">Specific Role</label>
                      <div className="relative">
                        <select required value={formData.specificRole} onChange={(e)=>setFormData({...formData, specificRole: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors appearance-none cursor-pointer">
                          <option value="" disabled>Select Role</option>
                          {formData.roleCategory === 'Engineering & Tech' && (
                            <>
                              <option value="Flutter Developer">Flutter Mobile Architect</option>
                              <option value="Backend Developer">Backend Systems Engineer</option>
                              <option value="Full Stack Developer">Full Stack Engineer</option>
                            </>
                          )}
                          {formData.roleCategory === 'AI & Data' && (
                            <>
                              <option value="AI Engineer">Artificial Intelligence Engineer</option>
                              <option value="Prompt Engineer">LLM Prompt Architect</option>
                            </>
                          )}
                          {formData.roleCategory === 'Operations & Logistics' && (
                            <>
                              <option value="Logistics Manager">Logistics Flow Controller</option>
                              <option value="Vendor Onboarding">Vendor Partnership Executive</option>
                              <option value="Customer Success">Customer Success Analyst</option>
                            </>
                          )}
                          {formData.roleCategory === 'Marketing & Sales' && (
                            <>
                              <option value="Growth Marketer">Performance Growth Strategist</option>
                              <option value="B2B Sales">B2B Sales & Acquisition</option>
                              <option value="Content Strategist">Digital Content Architect</option>
                            </>
                          )}
                        </select>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#888888] mb-2">Engagement Type</label>
                      <div className="relative">
                        <select required value={formData.employmentType} onChange={(e)=>setFormData({...formData, employmentType: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors appearance-none cursor-pointer">
                          <option value="Full-Time">Full-Time Commitment</option>
                          <option value="Internship (Performance Based)">Internship (Performance Evaluated)</option>
                          <option value="Contract / Freelance">Contract / Project Basis</option>
                        </select>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#888888] mb-2">Expected Compensation (INR)</label>
                      <input required type="text" value={formData.expectedSalary} onChange={(e)=>setFormData({...formData, expectedSalary: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors" placeholder="e.g. 50,000/month or Negotiable" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: STARTUP MINDSET EVALUATION */}
              {currentStep === 3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="text-[1.5rem] font-black mb-8 border-b border-[#1c1c1c] pb-4">Startup Philosophy & Execution</h2>
                  
                  <div className="bg-[#111111] p-6 rounded-2xl border border-[#222222] mb-8">
                    <p className="text-[#aaaaaa] text-[0.85rem] uppercase tracking-widest font-bold mb-2">Evaluation Note</p>
                    <p className="text-white text-[0.95rem] leading-relaxed">Movyra operates in an intense, zero-to-one startup environment. We prioritize extreme ownership, rapid execution, and problem-solving velocity over standard credentials.</p>
                  </div>

                  <div className="mb-8">
                    <label className="block text-[0.95rem] font-bold text-white mb-3 leading-snug">If you were acting as the founder and had only ₹10,000 for marketing, what exactly would you do in the next 30 days to acquire 100 active users in a new city?</label>
                    <textarea required rows="5" value={formData.budgetStrategy} onChange={(e)=>setFormData({...formData, budgetStrategy: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors resize-none text-[0.9rem] leading-relaxed" placeholder="Detail your exact execution strategy, channels, and operational methodology..."></textarea>
                  </div>

                  <div className="mb-6">
                    <label className="block text-[0.95rem] font-bold text-white mb-3 leading-snug">Why are you actively seeking an early-stage startup environment where infrastructure is minimal and responsibilities are constantly shifting?</label>
                    <textarea required rows="4" value={formData.startupReason} onChange={(e)=>setFormData({...formData, startupReason: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors resize-none text-[0.9rem] leading-relaxed" placeholder="Explain your professional motivations..."></textarea>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: ROLE SPECIFIC EVALUATION */}
              {currentStep === 4 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <h2 className="text-[1.5rem] font-black mb-8 border-b border-[#1c1c1c] pb-4">Technical Assessment: {formData.roleCategory}</h2>
                  
                  {formData.roleCategory === 'Engineering & Tech' && (
                    <>
                      <div className="mb-8">
                        <label className="block text-[0.95rem] font-bold text-white mb-3 leading-snug">How would you architect a real-time logistics system (similar to Swiggy/Uber) to identify and assign the absolute nearest delivery partner to a vendor while handling 10,000 concurrent orders?</label>
                        <textarea required rows="5" value={formData.nearestPartner} onChange={(e)=>setFormData({...formData, nearestPartner: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors resize-none text-[0.9rem] leading-relaxed"></textarea>
                      </div>
                      <div className="mb-6">
                        <label className="block text-[0.95rem] font-bold text-white mb-3 leading-snug">Describe your preferred backend schema and real-time database architecture for live GPS coordinate tracking.</label>
                        <textarea required rows="4" value={formData.techArch} onChange={(e)=>setFormData({...formData, techArch: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors resize-none text-[0.9rem] leading-relaxed"></textarea>
                      </div>
                    </>
                  )}

                  {formData.roleCategory === 'AI & Data' && (
                    <>
                      <div className="mb-8">
                        <label className="block text-[0.95rem] font-bold text-white mb-3 leading-snug">Write an optimized, production-grade system prompt designed to convert a standard LLM into a highly effective, empathetic Customer Support agent for a logistics platform facing severe delivery delays.</label>
                        <textarea required rows="5" value={formData.aiPrompt} onChange={(e)=>setFormData({...formData, aiPrompt: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors resize-none text-[0.9rem] leading-relaxed"></textarea>
                      </div>
                      <div className="mb-6">
                        <label className="block text-[0.95rem] font-bold text-white mb-3 leading-snug">Explain how you would architect a RAG (Retrieval-Augmented Generation) pipeline while strictly mitigating model hallucination.</label>
                        <textarea required rows="4" value={formData.aiHallucination} onChange={(e)=>setFormData({...formData, aiHallucination: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors resize-none text-[0.9rem] leading-relaxed"></textarea>
                      </div>
                    </>
                  )}

                  {formData.roleCategory === 'Marketing & Sales' && (
                    <div className="mb-8">
                      <label className="block text-[0.95rem] font-bold text-white mb-3 leading-snug">Draft a specific, actionable B2B cold acquisition strategy to convince 50 local grocery store owners to bypass existing aggregators and route their inventory exclusively through Movyra.</label>
                      <textarea required rows="6" value={formData.marketingAcquisition} onChange={(e)=>setFormData({...formData, marketingAcquisition: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors resize-none text-[0.9rem] leading-relaxed"></textarea>
                    </div>
                  )}

                  {formData.roleCategory === 'Operations & Logistics' && (
                    <>
                      <div className="mb-8">
                        <label className="block text-[0.95rem] font-bold text-white mb-3 leading-snug">During a severe thunderstorm, active orders spike by 300% while online delivery partners drop by 40%. Outline your exact operational protocol to stabilize the grid and manage customer expectations.</label>
                        <textarea required rows="5" value={formData.opsPeakHours} onChange={(e)=>setFormData({...formData, opsPeakHours: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors resize-none text-[0.9rem] leading-relaxed"></textarea>
                      </div>
                      <div className="mb-6">
                        <label className="block text-[0.95rem] font-bold text-white mb-3 leading-snug">How would you systematically identify, investigate, and penalize delivery partners utilizing GPS spoofing applications to artificially inflate earning metrics?</label>
                        <textarea required rows="4" value={formData.opsFraud} onChange={(e)=>setFormData({...formData, opsFraud: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors resize-none text-[0.9rem] leading-relaxed"></textarea>
                      </div>
                    </>
                  )}
                  
                  {formData.roleCategory === '' && (
                    <div className="w-full p-8 text-center text-[#888888] border border-[#333333] border-dashed rounded-xl">
                      Please return to Step 2 and designate a specific Role Category to generate the relevant technical assessment block.
                    </div>
                  )}
                </motion.div>
              )}

              {/* FORM NAVIGATION CONTROLS */}
              <div className="mt-12 flex gap-4 pt-8 border-t border-[#1c1c1c]">
                {currentStep > 1 && (
                  <button type="button" onClick={handleBack} disabled={isSubmitting} className="px-8 py-4 bg-transparent border border-[#333333] text-white font-bold rounded-xl hover:border-white transition-colors disabled:opacity-50">
                    {currentT.back}
                  </button>
                )}
                
                <button type="submit" disabled={isSubmitting || (currentStep === 4 && formData.roleCategory === '')} className="flex-1 bg-white text-black font-black text-[1.1rem] py-4 rounded-xl hover:bg-[#e0e0e0] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Transmitting Data...
                    </>
                  ) : currentStep === 4 ? (
                    currentT.submit
                  ) : (
                    currentT.next
                  )}
                </button>
              </div>

            </form>
          </>
        )}
      </main>

    </div>
  );
}