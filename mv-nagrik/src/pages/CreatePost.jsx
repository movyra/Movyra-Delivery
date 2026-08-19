import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, UploadCloud, MapPin, EyeOff, Eye, Image as ImageIcon, Video, X, CheckCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

export default function CreatePost() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [lang, setLang] = useState('en');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);

    // Media Upload State
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [mediaType, setMediaType] = useState('image'); // 'image' | 'video'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Language Synchronization
    useEffect(() => {
        const savedLang = localStorage.getItem('nagrik_lang') || navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'kn', 'ml', 'bn', 'pa', 'or', 'as', 'ur', 'bho'];
        if (supported.includes(savedLang)) setLang(savedLang);
    }, []);

    // 15 Comprehensive Indian Language Translations
    const t = {
        en: { header: "Create Post", media_box: "Select Photo or Video", title_ph: "Give your post a title", desc_ph: "Write details about this update...", loc_ph: "Enter Ward / Area name", anon_title: "Post Anonymously", anon_sub: "Hide your name and profile photo", submit: "Share Post", publishing: "Uploading media...", err_media: "Please choose a media file.", err_fields: "Please fill in all required fields." },
        hi: { header: "पोस्ट बनाएं", media_box: "फ़ोटो या वीडियो चुनें", title_ph: "अपनी पोस्ट को एक शीर्षक दें", desc_ph: "इस अपडेट के बारे में विवरण लिखें...", loc_ph: "वार्ड या क्षेत्र का नाम दर्ज करें", anon_title: "गुमनाम रूप से पोस्ट करें", anon_sub: "अपना नाम और प्रोफ़ाइल फ़ोटो छिपाएं", submit: "पोस्ट साझा करें", publishing: "मीडिया अपलोड हो रहा है...", err_media: "कृपया एक मीडिया फ़ाइल चुनें।", err_fields: "कृपया सभी आवश्यक फ़ील्ड भरें।" },
        hinglish: { header: "Post Banayein", media_box: "Photo ya Video Chunein", title_ph: "Post ka title likhein", desc_ph: "Update ki details likhein...", loc_ph: "Ward / Area ka naam darj karein", anon_title: "Anonymous Post Karein", anon_sub: "Apna naam aur photo hide karein", submit: "Post Share Karein", publishing: "Media upload ho raha hai...", err_media: "Ek media file choose karein.", err_fields: "Sabhi zaroori fields bharein." },
        mr: { header: "पोस्ट तयार करा", media_box: "फोटो किंवा व्हिडिओ निवडा", title_ph: "आपल्या पोस्टला शीर्षक द्या", desc_ph: "या अपडेटबद्दल तपशील लिहा...", loc_ph: "प्रभाग किंवा परिसराचे नाव प्रविष्ट करा", anon_title: "अनामिकपणे पोस्ट करा", anon_sub: "आपले नाव आणि फोटो लपवा", submit: "पोस्ट शेअर करा", publishing: "मीडिया अपलोड होत आहे...", err_media: "कृपया मीडिया फाइल निवडा.", err_fields: "कृपया सर्व आवश्यक माहिती भरा." },
        gu: { header: "પોસ્ટ બનાવો", media_box: "ફોટો અથવા વિડિઓ પસંદ કરો", title_ph: "તમારી પોસ્ટને શીર્ષક આપો", desc_ph: "આ અપડેટ વિશે વિગતો લખો...", loc_ph: "વોર્ડ અથવા વિસ્તારનું નામ દાખલ કરો", anon_title: "અનામી રીતે પોસ્ટ કરો", anon_sub: "તમારું નામ અને ફોટો છુપાવો", submit: "પોસ્ટ શેર કરો", publishing: "મીડિયા અપલોડ થઈ રહ્યું છે...", err_media: "કૃપા કરીને મીડિયા ફાઇલ પસંદ કરો.", err_fields: "કૃપા કરીને બધી જરૂરી માહિતી ભરો." },
        te: { header: "పోస్ట్‌ను సృష్టించండి", media_box: "ఫోటో లేదా వీడియోను ఎంచుకోండి", title_ph: "మీ పోస్ట్‌కు శీర్షిక ఇవ్వండి", desc_ph: "ఈ అప్‌డేట్ గురించి వివరాలను వ్రాయండి...", loc_ph: "వార్డు లేదా ప్రాంతం పేరును నమోదు చేయండి", anon_title: "అనామకంగా పోస్ట్ చేయండి", anon_sub: "మీ పేరు మరియు ఫోటోను దాచండి", submit: "పోస్ట్‌ను భాగస్వామ్యం చేయండి", publishing: "మీడియా అప్‌లోడ్ అవుతోంది...", err_media: "దయచేసి మీడియా ఫైల్‌ను ఎంచుకోండి.", err_fields: "దయచేసి అవసరమైన అన్ని ఫీల్డ్‌లను పూరించండి." },
        ta: { header: "பதிவை உருவாக்கவும்", media_box: "புகைப்படம் அல்லது வீடியோவைத் தேர்ந்தெடுக்கவும்", title_ph: "உங்கள் பதிவிற்கு ஒரு தலைப்பைக் கொடுங்கள்", desc_ph: "இந்த புதுப்பிப்பு பற்றிய விவரங்களை எழுதுங்கள்...", loc_ph: "வார்டு அல்லது பகுதியின் பெயரை உள்ளிடவும்", anon_title: "அநாமதேயமாக பதிவு செய்யவும்", anon_sub: "உங்கள் பெயர் மற்றும் புகைப்படத்தை மறைக்கவும்", submit: "பதிவை பகிரவும்", publishing: "மீடியா பதிவேற்றப்படுகிறது...", err_media: "ஒரு மீடியா கோப்பைத் தேர்ந்தெடுக்கவும்.", err_fields: "தேவையான அனைத்து புலங்களையும் நிரப்பவும்." },
        kn: { header: "ಪೋಸ್ಟ್ ರಚಿಸಿ", media_box: "ಫೋಟೋ ಅಥವಾ ವೀಡಿಯೊ ಆಯ್ಕೆಮಾಡಿ", title_ph: "ನಿಮ್ಮ ಪೋಸ್ಟ್‌ಗೆ ಶೀರ್ಷಿಕೆ ನೀಡಿ", desc_ph: "ಈ ನವೀಕರಣದ ಕುರಿತು ವಿವರಗಳನ್ನು ಬರೆಯಿರಿ...", loc_ph: "ವಾರ್ಡ್ ಅಥವಾ ಪ್ರದೇಶದ ಹೆಸರನ್ನು ನಮೂದಿಸಿ", anon_title: "ಅನಾಮಧೇಯವಾಗಿ ಪೋಸ್ಟ್ ಮಾಡಿ", anon_sub: "ನಿಮ್ಮ ಹೆಸರು ಮತ್ತು ಫೋಟೋ ಮರೆಮಾಡಿ", submit: "ಪೋಸ್ಟ್ ಹಂಚಿಕೊಳ್ಳಿ", publishing: "ಮಾಧ್ಯಮ ಅಪ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ...", err_media: "ದಯವಿಟ್ಟು ಮಾಧ್ಯಮ ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ.", err_fields: "ದಯವಿಟ್ಟು ಅಗತ್ಯವಿರುವ ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ." },
        ml: { header: "പോസ്റ്റ് സൃഷ്ടിക്കുക", media_box: "ഫോട്ടോ അല്ലെങ്കിൽ വീഡിയോ തിരഞ്ഞെടുക്കുക", title_ph: "നിങ്ങളുടെ പോസ്റ്റിന് ഒരു തലക്കെട്ട് നൽകുക", desc_ph: "ഈ അപ്‌ഡേറ്റിനെക്കുറിച്ചുള്ള വിശദാംശങ്ങൾ എഴുതുക...", loc_ph: "വാർഡ് അല്ലെങ്കിൽ പ്രദേശത്തിന്റെ പേര് നൽകുക", anon_title: "അജ്ഞാതമായി പോസ്റ്റ് ചെയ്യുക", anon_sub: "നിങ്ങളുടെ പേരും ഫോട്ടോയും മറയ്ക്കുക", submit: "പോസ്റ്റ് പങ്കിടുക", publishing: "മീഡിയ അപ്‌ലോഡ് ചെയ്യുന്നു...", err_media: "ദയവായി ഒരു മീഡിയ ഫയൽ തിരഞ്ഞെടുക്കുക.", err_fields: "ദയവായി ആവശ്യമായ എല്ലാ ഫീൽഡുകളും പൂരിപ്പിക്കുക." },
        bn: { header: "পোস্ট তৈরি করুন", media_box: "ছবি বা ভিডিও নির্বাচন করুন", title_ph: "আপনার পোস্টের একটি শিরোনাম দিন", desc_ph: "এই আপডেট সম্পর্কে বিস্তারিত লিখুন...", loc_ph: "ওয়ার্ড বা এলাকার নাম লিখুন", anon_title: "বেনামে পোস্ট করুন", anon_sub: "আপনার নাম এবং ছবি লুকান", submit: "পোস্ট শেয়ার করুন", publishing: "মিডিয়া আপলোড হচ্ছে...", err_media: "অনুগ্রহ করে একটি মিডিয়া ফাইল নির্বাচন করুন।", err_fields: "সমস্ত প্রয়োজনীয় ক্ষেত্র পূরণ করুন।" },
        pa: { header: "ਪੋਸਟ ਬਣਾਓ", media_box: "ਫੋਟੋ ਜਾਂ ਵੀਡੀਓ ਚੁਣੋ", title_ph: "ਆਪਣੀ ਪੋਸਟ ਨੂੰ ਇੱਕ ਸਿਰਲੇਖ ਦਿਓ", desc_ph: "ਇਸ ਅੱਪਡੇਟ ਬਾਰੇ ਵੇਰਵੇ ਲਿਖੋ...", loc_ph: "ਵਾਰਡ ਜਾਂ ਖੇਤਰ ਦਾ ਨਾਮ ਦਰਜ ਕਰੋ", anon_title: "ਅਗਿਆਤ ਰੂਪ ਵਿੱਚ ਪੋਸਟ ਕਰੋ", anon_sub: "ਆਪਣਾ ਨਾਮ ਅਤੇ ਫੋਟੋ ਲੁਕਾਓ", submit: "ਪੋਸਟ ਸਾਂਝੀ ਕਰੋ", publishing: "ਮੀਡੀਆ ਅੱਪਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...", err_media: "ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਮੀਡੀਆ ਫਾਈਲ ਚੁਣੋ।", err_fields: "ਕਿਰਪਾ ਕਰਕੇ ਸਾਰੇ ਲੋੜੀਂਦੇ ਖੇਤਰ ਭਰੋ।" },
        or: { header: "ପୋଷ୍ଟ ସୃଷ୍ଟି କରନ୍ତୁ", media_box: "ଫଟୋ କିମ୍ବା ଭିଡିଓ ଚୟନ କରନ୍ତୁ", title_ph: "ଆପଣଙ୍କ ପୋଷ୍ଟକୁ ଏକ ଶୀର୍ଷକ ଦିଅନ୍ତୁ", desc_ph: "ଏହି ଅପଡେଟ୍ ବିଷୟରେ ବିବରଣୀ ଲେଖନ୍ତୁ...", loc_ph: "ୱାର୍ଡ କିମ୍ବା ଅଞ୍ଚଳ ନାମ ପ୍ରବେଶ କରନ୍ତୁ", anon_title: "ଅଜ୍ଞାତ ଭାବରେ ପୋଷ୍ଟ କରନ୍ତୁ", anon_sub: "ଆପଣଙ୍କ ନାମ ଏବଂ ଫଟୋ ଲୁଚାନ୍ତୁ", submit: "ପୋଷ୍ଟ ଅଂଶୀଦାର କରନ୍ତୁ", publishing: "ମିଡିଆ ଅପଲୋଡ୍ ହେଉଛି...", err_media: "ଦୟାକରି ଏକ ମିଡିଆ ଫାଇଲ୍ ଚୟନ କରନ୍ତୁ।", err_fields: "ଦୟାକରି ସମସ୍ତ ଆବଶ୍ୟକୀୟ କ୍ଷେତ୍ର ପୂରଣ କରନ୍ତୁ।" },
        as: { header: "পোষ্ট সৃষ্টি কৰক", media_box: "ফটো বা ভিডিঅ' বাছনি কৰক", title_ph: "আপোনাৰ পোষ্টৰ এটা শিৰোনাম দিয়ক", desc_ph: "এই আপডেটৰ বিষয়ে বিৱৰণ লিখক...", loc_ph: "ৱাৰ্ড বা অঞ্চলৰ নাম লিখক", anon_title: "বেনামীভাৱে পোষ্ট কৰক", anon_sub: "আপোনাৰ নাম আৰু ফটো লুকুৱাওক", submit: "পোষ্ট শ্বেয়াৰ কৰক", publishing: "মিডিয়া আপলোড হৈ আছে...", err_media: "অনুগ্ৰহ কৰি এটা মিডিয়া ফাইল বাছনি কৰক।", err_fields: "অনুগ্ৰহ কৰি সকলো প্ৰয়োজনীয় তথ্য পূৰণ কৰক।" },
        ur: { header: "پوسٹ بنائیں", media_box: "تصویر یا ویڈیو منتخب کریں", title_ph: "اپنی پوسٹ کو ایک عنوان دیں", desc_ph: "اس اپ ڈیٹ کی تفصیلات لکھیں...", loc_ph: "وارڈ یا علاقے کا نام درج کریں", anon_title: "گمنام طور پر پوسٹ کریں", anon_sub: "اپنا نام اور تصویر چھپائیں", submit: "پوسٹ شیئر کریں", publishing: "میڈیا اپ لوڈ ہو رہا ہے...", err_media: "براہ کرم میڈیا فائل منتخب کریں۔", err_fields: "براہ کرم تمام مطلوبہ خانے پر کریں۔" },
        bho: { header: "पोस्ट बनाईं", media_box: "फोटो या वीडियो चुनीं", title_ph: "अपन पोस्ट के एगो शीर्षक दीं", desc_ph: "एह अपडेट के बारे में विवरण लिखीं...", loc_ph: "वार्ड या इलाका के नाम लिखीं", anon_title: "गुमनाम पोस्ट करीं", anon_sub: "अपन नाम आ फोटो छिपाईं", submit: "पोस्ट साझा करीं", publishing: "मीडिया अपलोड हो रहल बा...", err_media: "कृपया एगो मीडिया फाइल चुनीं।", err_fields: "कृपया सब जरूरी जानकारी भरीं।" }
    };

    const currentT = t[lang] || t['en'];

    // Handle File Selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setErrorMessage('');
        setSelectedFile(file);

        if (file.type.startsWith('video/')) {
            setMediaType('video');
        } else {
            setMediaType('image');
        }

        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);
    };

    // Remove Selected Media
    const handleRemoveMedia = () => {
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Form Submission & Upload Handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!selectedFile) {
            setErrorMessage(currentT.err_media);
            return;
        }

        if (!title.trim() || !description.trim()) {
            setErrorMessage(currentT.err_fields);
            return;
        }

        setIsSubmitting(true);

        try {
            const currentUser = auth.currentUser;
            const userId = currentUser ? currentUser.uid : 'guest';
            const userDisplayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Citizen';

            // Step 1: Upload media to external Hugging Face PocketBase instance
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('user_id', userId);
            formData.append('post_id', 'pending');
            formData.append('is_anonymous', isAnonymous ? 'true' : 'false');

            const pbResponse = await fetch('https://movyra-mv-main-db-gradio.hf.space/api/collections/posts_media/records', {
                method: 'POST',
                body: formData
            });

            if (!pbResponse.ok) {
                throw new Error("External storage upload failed.");
            }

            const pbRecord = await pbResponse.json();
            const mediaUrl = `https://movyra-mv-main-db-gradio.hf.space/api/files/${pbRecord.collectionId}/${pbRecord.id}/${pbRecord.file}`;

            // Step 2: Write metadata to Firestore collection
            await addDoc(collection(db, 'nagrik_reels'), {
                authorId: userId,
                authorName: isAnonymous ? 'Hidden Citizen' : userDisplayName,
                title: title.trim(),
                description: description.trim(),
                location: location.trim() || 'Local Area',
                mediaUrl: mediaUrl,
                type: mediaType,
                isAnonymous: isAnonymous,
                likes: 0,
                createdAt: serverTimestamp()
            });

            navigate('/feed');
        } catch (err) {
            console.error("Submission failed:", err);
            setErrorMessage("Failed to publish post. Please verify your connection.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFFFFF] font-sans text-[#111111] pb-16">
            
            {/* Header */}
            <div className="sticky top-0 z-30 bg-[#FFFFFF] border-b border-[#111111]/10 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="outline-none active:scale-95 transition-transform">
                        <ChevronLeft size={28} className="text-[#111111]" strokeWidth={2.5} />
                    </button>
                    <span className="font-black text-[1.2rem] tracking-tight">{currentT.header}</span>
                </div>
            </div>

            {/* Form Content */}
            <div className="max-w-[600px] mx-auto p-4 flex flex-col gap-5">
                
                {errorMessage && (
                    <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm font-bold rounded-xl">
                        {errorMessage}
                    </div>
                )}

                {/* Media Selector Box */}
                {!previewUrl ? (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-[4/3] bg-[#F9FAFB] border-2 border-dashed border-[#111111]/20 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#00897B] transition-colors p-6 text-center"
                    >
                        <div className="w-14 h-14 rounded-full bg-[#00897B]/10 flex items-center justify-center text-[#00897B]">
                            <UploadCloud size={28} strokeWidth={2} />
                        </div>
                        <span className="font-bold text-[0.95rem] text-[#111111]">{currentT.media_box}</span>
                        <span className="text-[0.75rem] font-medium text-[#111111]/50">JPG, PNG, WEBP, MP4 (Max 50MB)</span>
                    </div>
                ) : (
                    <div className="w-full aspect-[4/3] bg-[#111111] rounded-2xl relative overflow-hidden flex items-center justify-center">
                        {mediaType === 'image' ? (
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <video src={previewUrl} controls className="w-full h-full object-cover" />
                        )}
                        <button 
                            type="button" 
                            onClick={handleRemoveMedia} 
                            className="absolute top-3 right-3 w-8 h-8 bg-[#111111]/80 text-[#FFFFFF] rounded-full flex items-center justify-center outline-none shadow-md"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}

                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/jpeg,image/png,image/webp,video/mp4" 
                    className="hidden" 
                />

                {/* Form Fields */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    
                    <input 
                        type="text" 
                        placeholder={currentT.title_ph} 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        required 
                        className="w-full bg-[#F9FAFB] border border-[#111111]/15 rounded-xl p-3.5 text-[0.95rem] font-bold outline-none focus:border-[#00897B]" 
                    />

                    <textarea 
                        placeholder={currentT.desc_ph} 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        required 
                        className="w-full bg-[#F9FAFB] border border-[#111111]/15 rounded-xl p-3.5 text-[0.95rem] font-medium outline-none focus:border-[#00897B] min-h-[110px]" 
                    />

                    <div className="relative w-full">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#111111]/40">
                            <MapPin size={18} />
                        </div>
                        <input 
                            type="text" 
                            placeholder={currentT.loc_ph} 
                            value={location} 
                            onChange={(e) => setLocation(e.target.value)} 
                            className="w-full bg-[#F9FAFB] border border-[#111111]/15 rounded-xl py-3.5 pl-10 pr-3.5 text-[0.95rem] font-medium outline-none focus:border-[#00897B]" 
                        />
                    </div>

                    {/* Anonymous Toggle */}
                    <div 
                        onClick={() => setIsAnonymous(!isAnonymous)}
                        className={`w-full p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${isAnonymous ? 'bg-[#111111] border-[#111111] text-[#FFFFFF]' : 'bg-[#F9FAFB] border-[#111111]/15 text-[#111111]'}`}
                    >
                        <div className="flex items-center gap-3">
                            {isAnonymous ? <EyeOff size={22} className="text-[#FFB300]" /> : <Eye size={22} className="text-[#111111]/60" />}
                            <div className="flex flex-col">
                                <span className="font-black text-[0.9rem] leading-tight">{currentT.anon_title}</span>
                                <span className={`text-[0.75rem] ${isAnonymous ? 'text-[#FFFFFF]/70' : 'text-[#111111]/50'}`}>{currentT.anon_sub}</span>
                            </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${isAnonymous ? 'bg-[#FFB300] border-[#FFB300] text-[#111111]' : 'border-[#111111]/30'}`}>
                            {isAnonymous && <CheckCircle size={16} strokeWidth={3} />}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="w-full bg-[#00897B] text-[#FFFFFF] font-black py-4 rounded-xl mt-2 active:scale-95 transition-transform disabled:opacity-50 tracking-wide uppercase text-sm shadow-md"
                    >
                        {isSubmitting ? currentT.publishing : currentT.submit}
                    </button>
                </form>
            </div>
        </div>
    );
}