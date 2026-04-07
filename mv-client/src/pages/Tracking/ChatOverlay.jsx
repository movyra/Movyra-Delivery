import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, UserCircle2, Loader2, MessageSquare } from 'lucide-react';

// Real Database & Auth Integration
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../services/firebaseAuth';

/**
 * COMPONENT: IN-APP CHAT OVERLAY (SLIDING BOTTOM SHEET)
 * Features:
 * 1. Real-time Firestore Sync (Shared public data room for user/driver)
 * 2. Strict Memory-Sorting (Bypasses Firebase index limits)
 * 3. Quick-Reply Liquidity Chips
 * 4. Auto-scrolling Message Viewport
 * 5. Framer Motion Spring Physics
 * 6. Auth-Secured Transaction Layer
 */

const QUICK_REPLIES = [
  "I'm coming down.",
  "Please call me.",
  "Leave it at the door.",
  "I'm at the gate."
];

// Utility to safely grab the current isolated App ID
const getAppId = () => {
  if (typeof window !== 'undefined' && window.__app_id) return window.__app_id;
  if (typeof __app_id !== 'undefined') return __app_id;
  return 'default-app-id';
};

export default function ChatOverlay({ isOpen, onClose, orderId, driverName = 'Delivery Partner' }) {
  const db = getFirestore();
  const bottomRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // ============================================================================
  // REAL-TIME FIRESTORE SYNC & IN-MEMORY SORTING (CRITICAL RULE ADHERENCE)
  // ============================================================================
  useEffect(() => {
    if (!isOpen || !orderId) return;
    
    let unsubscribeSnapshot;
    
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        
        // STRICT PATH RULE: Shared public data room for this specific order
        const chatRef = collection(db, 'artifacts', getAppId(), 'public', 'data', `chats_${orderId}`);
        
        // STRICT QUERY RULE: Fetch all, sort in memory to avoid complex index requirements
        unsubscribeSnapshot = onSnapshot(chatRef, (snapshot) => {
          const fetchedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          fetchedMessages.sort((a, b) => {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
            return timeA - timeB; // Ascending order (oldest first)
          });
          
          setMessages(fetchedMessages);
          
          // Auto-scroll to bottom on new message
          setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }, (err) => {
          console.error("Chat Sync Error:", err);
        });
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      unsubscribeAuth();
    };
  }, [isOpen, orderId, db]);

  // ============================================================================
  // MESSAGE DISPATCH LOGIC
  // ============================================================================
  const handleSendMessage = async (textToSubmit) => {
    const text = textToSubmit || inputText;
    if (!text.trim() || !currentUser) return;

    setIsSending(true);
    setInputText('');

    try {
      const chatRef = collection(db, 'artifacts', getAppId(), 'public', 'data', `chats_${orderId}`);
      await addDoc(chatRef, {
        text: text.trim(),
        senderId: currentUser.uid,
        senderType: 'user', // user | driver
        createdAt: serverTimestamp()
      });
      
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Revert text if failed
      setInputText(text); 
    } finally {
      setIsSending(false);
    }
  };

  // ============================================================================
  // RENDER UI
  // ============================================================================
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex flex-col justify-end font-sans"
        >
          {/* Close Overlay Click Area */}
          <div className="flex-1" onClick={onClose} />

          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="bg-[#F2F4F7] w-full h-[85vh] rounded-t-[40px] flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-white px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0 rounded-t-[40px]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#F6F6F6] rounded-full flex items-center justify-center text-[#111111] shrink-0 border border-gray-100">
                  <UserCircle2 size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-[18px] font-black text-[#111111] tracking-tight">{driverName}</h3>
                  <span className="flex items-center gap-1.5 text-[12px] font-bold text-green-500">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Online
                  </span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 bg-[#F6F6F6] rounded-full flex items-center justify-center text-[#111111] hover:bg-gray-200 active:scale-95 transition-all"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            {/* Chat Viewport */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 no-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <MessageSquare size={48} className="text-gray-400 mb-4" strokeWidth={1.5} />
                  <p className="text-[16px] font-black text-[#111111]">No Messages Yet</p>
                  <p className="text-[13px] font-bold text-gray-500 mt-1">Send a message to contact your driver.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.senderType === 'user';
                  return (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] p-4 ${isUser ? 'bg-[#111111] text-white rounded-[24px] rounded-tr-sm' : 'bg-white text-[#111111] border border-gray-100 shadow-sm rounded-[24px] rounded-tl-sm'}`}>
                        <p className="text-[15px] font-bold leading-snug">{msg.text}</p>
                        <span className={`block text-[10px] font-black tracking-widest uppercase mt-2 opacity-60 ${isUser ? 'text-right' : 'text-left'}`}>
                          {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={bottomRef} className="h-2" />
            </div>

            {/* Input Area */}
            <div className="bg-white p-5 border-t border-gray-100 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] pb-8">
              
              {/* Quick Replies Carousel */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
                {QUICK_REPLIES.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(reply)}
                    disabled={isSending}
                    className="shrink-0 px-4 py-2.5 bg-[#F6F6F6] hover:bg-gray-100 border border-gray-200 text-[#111111] rounded-full text-[13px] font-bold transition-all active:scale-95 disabled:opacity-50"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Text Input Block */}
              <div className="flex items-end gap-3 bg-[#F6F6F6] p-2 rounded-[32px] border-2 border-transparent focus-within:border-[#111111] transition-all">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent px-4 py-3 text-[15px] font-bold text-[#111111] placeholder:text-gray-400 outline-none resize-none max-h-[120px] min-h-[50px] no-scrollbar"
                  rows={1}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isSending}
                  className="w-12 h-12 shrink-0 bg-[#111111] text-white rounded-full flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 mb-0.5 mr-0.5 shadow-md"
                >
                  {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} strokeWidth={2.5} className="-ml-0.5 mt-0.5" />}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}