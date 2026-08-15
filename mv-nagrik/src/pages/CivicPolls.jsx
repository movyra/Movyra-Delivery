import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, BarChart, CheckCircle, Circle } from 'lucide-react';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

export default function CivicPolls() {
    const navigate = useNavigate();
    const [lang, setLang] = useState('en');
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);

    // Local State to track if user voted in this session
    const [votedPolls, setVotedPolls] = useState(new Set());

    // Language Synchronization
    useEffect(() => {
        const savedLang = localStorage.getItem('nagrik_lang') || navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'kn', 'ml', 'bn', 'pa', 'or', 'as', 'ur', 'bho'];
        if (supported.includes(savedLang)) setLang(savedLang);
    }, []);

    // Real-Time Database Connection
    useEffect(() => {
        const q = query(collection(db, 'civic_polls'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPolls(fetchedData);
            setLoading(false);
        }, (error) => {
            console.error("Database sync failed:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // 15-Language Translation Dictionary
    const t = {
        en: { title: "Community Polls", create: "Create Poll", quest: "Poll Question", opt: "Option", add_opt: "Add Option", submit: "Publish Poll", total: "Total Votes", fetching: "Loading polls...", vote: "Vote" },
        hi: { title: "सामुदायिक मतदान", create: "मतदान बनाएं", quest: "मतदान का प्रश्न", opt: "विकल्प", add_opt: "विकल्प जोड़ें", submit: "प्रकाशित करें", total: "कुल वोट", fetching: "मतदान लोड हो रहे हैं...", vote: "वोट दें" },
        hinglish: { title: "Community Polls", create: "Poll Banayein", quest: "Poll Question", opt: "Option", add_opt: "Option Jodein", submit: "Publish Karein", total: "Total Votes", fetching: "Load ho raha hai...", vote: "Vote Karein" },
        mr: { title: "समुदाय मतदान", create: "मतदान तयार करा", quest: "मतदानाचा प्रश्न", opt: "पर्याय", add_opt: "पर्याय जोडा", submit: "प्रकाशित करा", total: "एकूण मते", fetching: "मतदान लोड होत आहेत...", vote: "मत द्या" },
        gu: { title: "સમુદાય મતદાન", create: "મતદાન બનાવો", quest: "મતદાન પ્રશ્ન", opt: "વિકલ્પ", add_opt: "વિકલ્પ ઉમેરો", submit: "પ્રકાશિત કરો", total: "કુલ મતો", fetching: "મતદાન લોડ થઈ રહ્યા છે...", vote: "મત આપો" },
        te: { title: "కమ్యూనిటీ పోల్స్", create: "పోల్ సృష్టించండి", quest: "పోల్ ప్రశ్న", opt: "ఎంపిక", add_opt: "ఎంపికను జోడించండి", submit: "ప్రచురించండి", total: "మొత్తం ఓట్లు", fetching: "పోల్స్ లోడ్ అవుతున్నాయి...", vote: "ఓటు వేయండి" },
        ta: { title: "சமூக வாக்கெடுப்பு", create: "வாக்கெடுப்பை உருவாக்கு", quest: "வாக்கெடுப்பு கேள்வி", opt: "விருப்பம்", add_opt: "விருப்பத்தை சேர்", submit: "வெளியிடு", total: "மொத்த வாக்குகள்", fetching: "வாக்கெடுப்புகள் ஏற்றப்படுகின்றன...", vote: "வாக்களி" },
        kn: { title: "ಸಮುದಾಯ ಸಮೀಕ್ಷೆ", create: "ಸಮೀಕ್ಷೆ ರಚಿಸಿ", quest: "ಸಮೀಕ್ಷೆಯ ಪ್ರಶ್ನೆ", opt: "ಆಯ್ಕೆ", add_opt: "ಆಯ್ಕೆ ಸೇರಿಸಿ", submit: "ಪ್ರಕಟಿಸಿ", total: "ಒಟ್ಟು ಮತಗಳು", fetching: "ಸಮೀಕ್ಷೆಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ...", vote: "ಮತ ಹಾಕಿ" },
        ml: { title: "കമ്മ്യൂണിറ്റി പോൾസ്", create: "പോൾ സൃഷ്ടിക്കുക", quest: "പോൾ ചോദ്യം", opt: "ഓപ്ഷൻ", add_opt: "ഓപ്ഷൻ ചേർക്കുക", submit: "പ്രസിദ്ധീകരിക്കുക", total: "ആകെ വോട്ടുകൾ", fetching: "പോളുകൾ ലോഡുചെയ്യുന്നു...", vote: "വോട്ട് ചെയ്യുക" },
        bn: { title: "সম্প্রদায় পোল", create: "পোল তৈরি করুন", quest: "পোল প্রশ্ন", opt: "বিকল্প", add_opt: "বিকল্প যোগ করুন", submit: "প্রকাশ করুন", total: "মোট ভোট", fetching: "পোল লোড হচ্ছে...", vote: "ভোট দিন" },
        pa: { title: "ਭਾਈਚਾਰਕ ਪੋਲ", create: "ਪੋਲ ਬਣਾਓ", quest: "ਪੋਲ ਸਵਾਲ", opt: "ਵਿਕਲਪ", add_opt: "ਵਿਕਲਪ ਸ਼ਾਮਲ ਕਰੋ", submit: "ਪ੍ਰਕਾਸ਼ਿਤ ਕਰੋ", total: "ਕੁੱਲ ਵੋਟਾਂ", fetching: "ਪੋਲ ਲੋਡ ਹੋ ਰਹੇ ਹਨ...", vote: "ਵੋਟ ਪਾਓ" },
        or: { title: "ସମ୍ପ୍ରଦାୟ ମତଦାନ", create: "ମତଦାନ ସୃଷ୍ଟି କରନ୍ତୁ", quest: "ମତଦାନ ପ୍ରଶ୍ନ", opt: "ବିକଳ୍ପ", add_opt: "ବିକଳ୍ପ ଯୋଡନ୍ତୁ", submit: "ପ୍ରକାଶ କରନ୍ତୁ", total: "ମୋଟ ଭୋଟ୍", fetching: "ମତଦାନ ଲୋଡ୍ ହେଉଛି...", vote: "ଭୋଟ୍ ଦିଅନ୍ତୁ" },
        as: { title: "সম্প্ৰদায়ৰ ভোটগ্ৰহণ", create: "ভোটগ্ৰহণ সৃষ্টি কৰক", quest: "ভোটগ্ৰহণৰ প্ৰশ্ন", opt: "বিকল্প", add_opt: "বিকল্প যোগ কৰক", submit: "প্ৰকাশ কৰক", total: "মুঠ ভোট", fetching: "ভোটগ্ৰহণসমূহ লোড হৈ আছে...", vote: "ভোট দিয়ক" },
        ur: { title: "کمیونٹی پولز", create: "پول بنائیں", quest: "پول کا سوال", opt: "آپشن", add_opt: "آپشن شامل کریں", submit: "شائع کریں", total: "کل ووٹ", fetching: "پولز لوڈ ہو رہے ہیں۔۔۔", vote: "ووٹ دیں" },
        bho: { title: "सामुदायिक मतदान", create: "मतदान बनाईं", quest: "मतदान के सवाल", opt: "विकल्प", add_opt: "विकल्प जोड़ीं", submit: "प्रकाशित करीं", total: "कुल वोट", fetching: "मतदान लोड हो रहल बा...", vote: "वोट दीं" }
    };

    const currentT = t[lang] || t['en'];

    const handleAddOption = () => {
        if (options.length < 5) {
            setOptions([...options, '']);
        }
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validOptions = options.filter(opt => opt.trim() !== '');
        if (!question.trim() || validOptions.length < 2) return;
        
        setIsSubmitting(true);
        try {
            const formattedOptions = validOptions.map(opt => ({ text: opt, votes: 0 }));
            await addDoc(collection(db, 'civic_polls'), {
                userId: auth.currentUser?.uid || 'guest',
                question: question.trim(),
                options: formattedOptions,
                totalVotes: 0,
                status: 'Active',
                createdAt: serverTimestamp()
            });
            setQuestion('');
            setOptions(['', '']);
            setShowForm(false);
        } catch (error) {
            console.error("Poll creation failed:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVote = async (pollId, optionIndex, pollData) => {
        if (votedPolls.has(pollId)) return;

        const newOptions = [...pollData.options];
        newOptions[optionIndex].votes += 1;
        const newTotal = pollData.totalVotes + 1;

        try {
            await updateDoc(doc(db, 'civic_polls', pollId), {
                options: newOptions,
                totalVotes: newTotal
            });
            setVotedPolls(new Set(votedPolls).add(pollId));
        } catch (error) {
            console.error("Voting failed:", error);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFFFFF] font-sans text-[#111111]">
            
            {/* Standard Header */}
            <div className="w-full flex items-center justify-between px-6 pt-12 pb-4 border-b border-[#111111]/5 sticky top-0 bg-[#FFFFFF] z-30">
                <button onClick={() => navigate(-1)} className="text-[#00897B] outline-none active:scale-95 transition-transform">
                    <ChevronLeft size={28} strokeWidth={2.5} />
                </button>
                <span className="font-black text-[1.2rem] tracking-tight">{currentT.title}</span>
                <button 
                    onClick={() => setShowForm(!showForm)} 
                    className="text-[#00897B] outline-none bg-[#00897B]/10 p-2 rounded-full active:scale-95 transition-transform"
                >
                    <Plus size={22} strokeWidth={2.5} />
                </button>
            </div>

            {/* Submission Form Overlay */}
            <AnimatePresence>
                {showForm && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-[#F9FAFB] border-b border-[#111111]/10"
                    >
                        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                            <input 
                                type="text" 
                                placeholder={currentT.quest} 
                                value={question} 
                                onChange={(e) => setQuestion(e.target.value)} 
                                required 
                                className="w-full bg-[#FFFFFF] border border-[#111111]/20 rounded-lg p-3 text-[0.95rem] font-bold outline-none focus:border-[#00897B]" 
                            />
                            
                            <div className="flex flex-col gap-2">
                                {options.map((opt, idx) => (
                                    <input 
                                        key={idx}
                                        type="text" 
                                        placeholder={`${currentT.opt} ${idx + 1}`} 
                                        value={opt} 
                                        onChange={(e) => handleOptionChange(idx, e.target.value)} 
                                        required={idx < 2}
                                        className="w-full bg-[#FFFFFF] border border-[#111111]/10 rounded-lg p-3 text-[0.9rem] outline-none focus:border-[#00897B]" 
                                    />
                                ))}
                            </div>

                            {options.length < 5 && (
                                <button type="button" onClick={handleAddOption} className="text-[#00897B] font-bold text-[0.85rem] flex items-center gap-1 self-start outline-none">
                                    <Plus size={16} /> {currentT.add_opt}
                                </button>
                            )}
                            
                            <button type="submit" disabled={isSubmitting} className="w-full bg-[#111111] text-[#FFFFFF] font-black py-4 rounded-lg mt-2 active:scale-95 transition-transform disabled:opacity-50 tracking-wide uppercase text-sm">
                                {isSubmitting ? "..." : currentT.submit}
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Real-Time Poll Feed */}
            <div className="p-6 flex flex-col gap-6">
                {loading ? (
                    <div className="w-full text-center py-10">
                        <div className="w-8 h-8 border-4 border-[#111111]/10 border-t-[#00897B] rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-sm font-bold text-[#111111]/50">{currentT.fetching}</p>
                    </div>
                ) : (
                    polls.map((poll) => {
                        const hasVoted = votedPolls.has(poll.id);
                        return (
                            <motion.div 
                                key={poll.id} 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-[#FFFFFF] border border-[#111111]/10 rounded-xl p-5 shadow-sm"
                            >
                                <h3 className="text-[1.15rem] font-black text-[#111111] mb-4 leading-tight">
                                    {poll.question}
                                </h3>
                                
                                <div className="flex flex-col gap-3">
                                    {poll.options.map((opt, idx) => {
                                        const percent = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                                        return (
                                            <button 
                                                key={idx}
                                                onClick={() => handleVote(poll.id, idx, poll)}
                                                disabled={hasVoted}
                                                className={`relative w-full overflow-hidden border rounded-lg p-3 flex items-center justify-between outline-none transition-all ${hasVoted ? 'border-[#111111]/5 bg-[#F9FAFB]' : 'border-[#111111]/20 hover:border-[#00897B] bg-[#FFFFFF] active:scale-[0.98]'}`}
                                            >
                                                {/* Progress Bar Background */}
                                                {hasVoted && (
                                                    <div 
                                                        className="absolute left-0 top-0 bottom-0 bg-[#00897B]/10 z-0 transition-all duration-1000"
                                                        style={{ width: `${percent}%` }}
                                                    ></div>
                                                )}

                                                <div className="flex items-center gap-3 z-10">
                                                    {!hasVoted ? (
                                                        <Circle size={18} className="text-[#111111]/30" strokeWidth={2} />
                                                    ) : (
                                                        <CheckCircle size={18} className="text-[#00897B]" strokeWidth={2.5} />
                                                    )}
                                                    <span className={`text-[0.95rem] font-bold ${hasVoted ? 'text-[#111111]' : 'text-[#111111]/80'}`}>
                                                        {opt.text}
                                                    </span>
                                                </div>

                                                {hasVoted && (
                                                    <span className="z-10 text-[0.85rem] font-black text-[#00897B]">
                                                        {percent}%
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex items-center justify-between mt-5 pt-3 border-t border-[#111111]/5">
                                    <div className="flex items-center gap-2 text-[#111111]/50">
                                        <BarChart size={16} />
                                        <span className="text-[0.8rem] font-bold tracking-wide uppercase">
                                            {poll.totalVotes} {currentT.total}
                                        </span>
                                    </div>
                                    <span className="text-[0.7rem] font-bold text-[#111111]/30">
                                        {poll.createdAt ? new Date(poll.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}