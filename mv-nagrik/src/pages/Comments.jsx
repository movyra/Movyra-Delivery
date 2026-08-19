import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Send, Trash2, User, Shield } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

export default function Comments() {
    const { id } = useParams(); // Post ID
    const navigate = useNavigate();
    const [lang, setLang] = useState('en');
    
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
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
        });
        return () => unsubscribe();
    }, []);

    // 15 Comprehensive Indian Language Translations (Strictly No Emojis)
    const t = {
        en: { title: "Comments", placeholder: "Write a comment...", send: "Post", no_comments: "No comments yet. Start the discussion.", loading: "Loading comments...", anon_user: "Hidden Citizen", delete: "Delete", req_login: "Sign in required to comment." },
        hi: { title: "टिप्पणियाँ", placeholder: "एक टिप्पणी लिखें...", send: "पोस्ट करें", no_comments: "अभी तक कोई टिप्पणी नहीं। चर्चा शुरू करें।", loading: "टिप्पणियाँ लोड हो रही हैं...", anon_user: "छिपा हुआ नागरिक", delete: "हटाएं", req_login: "टिप्पणी करने के लिए साइन इन आवश्यक है।" },
        hinglish: { title: "Comments", placeholder: "Comment likhein...", send: "Post Karein", no_comments: "Koi comment nahi. Discussion shuru karein.", loading: "Comments load ho rahe hain...", anon_user: "Hidden Citizen", delete: "Delete", req_login: "Comment ke liye sign in zaroori hai." },
        mr: { title: "टिप्पण्या", placeholder: "एक टिप्पणी लिहा...", send: "पोस्ट करा", no_comments: "अद्याप कोणतीही टिप्पणी नाही. चर्चा सुरू करा.", loading: "टिप्पण्या लोड होत आहेत...", anon_user: "लपलेला नागरिक", delete: "हटवा", req_login: "टिप्पणी करण्यासाठी साइन इन आवश्यक आहे." },
        gu: { title: "ટિપ્પણીઓ", placeholder: "એક ટિપ્પણી લખો...", send: "પોસ્ટ કરો", no_comments: "હજી સુધી કોઈ ટિપ્પણી નથી. ચર્ચા શરૂ કરો.", loading: "ટિપ્પણીઓ લોડ થઈ રહી છે...", anon_user: "છુપાયેલ નાગરિક", delete: "કાઢી નાખો", req_login: "ટિપ્પણી કરવા માટે સાઇન ઇન જરૂરી છે." },
        te: { title: "వ్యాఖ్యలు", placeholder: "వ్యాఖ్య రాయండి...", send: "పోస్ట్ చేయండి", no_comments: "ఇంకా వ్యాఖ్యలు లేవు. చర్చను ప్రారంభించండి.", loading: "వ్యాఖ్యలు లోడ్ అవుతున్నాయి...", anon_user: "దాచిన పౌరుడు", delete: "తొలగించండి", req_login: "వ్యాఖ్యానించడానికి సైన్ ఇన్ అవసరం." },
        ta: { title: "கருத்துகள்", placeholder: "கருத்து எழுதவும்...", send: "பதிவிடு", no_comments: "இன்னும் கருத்துகள் இல்லை. விவாதத்தை தொடங்கவும்.", loading: "கருத்துகள் ஏற்றப்படுகின்றன...", anon_user: "மறைக்கப்பட்ட குடிமகன்", delete: "அழிக்கவும்", req_login: "கருத்து தெரிவிக்க உள்நுழைய வேண்டும்." },
        kn: { title: "ಕಾಮೆಂಟ್‌ಗಳು", placeholder: "ಕಾಮೆಂಟ್ ಬರೆಯಿರಿ...", send: "ಪೋಸ್ಟ್ ಮಾಡಿ", no_comments: "ಇನ್ನೂ ಯಾವುದೇ ಕಾಮೆಂಟ್‌ಗಳಿಲ್ಲ. ಚರ್ಚೆಯನ್ನು ಪ್ರಾರಂಭಿಸಿ.", loading: "ಕಾಮೆಂಟ್‌ಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ...", anon_user: "ಗುಪ್ತ ನಾಗರಿಕ", delete: "ಅಳಿಸಿ", req_login: "ಕಾಮೆಂಟ್ ಮಾಡಲು ಸೈನ್ ಇನ್ ಅಗತ್ಯವಿದೆ." },
        ml: { title: "അഭിപ്രായങ്ങൾ", placeholder: "ഒരു അഭിപ്രായം എഴുതുക...", send: "പോസ്റ്റ് ചെയ്യുക", no_comments: "ഇതുവരെ അഭിപ്രായങ്ങളൊന്നുമില്ല. ചർച്ച ആരംഭിക്കുക.", loading: "അഭിപ്രായങ്ങൾ ലോഡ് ചെയ്യുന്നു...", anon_user: "മറഞ്ഞിരിക്കുന്ന പൗരൻ", delete: "ഇല്ലാതാക്കുക", req_login: "അഭിപ്രായമിടാൻ സൈൻ ഇൻ ആവശ്യമാണ്." },
        bn: { title: "মন্তব্য", placeholder: "একটি মন্তব্য লিখুন...", send: "পোস্ট করুন", no_comments: "এখনও কোনো মন্তব্য নেই। আলোচনা শুরু করুন।", loading: "মন্তব্য লোড হচ্ছে...", anon_user: "লুকানো নাগরিক", delete: "মুছে ফেলুন", req_login: "মন্তব্য করতে সাইন ইন প্রয়োজন।" },
        pa: { title: "ਟਿੱਪਣੀਆਂ", placeholder: "ਇੱਕ ਟਿੱਪਣੀ ਲਿਖੋ...", send: "ਪੋਸਟ ਕਰੋ", no_comments: "ਅਜੇ ਕੋਈ ਟਿੱਪਣੀ ਨਹੀਂ। ਚਰਚਾ ਸ਼ੁਰੂ ਕਰੋ।", loading: "ਟਿੱਪਣੀਆਂ ਲੋਡ ਹੋ ਰਹੀਆਂ ਹਨ...", anon_user: "ਲੁਕਿਆ ਹੋਇਆ ਨਾਗਰਿਕ", delete: "ਮਿਟਾਓ", req_login: "ਟਿੱਪਣੀ ਕਰਨ ਲਈ ਸਾਈਨ ਇਨ ਲੋੜੀਂਦਾ ਹੈ।" },
        or: { title: "ମନ୍ତବ୍ୟ", placeholder: "ଏକ ମନ୍ତବ୍ୟ ଲେଖନ୍ତୁ...", send: "ପୋଷ୍ଟ କରନ୍ତୁ", no_comments: "ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ମନ୍ତବ୍ୟ ନାହିଁ। ଆଲୋଚନା ଆରମ୍ଭ କରନ୍ତୁ।", loading: "ମନ୍ତବ୍ୟ ଲୋଡ୍ ହେଉଛି...", anon_user: "ଲୁକ୍କାୟିତ ନାଗରିକ", delete: "ଡିଲିଟ୍ କରନ୍ତୁ", req_login: "ମନ୍ତବ୍ୟ ଦେବାକୁ ସାଇନ୍ ଇନ୍ ଆବଶ୍ୟକ।" },
        as: { title: "মন্তব্য", placeholder: "এটা মন্তব্য লিখক...", send: "পোষ্ট কৰক", no_comments: "এতিয়ালৈকে কোনো মন্তব্য নাই। আলোচনা আৰম্ভ কৰক।", loading: "মন্তব্য ল'ড হৈ আছে...", anon_user: "লুকুৱাই ৰখা নাগৰিক", delete: "মচি পেলাওক", req_login: "মন্তব্য কৰিবলৈ ছাইন ইন প্ৰয়োজনীয়।" },
        ur: { title: "تبصرے", placeholder: "ایک تبصرہ لکھیں۔۔۔", send: "پوسٹ کریں", no_comments: "ابھی تک کوئی تبصرہ نہیں ہے۔ بحث شروع کریں۔", loading: "تبصرے لوڈ ہو رہے ہیں۔۔۔", anon_user: "چھپا ہوا شہری", delete: "حذف کریں", req_login: "تبصرہ کرنے کے لیے سائن ان درکار ہے۔" },
        bho: { title: "टिप्पणी", placeholder: "एगो टिप्पणी लिखीं...", send: "पोस्ट करीं", no_comments: "अभी ले कवनो टिप्पणी नइखे। चर्चा शुरू करीं।", loading: "टिप्पणी लोड हो रहल बा...", anon_user: "छिपल नागरिक", delete: "मिटाईं", req_login: "टिप्पणी करे खातिर साइन इन जरूरी बा।" }
    };

    const currentT = t[lang] || t['en'];

    // Scroll to latest comment
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Real-Time Comments Fetching
    useEffect(() => {
        if (!id) return;
        setIsLoading(true);

        const commentsRef = collection(db, 'nagrik_comments');
        const q = query(commentsRef, where('postId', '==', id), orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setComments(fetchedComments);
            setIsLoading(false);
            setTimeout(scrollToBottom, 100);
        }, (error) => {
            console.error("Comments fetch error:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [id]);

    // Handle Comment Submission
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        if (!currentUser) {
            alert(currentT.req_login);
            return;
        }

        setIsSubmitting(true);
        try {
            const authorName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Citizen';
            
            await addDoc(collection(db, 'nagrik_comments'), {
                postId: id,
                authorId: currentUser.uid,
                authorName: authorName,
                text: newComment.trim(),
                createdAt: serverTimestamp(),
            });

            setNewComment('');
            scrollToBottom();
        } catch (error) {
            console.error("Failed to post comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Comment Deletion (Author Only)
    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Remove this comment?")) return;
        try {
            await deleteDoc(doc(db, 'nagrik_comments', commentId));
        } catch (error) {
            console.error("Failed to delete comment:", error);
        }
    };

    return (
        <div className="bg-[#F9FAFB] min-h-screen w-full font-sans text-[#111111] flex flex-col">
            
            {/* Header */}
            <div className="sticky top-0 z-30 bg-[#FFFFFF] border-b border-[#111111]/10 px-4 py-3 flex items-center gap-3 shadow-sm">
                <button onClick={() => navigate(-1)} className="outline-none active:scale-95 transition-transform">
                    <ChevronLeft size={28} className="text-[#111111]" strokeWidth={2.5} />
                </button>
                <span className="font-black text-[1.2rem] tracking-tight">{currentT.title}</span>
            </div>

            {/* Comments Thread Area */}
            <div className="flex-1 overflow-y-auto p-4 pb-24">
                {isLoading ? (
                    <div className="w-full py-16 flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-4 border-t-transparent border-[#00897B] rounded-full animate-spin mb-4"></div>
                        <span className="font-bold text-[0.9rem] text-[#111111]/60">{currentT.loading}</span>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="w-full py-16 flex flex-col items-center justify-center text-center">
                        <MessageCircle size={48} className="text-[#111111]/10 mb-3" strokeWidth={1.5} />
                        <span className="font-bold text-[1rem] text-[#111111]/50">{currentT.no_comments}</span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <AnimatePresence>
                            {comments.map((comment) => {
                                const isAuthor = currentUser?.uid === comment.authorId;
                                return (
                                    <motion.div 
                                        key={comment.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="flex gap-3 bg-[#FFFFFF] p-4 rounded-xl border border-[#111111]/5 shadow-sm relative group"
                                    >
                                        {/* Avatar */}
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FFB300] to-[#00897B] p-[2px] shrink-0">
                                            <div className="w-full h-full bg-[#FFFFFF] rounded-full flex items-center justify-center overflow-hidden">
                                                <User size={18} className="text-[#111111]/40" />
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex flex-col flex-1">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <span className="text-[#111111] text-[0.85rem] font-black">{comment.authorName || currentT.anon_user}</span>
                                                {comment.authorName !== currentT.anon_user && <Shield size={12} className="text-[#00897B]" fill="#00897B" />}
                                                <span className="text-[#111111]/40 text-[0.7rem] font-bold ml-1">
                                                    {comment.createdAt ? new Date(comment.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                                                </span>
                                            </div>
                                            <p className="text-[#111111]/80 text-[0.95rem] leading-relaxed break-words">
                                                {comment.text}
                                            </p>
                                        </div>

                                        {/* Delete Button (Author Only) */}
                                        {isAuthor && (
                                            <button 
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="absolute top-4 right-4 text-[#111111]/30 hover:text-red-500 transition-colors outline-none"
                                                aria-label={currentT.delete}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Comment Input Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#111111]/10 p-4 pb-6 z-40">
                <form onSubmit={handleAddComment} className="max-w-[800px] mx-auto flex items-center gap-3">
                    <div className="flex-1 bg-[#F9FAFB] border border-[#111111]/15 rounded-full px-4 py-3 flex items-center focus-within:border-[#00897B] transition-colors">
                        <input 
                            type="text" 
                            placeholder={currentT.placeholder} 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full bg-transparent text-[0.95rem] font-medium outline-none placeholder-[#111111]/40"
                            disabled={isSubmitting}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={!newComment.trim() || isSubmitting}
                        className="w-12 h-12 rounded-full bg-[#111111] text-[#FFFFFF] flex items-center justify-center shrink-0 outline-none active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100 shadow-md"
                    >
                        <Send size={18} className="ml-1" />
                    </button>
                </form>
            </div>
            
        </div>
    );
}