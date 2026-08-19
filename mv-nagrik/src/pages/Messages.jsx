import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Send, User, MessageSquare, Plus, X } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

export default function Messages() {
    const navigate = useNavigate();
    const [lang, setLang] = useState('en');
    
    // Core State
    const [currentUser, setCurrentUser] = useState(null);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inboxThreads, setInboxThreads] = useState([]);
    
    // UI Input State
    const [newMessage, setNewMessage] = useState('');
    const [isStartingNew, setIsStartingNew] = useState(false);
    const [newRecipientId, setNewRecipientId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const messagesEndRef = useRef(null);

    // Language Synchronization
    useEffect(() => {
        const savedLang = localStorage.getItem('nagrik_lang') || navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'kn', 'ml', 'bn', 'pa', 'or', 'as', 'ur', 'bho'];
        if (supported.includes(savedLang)) setLang(savedLang);
    }, []);

    // Authentication Listener
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setCurrentUser(user);
            if (!user) setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // 15 Comprehensive Indian Language Translations (Strictly Professional)
    const t = {
        en: { title: "Direct Messages", loading: "Loading network...", no_chats: "No active conversations.", start_chat: "Start Conversation", rec_id: "Recipient User ID", cancel: "Cancel", start: "Begin", placeholder: "Type a message...", send: "Send", anon: "Citizen", req_login: "Sign in required." },
        hi: { title: "सीधे संदेश", loading: "नेटवर्क लोड हो रहा है...", no_chats: "कोई सक्रिय बातचीत नहीं।", start_chat: "बातचीत शुरू करें", rec_id: "प्राप्तकर्ता उपयोगकर्ता आईडी", cancel: "रद्द करें", start: "शुरू करें", placeholder: "एक संदेश टाइप करें...", send: "भेजें", anon: "नागरिक", req_login: "साइन इन आवश्यक है।" },
        hinglish: { title: "Direct Messages", loading: "Network load ho raha hai...", no_chats: "Koi active chat nahi.", start_chat: "Chat Shuru Karein", rec_id: "Recipient User ID", cancel: "Cancel", start: "Start", placeholder: "Message type karein...", send: "Bhejein", anon: "Citizen", req_login: "Sign in zaroori hai." },
        mr: { title: "थेट संदेश", loading: "नेटवर्क लोड होत आहे...", no_chats: "कोणतेही सक्रिय संभाषण नाही.", start_chat: "संभाषण सुरू करा", rec_id: "प्राप्तकर्ता वापरकर्ता आयडी", cancel: "रद्द करा", start: "सुरू करा", placeholder: "संदेश टाइप करा...", send: "पाठवा", anon: "नागरिक", req_login: "साइन इन आवश्यक आहे." },
        gu: { title: "સીધા સંદેશાઓ", loading: "નેટવર્ક લોડ થઈ રહ્યું છે...", no_chats: "કોઈ સક્રિય વાતચીત નથી.", start_chat: "વાતચીત શરૂ કરો", rec_id: "પ્રાપ્તકર્તા વપરાશકર્તા ID", cancel: "રદ કરો", start: "શરૂ કરો", placeholder: "સંદેશ લખો...", send: "મોકલો", anon: "નાગરિક", req_login: "સાઇન ઇન જરૂરી છે." },
        te: { title: "ప్రత్యక్ష సందేశాలు", loading: "నెట్‌వర్క్ లోడ్ అవుతోంది...", no_chats: "క్రియాశీల సంభాషణలు లేవు.", start_chat: "సంభాషణను ప్రారంభించండి", rec_id: "స్వీకర్త వినియోగదారు ID", cancel: "రద్దు చేయండి", start: "ప్రారంభించండి", placeholder: "సందేశాన్ని టైప్ చేయండి...", send: "పంపండి", anon: "పౌరుడు", req_login: "సైన్ ఇన్ అవసరం." },
        ta: { title: "நேரடி செய்திகள்", loading: "நெட்வொர்க் ஏற்றப்படுகிறது...", no_chats: "செயலில் உள்ள உரையாடல்கள் இல்லை.", start_chat: "உரையாடலைத் தொடங்கு", rec_id: "பெறுநர் பயனர் ஐடி", cancel: "ரத்துசெய்", start: "தொடங்கு", placeholder: "ஒரு செய்தியை தட்டச்சு செய்யவும்...", send: "அனுப்பு", anon: "குடிமகன்", req_login: "உள்நுழைவு தேவை." },
        kn: { title: "ನೇರ ಸಂದೇಶಗಳು", loading: "ನೆಟ್‌ವರ್ಕ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ...", no_chats: "ಯಾವುದೇ ಸಕ್ರಿಯ ಸಂಭಾಷಣೆಗಳಿಲ್ಲ.", start_chat: "ಸಂಭಾಷಣೆ ಪ್ರಾರಂಭಿಸಿ", rec_id: "ಸ್ವೀಕರಿಸುವವರ ಬಳಕೆದಾರ ID", cancel: "ರದ್ದುಮಾಡಿ", start: "ಪ್ರಾರಂಭಿಸಿ", placeholder: "ಸಂದೇಶವನ್ನು ಟೈಪ್ ಮಾಡಿ...", send: "ಕಳುಹಿಸಿ", anon: "ನಾಗರಿಕ", req_login: "ಸೈನ್ ಇನ್ ಅಗತ್ಯವಿದೆ." },
        ml: { title: "നേരിട്ടുള്ള സന്ദേശങ്ങൾ", loading: "നെറ്റ്‌വർക്ക് ലോഡ് ചെയ്യുന്നു...", no_chats: "സജീവമായ സംഭാഷണങ്ങളില്ല.", start_chat: "സംഭാഷണം ആരംഭിക്കുക", rec_id: "സ്വീകർത്താവിന്റെ ഉപയോക്തൃ ഐഡി", cancel: "റദ്ദാക്കുക", start: "ആരംഭിക്കുക", placeholder: "ഒരു സന്ദേശം ടൈപ്പ് ചെയ്യുക...", send: "അയയ്ക്കുക", anon: "പൗരൻ", req_login: "സൈൻ ഇൻ ആവശ്യമാണ്." },
        bn: { title: "সরাসরি বার্তা", loading: "নেটওয়ার্ক লোড হচ্ছে...", no_chats: "কোনো সক্রিয় কথোপকথন নেই।", start_chat: "কথোপকথন শুরু করুন", rec_id: "প্রাপক ব্যবহারকারী আইডি", cancel: "বাতিল করুন", start: "শুরু করুন", placeholder: "একটি বার্তা টাইপ করুন...", send: "পাঠান", anon: "নাগরিক", req_login: "সাইন ইন প্রয়োজন।" },
        pa: { title: "ਸਿੱਧੇ ਸੁਨੇਹੇ", loading: "ਨੈੱਟਵਰਕ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...", no_chats: "ਕੋਈ ਸਰਗਰਮ ਗੱਲਬਾਤ ਨਹੀਂ।", start_chat: "ਗੱਲਬਾਤ ਸ਼ੁਰੂ ਕਰੋ", rec_id: "ਪ੍ਰਾਪਤਕਰਤਾ ਉਪਭੋਗਤਾ ਆਈਡੀ", cancel: "ਰੱਦ ਕਰੋ", start: "ਸ਼ੁਰੂ ਕਰੋ", placeholder: "ਇੱਕ ਸੁਨੇਹਾ ਟਾਈਪ ਕਰੋ...", send: "ਭੇਜੋ", anon: "ਨਾਗਰਿਕ", req_login: "ਸਾਈਨ ਇਨ ਲੋੜੀਂਦਾ ਹੈ।" },
        or: { title: "ସିଧାସଳଖ ବାର୍ତ୍ତା", loading: "ନେଟୱାର୍କ ଲୋଡ୍ ହେଉଛି...", no_chats: "କୌଣସି ସକ୍ରିୟ ବାର୍ତ୍ତାଳାପ ନାହିଁ।", start_chat: "ବାର୍ତ୍ତାଳାପ ଆରମ୍ଭ କରନ୍ତୁ", rec_id: "ପ୍ରାପ୍ତକର୍ତ୍ତା ବ୍ୟବହାରକାରୀ ଆଇଡି", cancel: "ବାତିଲ୍ କରନ୍ତୁ", start: "ଆରମ୍ଭ କରନ୍ତୁ", placeholder: "ଏକ ବାର୍ତ୍ତା ଟାଇପ୍ କରନ୍ତୁ...", send: "ପଠାନ୍ତୁ", anon: "ନାଗରିକ", req_login: "ସାଇନ୍ ଇନ୍ ଆବଶ୍ୟକ।" },
        as: { title: "পোনপটীয়া বাৰ্তা", loading: "নেটৱৰ্ক ল'ড হৈ আছে...", no_chats: "কোনো সক্ৰিয় বাৰ্তালাপ নাই।", start_chat: "বাৰ্তালাপ আৰম্ভ কৰক", rec_id: "প্ৰাপক ব্যৱহাৰকাৰী আইডি", cancel: "বাতিল কৰক", start: "আৰম্ভ কৰক", placeholder: "এটা বাৰ্তা টাইপ কৰক...", send: "পঠাওক", anon: "নাগৰিক", req_login: "ছাইন ইন প্ৰয়োজনীয়।" },
        ur: { title: "براہ راست پیغامات", loading: "نیٹ ورک لوڈ ہو رہا ہے۔۔۔", no_chats: "کوئی فعال بات چیت نہیں ہے۔", start_chat: "بات چیت شروع کریں", rec_id: "وصول کنندہ صارف کی شناخت", cancel: "منسوخ کریں", start: "شروع کریں", placeholder: "ایک پیغام ٹائپ کریں۔۔۔", send: "بھیجیں", anon: "شہری", req_login: "سائن ان درکار ہے۔" },
        bho: { title: "सीधा संदेश", loading: "नेटवर्क लोड हो रहल बा...", no_chats: "कवनो सक्रिय बातचीत नइखे।", start_chat: "बातचीत शुरू करीं", rec_id: "प्राप्तकर्ता उपयोगकर्ता आईडी", cancel: "रद्द करीं", start: "शुरू करीं", placeholder: "संदेश टाइप करीं...", send: "भेजीं", anon: "नागरिक", req_login: "साइन इन जरूरी बा।" }
    };

    const currentT = t[lang] || t['en'];

    // Utility: Generate consistent Conversation ID
    const getConversationId = (uid1, uid2) => {
        return [uid1, uid2].sort().join('_');
    };

    // Scroll to latest message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Fetch Inbox Threads (Simplified Client-Side Aggregation for MVP)
    useEffect(() => {
        if (!currentUser) return;
        setIsLoading(true);

        const messagesRef = collection(db, 'nagrik_messages');
        const q = query(messagesRef, where('senderId', '==', currentUser.uid), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const threads = new Map();
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                if (!threads.has(data.conversationId)) {
                    threads.set(data.conversationId, {
                        conversationId: data.conversationId,
                        partnerId: data.receiverId,
                        lastMessage: data.text,
                        timestamp: data.createdAt
                    });
                }
            });
            setInboxThreads(Array.from(threads.values()));
            setIsLoading(false);
        }, (error) => {
            console.error("Inbox fetch error:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Fetch Active Conversation Messages
    useEffect(() => {
        if (!activeConversation || !currentUser) return;

        const messagesRef = collection(db, 'nagrik_messages');
        const q = query(messagesRef, where('conversationId', '==', activeConversation.conversationId), orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(fetchedMessages);
            setTimeout(scrollToBottom, 100);
        });

        return () => unsubscribe();
    }, [activeConversation, currentUser]);

    // Handle Starting a New Conversation
    const handleStartNewChat = (e) => {
        e.preventDefault();
        if (!newRecipientId.trim() || !currentUser) return;

        const convId = getConversationId(currentUser.uid, newRecipientId.trim());
        setActiveConversation({
            conversationId: convId,
            partnerId: newRecipientId.trim()
        });
        setIsStartingNew(false);
        setNewRecipientId('');
    };

    // Handle Message Submission
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation || !currentUser) return;

        setIsSubmitting(true);
        try {
            const senderName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Citizen';
            
            await addDoc(collection(db, 'nagrik_messages'), {
                conversationId: activeConversation.conversationId,
                senderId: currentUser.uid,
                senderName: senderName,
                receiverId: activeConversation.partnerId,
                text: newMessage.trim(),
                createdAt: serverTimestamp(),
            });

            setNewMessage('');
            scrollToBottom();
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!currentUser) {
        return (
            <div className="w-full h-screen bg-[#F9FAFB] flex flex-col items-center justify-center">
                <span className="font-bold text-[1rem] text-[#111111]/50">{currentT.req_login}</span>
            </div>
        );
    }

    return (
        <div className="bg-[#F9FAFB] min-h-screen w-full font-sans text-[#111111] flex flex-col relative overflow-hidden">
            
            {/* Dynamic Header */}
            <div className="sticky top-0 z-30 bg-[#FFFFFF] border-b border-[#111111]/10 px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => activeConversation ? setActiveConversation(null) : navigate(-1)} 
                        className="outline-none active:scale-95 transition-transform"
                    >
                        <ChevronLeft size={28} className="text-[#111111]" strokeWidth={2.5} />
                    </button>
                    <span className="font-black text-[1.1rem] tracking-tight truncate max-w-[200px]">
                        {activeConversation ? activeConversation.partnerId : currentT.title}
                    </span>
                </div>
                {!activeConversation && (
                    <button onClick={() => setIsStartingNew(true)} className="outline-none active:scale-95 transition-transform text-[#00897B] p-1 bg-[#00897B]/10 rounded-full">
                        <Plus size={22} strokeWidth={2.5} />
                    </button>
                )}
            </div>

            {/* View Management */}
            <AnimatePresence mode="wait">
                {/* INBOX VIEW */}
                {!activeConversation && !isStartingNew && (
                    <motion.div 
                        key="inbox"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1 overflow-y-auto p-4"
                    >
                        {isLoading ? (
                            <div className="w-full py-16 flex flex-col items-center justify-center">
                                <div className="w-8 h-8 border-4 border-t-transparent border-[#00897B] rounded-full animate-spin mb-4"></div>
                                <span className="font-bold text-[0.9rem] text-[#111111]/60">{currentT.loading}</span>
                            </div>
                        ) : inboxThreads.length === 0 ? (
                            <div className="w-full py-16 flex flex-col items-center justify-center text-center">
                                <MessageSquare size={48} className="text-[#111111]/10 mb-3" strokeWidth={1.5} />
                                <span className="font-bold text-[1rem] text-[#111111]/50">{currentT.no_chats}</span>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {inboxThreads.map((thread) => (
                                    <div 
                                        key={thread.conversationId}
                                        onClick={() => setActiveConversation(thread)}
                                        className="bg-[#FFFFFF] p-4 rounded-xl border border-[#111111]/5 shadow-sm flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-[#00897B]/10 flex items-center justify-center shrink-0">
                                            <User size={20} className="text-[#00897B]" />
                                        </div>
                                        <div className="flex flex-col flex-1 overflow-hidden">
                                            <span className="font-black text-[0.95rem] text-[#111111] truncate">{thread.partnerId}</span>
                                            <span className="text-[0.85rem] text-[#111111]/60 truncate mt-0.5">{thread.lastMessage}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* NEW CHAT MODAL OVERLAY */}
                {isStartingNew && (
                    <motion.div 
                        key="new-chat"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute inset-0 bg-[#FFFFFF] z-40 p-6 flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="font-black text-[1.4rem] text-[#111111]">{currentT.start_chat}</h2>
                            <button onClick={() => setIsStartingNew(false)} className="outline-none p-2 bg-[#F9FAFB] rounded-full">
                                <X size={24} className="text-[#111111]" />
                            </button>
                        </div>
                        <form onSubmit={handleStartNewChat} className="flex flex-col gap-4">
                            <input 
                                type="text" 
                                placeholder={currentT.rec_id} 
                                value={newRecipientId}
                                onChange={(e) => setNewRecipientId(e.target.value)}
                                required
                                className="w-full bg-[#F9FAFB] border border-[#111111]/15 rounded-xl p-4 text-[1rem] font-bold outline-none focus:border-[#00897B]"
                            />
                            <button 
                                type="submit"
                                className="w-full bg-[#111111] text-[#FFFFFF] font-black py-4 rounded-xl active:scale-95 transition-transform tracking-wide uppercase text-sm"
                            >
                                {currentT.start}
                            </button>
                        </form>
                    </motion.div>
                )}

                {/* ACTIVE CHAT THREAD VIEW */}
                {activeConversation && !isStartingNew && (
                    <motion.div 
                        key="chat-thread"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex-1 flex flex-col h-[calc(100vh-60px)]"
                    >
                        <div className="flex-1 overflow-y-auto p-4 pb-24 flex flex-col gap-3">
                            {messages.map((msg) => {
                                const isMe = msg.senderId === currentUser.uid;
                                return (
                                    <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] p-3.5 rounded-2xl ${isMe ? 'bg-[#00897B] text-[#FFFFFF] rounded-tr-sm' : 'bg-[#FFFFFF] border border-[#111111]/10 text-[#111111] rounded-tl-sm shadow-sm'}`}>
                                            <p className="text-[0.95rem] leading-relaxed break-words">{msg.text}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input Footer */}
                        <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#111111]/10 p-4 pb-6 z-40">
                            <form onSubmit={handleSendMessage} className="max-w-[800px] mx-auto flex items-center gap-3">
                                <div className="flex-1 bg-[#F9FAFB] border border-[#111111]/15 rounded-full px-4 py-3 flex items-center focus-within:border-[#00897B] transition-colors">
                                    <input 
                                        type="text" 
                                        placeholder={currentT.placeholder} 
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        className="w-full bg-transparent text-[0.95rem] font-medium outline-none placeholder-[#111111]/40"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={!newMessage.trim() || isSubmitting}
                                    className="w-12 h-12 rounded-full bg-[#111111] text-[#FFFFFF] flex items-center justify-center shrink-0 outline-none active:scale-95 transition-transform disabled:opacity-50 shadow-md"
                                >
                                    <Send size={18} className="ml-1" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}