/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: Official Marketing Landing & App Showcase Page for NagrikSetu.
 * Brand: Movyra Civic (NagrikSetu)
 *
 * SYSTEM COLORS REFERENCE (STRICT):
 * Primary Background: #00897B (Civic Teal)
 * Dark Text: #111111 (Deep Black)
 * Containers: #FFFFFF (Pure White)
 * Highlight CTA: #FFB300 (Action Yellow)
 * Success: #2E7D32 (Success Green)
 * Emergency: #D32F2F (Emergency Red)
 * Information: #1565C0 (Information Blue)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldCheck, BarChart3, MapPin, ArrowRight, ArrowUp, Activity, 
    Smartphone, Users, X, Globe, AlertTriangle, FileText, Megaphone, 
    Star, Phone, TrendingUp
} from 'lucide-react';

const TRANSLATIONS = {
    en: {
        lang: "English", products: "Products", careers: "Careers", coming_soon: "Coming Soon",
        badge: "Smart Civic Platform",
        hero_title: "Empowering Citizens, Connecting Communities.",
        hero_desc: "A trusted and simple platform to report local issues, track public repairs, and manage your city in real time.",
        cta_btn: "Download Application",
        val_title: "Why Choose NagrikSetu?", val_desc: "Built for speed, transparency, and simple tracking.",
        f1_t: "Report Issues", f1_d: "Easily report local civic problems directly to authorities.",
        f2_t: "Track Progress", f2_d: "See the status of current repairs in real time.",
        f3_t: "Emergency Help", f3_d: "Get fast support during critical situations.",
        f4_t: "Live Updates", f4_d: "Stay informed about your local area with official notices.",
        stat_title: "Clear Transparency.", stat_desc: "View city performance instantly. Track total reports and resolution speed without complex menus.",
        work_title: "How It Works", 
        w1_t: "Report", w1_d: "Tell us the problem.", w2_t: "Assign", w2_d: "Sent to the right team.", w3_t: "Resolve", w3_d: "Work gets completed.",
        mob_title: "Access Anywhere.", mob_desc: "Report issues on the go. Our platform is fully optimized for smartphones, ensuring you can manage tasks from anywhere.",
        imp_title: "Better Cities Together.", imp_desc: "Join thousands of citizens working in harmony. A unified network ensures faster resolutions for everyone.",
        footer_text: "NagrikSetu by Movyra Civic", select_lang: "Select Language", built_by: "Built by"
    },
    hi: {
        lang: "हिन्दी", products: "उत्पाद", careers: "करियर", coming_soon: "जल्द आ रहा है",
        badge: "स्मार्ट नागरिक मंच",
        hero_title: "नागरिकों को सशक्त बनाना, समुदायों को जोड़ना।",
        hero_desc: "स्थानीय समस्याओं की रिपोर्ट करने और सार्वजनिक सुधारों को ट्रैक करने के लिए एक विश्वसनीय और सरल मंच।",
        cta_btn: "एप्लिकेशन डाउनलोड करें",
        val_title: "नागरिकसेतु क्यों चुनें?", val_desc: "गति, पारदर्शिता और आसान ट्रैकिंग के लिए बनाया गया।",
        f1_t: "समस्याएं दर्ज करें", f1_d: "स्थानीय नागरिक समस्याओं की सीधे अधिकारियों को रिपोर्ट करें।",
        f2_t: "प्रगति देखें", f2_d: "वर्तमान सुधारों की स्थिति वास्तविक समय में देखें।",
        f3_t: "आपातकालीन मदद", f3_d: "गंभीर स्थितियों के दौरान तेजी से सहायता प्राप्त करें।",
        f4_t: "लाइव अपडेट", f4_d: "आधिकारिक सूचनाओं के साथ अपने क्षेत्र के बारे में सूचित रहें।",
        stat_title: "स्पष्ट पारदर्शिता।", stat_desc: "शहर के प्रदर्शन को तुरंत देखें। समाधान की गति को ट्रैक करें।",
        work_title: "यह कैसे काम करता है", 
        w1_t: "रिपोर्ट", w1_d: "समस्या बताएं।", w2_t: "सौंपें", w2_d: "सही टीम को भेजा गया।", w3_t: "समाधान", w3_d: "काम पूरा हो जाता है।",
        mob_title: "कहीं भी पहुँचें।", mob_desc: "चलते-फिरते समस्याओं की रिपोर्ट करें। स्मार्टफ़ोन के लिए पूरी तरह से अनुकूलित।",
        imp_title: "एक साथ बेहतर शहर।", imp_desc: "हजारों नागरिकों से जुड़ें। एक नेटवर्क तेज समाधान सुनिश्चित करता है।",
        footer_text: "मोविरा सिविक द्वारा नागरिकसेतु", select_lang: "भाषा चुनें", built_by: "निर्मित"
    },
    hinglish: {
        lang: "Hinglish", products: "Products", careers: "Careers", coming_soon: "Coming Soon",
        badge: "Smart Civic Platform",
        hero_title: "Citizens ko empower karna, communities ko jodna.",
        hero_desc: "Local issues report karne aur public repairs track karne ka trusted aur simple platform.",
        cta_btn: "Application Download Karein",
        val_title: "NagrikSetu kyun chunein?", val_desc: "Speed, transparency, aur easy tracking ke liye bana.",
        f1_t: "Issues Report Karein", f1_d: "Local civic problems ko directly authorities tak pahunchayein.",
        f2_t: "Progress Track Karein", f2_d: "Current repairs ka status real time mein dekhein.",
        f3_t: "Emergency Help", f3_d: "Critical situations mein fast support paayein.",
        f4_t: "Live Updates", f4_d: "Official notices ke sath apne area ke baare mein update rahein.",
        stat_title: "Clear Transparency.", stat_desc: "City performance turant dekhein. Resolution speed track karein.",
        work_title: "Yeh kaise kaam karta hai", 
        w1_t: "Report", w1_d: "Problem batayein.", w2_t: "Assign", w2_d: "Sahi team ko bheja gaya.", w3_t: "Resolve", w3_d: "Kaam poora hota hai.",
        mob_title: "Kahin se bhi access karein.", mob_desc: "Chalte-phirte issues report karein. Smartphones ke liye fully optimized.",
        imp_title: "Ek sath behtar shehar.", imp_desc: "Hazaron citizens se judein. Ek network fast resolution ensure karta hai.",
        footer_text: "NagrikSetu by Movyra Civic", select_lang: "Language Select Karein", built_by: "Built by"
    },
    mr: {
        lang: "मराठी", products: "उत्पादने", careers: "करिअर", coming_soon: "लवकरच येत आहे",
        badge: "स्मार्ट नागरी व्यासपीठ",
        hero_title: "नागरिकांना सक्षम करणे, समुदायांना जोडणे.",
        hero_desc: "स्थानिक समस्या नोंदवण्यासाठी आणि सार्वजनिक दुरुस्तीचा मागोवा घेण्यासाठी एक विश्वसनीय आणि सोपे व्यासपीठ.",
        cta_btn: "ॲप्लिकेशन डाउनलोड करा",
        val_title: "नागरिकसेतू का निवडावे?", val_desc: "वेग, पारदर्शकता आणि सोप्या ट्रॅकिंगसाठी बनवलेले.",
        f1_t: "समस्या नोंदवा", f1_d: "स्थानिक नागरी समस्यांची थेट अधिकाऱ्यांना सहजपणे तक्रार करा.",
        f2_t: "प्रगती पहा", f2_d: "सध्याच्या दुरुस्तीची स्थिती रिअल टाइममध्ये पहा.",
        f3_t: "आपत्कालीन मदत", f3_d: "गंभीर परिस्थितीत जलद मदत मिळवा.",
        f4_t: "थेट अपडेट्स", f4_d: "अधिकृत सूचनांसह तुमच्या स्थानिक क्षेत्राबद्दल माहिती मिळवा.",
        stat_title: "स्पष्ट पारदर्शकता.", stat_desc: "शहराची कामगिरी त्वरित पहा. सोडवण्याचा वेग ट्रॅक करा.",
        work_title: "हे कसे काम करते", 
        w1_t: "रिपोर्ट", w1_d: "समस्या सांगा.", w2_t: "असाइन", w2_d: "योग्य टीमकडे पाठवले.", w3_t: "निराकरण", w3_d: "काम पूर्ण होते.",
        mob_title: "कुठूनही प्रवेश करा.", mob_desc: "चालता-फिरता समस्यांची नोंद करा. स्मार्टफोन्ससाठी पूर्णपणे अनुकूलित.",
        imp_title: "एकत्रित उत्तम शहरे.", imp_desc: "हजारो नागरिकांमध्ये सामील व्हा. एक नेटवर्क जलद निराकरण सुनिश्चित करते.",
        footer_text: "मोविरा सिविक द्वारे नागरिकसेतू", select_lang: "भाषा निवडा", built_by: "निर्मित"
    },
    gu: {
        lang: "ગુજરાતી", products: "ઉત્પાદનો", careers: "કારકિર્દી", coming_soon: "ટૂંક સમયમાં આવી રહ્યું છે",
        badge: "સ્માર્ટ નાગરિક પ્લેટફોર્મ",
        hero_title: "નાગરિકોને સશક્તિકરણ, સમુદાયોને જોડવા.",
        hero_desc: "સ્થાનિક સમસ્યાઓ જણાવવા અને જાહેર સમારકામ જોવા માટે વિશ્વસનીય અને સરળ પ્લેટફોર્મ.",
        cta_btn: "એપ્લિકેશન ડાઉનલોડ કરો",
        val_title: "નાગરિકસેતુ શા માટે પસંદ કરો?", val_desc: "ઝડપ, પારદર્શિતા અને સરળ ટ્રેકિંગ માટે બનાવેલ.",
        f1_t: "સમસ્યાઓ નોંધાવો", f1_d: "સ્થાનિક નાગરિક સમસ્યાઓની સીધી સત્તાવાળાઓને સરળતાથી જાણ કરો.",
        f2_t: "પ્રગતિ જુઓ", f2_d: "વર્તમાન સમારકામની સ્થિતિ વાસ્તવિક સમયમાં જુઓ.",
        f3_t: "કટોકટી મદદ", f3_d: "ગંભીર પરિસ્થિતિઓ દરમિયાન ઝડપી આધાર મેળવો.",
        f4_t: "લાઇવ અપડેટ્સ", f4_d: "સત્તાવાર સૂચનાઓ સાથે તમારા સ્થાનિક વિસ્તાર વિશે માહિતગાર રહો.",
        stat_title: "સ્પષ્ટ પારદર્શિતા.", stat_desc: "શહેરનું પ્રદર્શન તરત જ જુઓ. ઉકેલની ઝડપને ટ્રૅક કરો.",
        work_title: "તે કેવી રીતે કામ કરે છે", 
        w1_t: "રિપોર્ટ", w1_d: "સમસ્યા જણાવો.", w2_t: "સોંપો", w2_d: "યોગ્ય ટીમને મોકલવામાં આવ્યું.", w3_t: "ઉકેલો", w3_d: "કામ પૂર્ણ થાય છે.",
        mob_title: "ગમે ત્યાંથી ઍક્સેસ કરો.", mob_desc: "સફરમાં સમસ્યાઓની જાણ કરો. સ્માર્ટફોન માટે સંપૂર્ણપણે ઑપ્ટિમાઇઝ.",
        imp_title: "એકસાથે વધુ સારા શહેરો.", imp_desc: "હજારો નાગરિકો સાથે જોડાઓ. એક નેટવર્ક ઝડપી ઉકેલની ખાતરી કરે છે.",
        footer_text: "મોવિરા સિવિક દ્વારા નાગરિકસેતુ", select_lang: "ભાષા પસંદ કરો", built_by: "દ્વારા બનાવવામાં"
    },
    te: {
        lang: "తెలుగు", products: "ఉత్పత్తులు", careers: "కెరీర్స్", coming_soon: "త్వరలో వస్తుంది",
        badge: "స్మార్ట్ సివిక్ ప్లాట్‌ఫారమ్",
        hero_title: "పౌరుల సాధికారత, సంఘాల అనుసంధానం.",
        hero_desc: "స్థానిక సమస్యలను నివేదించడానికి మరియు ప్రజా మరమ్మతులను ట్రాక్ చేయడానికి నమ్మకమైన మరియు సరళమైన వేదిక.",
        cta_btn: "అప్లికేషన్ డౌన్‌లోడ్ చేయండి",
        val_title: "నాగ్రిక్‌సేతును ఎందుకు ఎంచుకోవాలి?", val_desc: "వేగం, పారదర్శకత మరియు సులభమైన ట్రాకింగ్ కోసం నిర్మించబడింది.",
        f1_t: "సమస్యలను నివేదించండి", f1_d: "స్థానిక పౌర సమస్యలను నేరుగా అధికారులకు సులభంగా నివేదించండి.",
        f2_t: "పురోగతిని చూడండి", f2_d: "ప్రస్తుత మరమ్మతుల స్థితిని నిజ సమయంలో చూడండి.",
        f3_t: "అత్యవసర సహాయం", f3_d: "క్లిష్ట పరిస్థితుల్లో వేగవంతమైన మద్దతు పొందండి.",
        f4_t: "ప్రత్యక్ష నవీకరణలు", f4_d: "అధికారిక నోటీసులతో మీ స్థానిక ప్రాంతం గురించి తెలుసుకోండి.",
        stat_title: "స్పష్టమైన పారదర్శకత.", stat_desc: "నగర పనితీరును తక్షణమే చూడండి. రిజల్యూషన్ వేగాన్ని ట్రాక్ చేయండి.",
        work_title: "ఇది ఎలా పనిచేస్తుంది", 
        w1_t: "నివేదించు", w1_d: "సమస్యను చెప్పండి.", w2_t: "కేటాయించు", w2_d: "సరైన బృందానికి పంపబడింది.", w3_t: "పరిష్కరించు", w3_d: "పని పూర్తవుతుంది.",
        mob_title: "ఎక్కడి నుండైనా యాక్సెస్ చేయండి.", mob_desc: "ప్రయాణంలో సమస్యలను నివేదించండి. స్మార్ట్‌ఫోన్‌ల కోసం పూర్తిగా ఆప్టిమైజ్ చేయబడింది.",
        imp_title: "కలిసి మెరుగైన నగరాలు.", imp_desc: "వేలాది మంది పౌరులతో చేరండి. ఒక నెట్‌వర్క్ వేగవంతమైన పరిష్కారాన్ని నిర్ధారిస్తుంది.",
        footer_text: "మోవిరా సివిక్ ద్వారా నాగ్రిక్‌సేతు", select_lang: "భాషను ఎంచుకోండి", built_by: "నిర్మించినవారు"
    },
    ta: {
        lang: "தமிழ்", products: "தயாரிப்புகள்", careers: "தொழில்கள்", coming_soon: "விரைவில்",
        badge: "ஸ்மார்ட் குடிமக்கள் தளம்",
        hero_title: "குடிமக்களுக்கு அதிகாரமளித்தல், சமூகங்களை இணைத்தல்.",
        hero_desc: "உள்ளூர் பிரச்சனைகளைப் புகாரளிக்க மற்றும் பொது பழுதுகளைக் கண்காணிக்க நம்பகமான மற்றும் எளிமையான தளம்.",
        cta_btn: "பயன்பாட்டைப் பதிவிறக்கவும்",
        val_title: "நாகரிக் சேதுவை ஏன் தேர்வு செய்ய வேண்டும்?", val_desc: "வேகம், வெளிப்படைத்தன்மை மற்றும் எளிதான கண்காணிப்பிற்காக உருவாக்கப்பட்டது.",
        f1_t: "பிரச்சனைகளைப் புகாரளிக்கவும்", f1_d: "உள்ளூர் குடிமக்கள் பிரச்சினைகளை அதிகாரிகளிடம் எளிதாகப் புகாரளிக்கவும்.",
        f2_t: "முன்னேற்றத்தைப் பார்க்கவும்", f2_d: "தற்போதைய பழுதுகளின் நிலையை உண்மையான நேரத்தில் பார்க்கவும்.",
        f3_t: "அவசர உதவி", f3_d: "நெருக்கடியான சூழ்நிலைகளில் விரைவான ஆதரவைப் பெறுங்கள்.",
        f4_t: "நேரடி புதுப்பிப்புகள்", f4_d: "அதிகாரப்பூர்வ அறிவிப்புகளுடன் உங்கள் உள்ளூர் பகுதியைப் பற்றி தெரிந்து கொள்ளுங்கள்.",
        stat_title: "தெளிவான வெளிப்படைத்தன்மை.", stat_desc: "நகர செயல்திறனை உடனடியாகப் பார்க்கவும். தீர்வு வேகத்தைக் கண்காணிக்கவும்.",
        work_title: "இது எப்படி வேலை செய்கிறது", 
        w1_t: "அறிக்கை", w1_d: "பிரச்சனையை சொல்லுங்கள்.", w2_t: "ஒதுக்கு", w2_d: "சரியான குழுவிற்கு அனுப்பப்பட்டது.", w3_t: "தீர்வு", w3_d: "பணி முடிவடைகிறது.",
        mob_title: "எங்கிருந்தும் அணுகலாம்.", mob_desc: "பயணத்தின்போது சிக்கல்களைப் புகாரளிக்கவும். ஸ்மார்ட்போன்களுக்கு முழுமையாக உகந்ததாக உள்ளது.",
        imp_title: "ஒன்றாக சிறந்த நகரங்கள்.", imp_desc: "ஆயிரக்கணக்கான குடிமக்களுடன் இணையுங்கள். ஒரு நெட்வொர்க் விரைவான தீர்வை உறுதி செய்கிறது.",
        footer_text: "மோவிரா சிவிக் மூலம் நாகரிக் சேது", select_lang: "மொழியைத் தேர்ந்தெடுக்கவும்", built_by: "உருவாக்கியவர்"
    },
    kn: {
        lang: "ಕನ್ನಡ", products: "ಉತ್ಪನ್ನಗಳು", careers: "ವೃತ್ತಿಜೀವನ", coming_soon: "ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ",
        badge: "ಸ್ಮಾರ್ಟ್ ಸಿವಿಕ್ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್",
        hero_title: "ನಾಗರಿಕರ ಸಬಲೀಕರಣ, ಸಮುದಾಯಗಳ ಸಂಪರ್ಕ.",
        hero_desc: "ಸ್ಥಳೀಯ ಸಮಸ್ಯೆಗಳನ್ನು ವರದಿ ಮಾಡಲು ಮತ್ತು ಸಾರ್ವಜನಿಕ ದುರಸ್ತಿಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ವಿಶ್ವಾಸಾರ್ಹ ವೇದಿಕೆ.",
        cta_btn: "ಅಪ್ಲಿಕೇಶನ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
        val_title: "ನಾಗರಿಕ್‌ಸೇತು ಏಕೆ ಆರಿಸಬೇಕು?", val_desc: "ವೇಗ, ಪಾರದರ್ಶಕತೆ ಮತ್ತು ಸುಲಭ ಟ್ರ್ಯಾಕಿಂಗ್‌ಗಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ.",
        f1_t: "ಸಮಸ್ಯೆಗಳನ್ನು ವರದಿ ಮಾಡಿ", f1_d: "ಸ್ಥಳೀಯ ನಾಗರಿಕ ಸಮಸ್ಯೆಗಳನ್ನು ನೇರವಾಗಿ ಅಧಿಕಾರಿಗಳಿಗೆ ಸುಲಭವಾಗಿ ವರದಿ ಮಾಡಿ.",
        f2_t: "ಪ್ರಗತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ", f2_d: "ಪ್ರಸ್ತುತ ರಿಪೇರಿಗಳ ಸ್ಥಿತಿಯನ್ನು ನೈಜ ಸಮಯದಲ್ಲಿ ನೋಡಿ.",
        f3_t: "ತುರ್ತು ಸಹಾಯ", f3_d: "ನಿರ್ಣಾಯಕ ಸಂದರ್ಭಗಳಲ್ಲಿ ವೇಗವಾಗಿ ಬೆಂಬಲ ಪಡೆಯಿರಿ.",
        f4_t: "ಲೈವ್ ಅಪ್‌ಡೇಟ್‌ಗಳು", f4_d: "ಅಧಿಕೃತ ಸೂಚನೆಗಳೊಂದಿಗೆ ನಿಮ್ಮ ಸ್ಥಳೀಯ ಪ್ರದೇಶದ ಬಗ್ಗೆ ಮಾಹಿತಿ ಪಡೆಯಿರಿ.",
        stat_title: "ಸ್ಪಷ್ಟ ಪಾರದರ್ಶಕತೆ.", stat_desc: "ನಗರದ ಕಾರ್ಯಕ್ಷಮತೆಯನ್ನು ತಕ್ಷಣ ನೋಡಿ. ಪರಿಹಾರದ ವೇಗವನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.",
        work_title: "ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ", 
        w1_t: "ವರದಿ", w1_d: "ಸಮಸ್ಯೆಯನ್ನು ಹೇಳಿ.", w2_t: "ನಿಯೋಜಿಸಿ", w2_d: "ಸರಿಯಾದ ತಂಡಕ್ಕೆ ಕಳುಹಿಸಲಾಗಿದೆ.", w3_t: "ಪರಿಹರಿಸಿ", w3_d: "ಕೆಲಸ ಪೂರ್ಣಗೊಳ್ಳುತ್ತದೆ.",
        mob_title: "ಎಲ್ಲಿಂದಲಾದರೂ ಪ್ರವೇಶಿಸಿ.", mob_desc: "ಪ್ರಯಾಣದಲ್ಲಿರುವಾಗ ಸಮಸ್ಯೆಗಳನ್ನು ವರದಿ ಮಾಡಿ. ಸ್ಮಾರ್ಟ್‌ಫೋನ್‌ಗಳಿಗಾಗಿ ಹೊಂದುವಂತೆ ಮಾಡಲಾಗಿದೆ.",
        imp_title: "ಒಟ್ಟಿಗೆ ಉತ್ತಮ ನಗರಗಳು.", imp_desc: "ಸಾವಿರಾರು ನಾಗರಿಕರೊಂದಿಗೆ ಸೇರಿ. ಒಂದು ನೆಟ್‌ವರ್ಕ್ ತ್ವರಿತ ಪರಿಹಾರವನ್ನು ಖಚಿತಪಡಿಸುತ್ತದೆ.",
        footer_text: "ಮೊವಿರಾ ಸಿವಿಕ್ ಅವರಿಂದ ನಾಗರಿಕ್‌ಸೇತು", select_lang: "ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ", built_by: "ನಿರ್ಮಿಸಿದವರು"
    },
    ml: {
        lang: "മലയാളം", products: "ഉൽപ്പന്നങ്ങൾ", careers: "കരിയർ", coming_soon: "ഉടൻ വരുന്നു",
        badge: "സ്മാർട്ട് സിവിക് പ്ലാറ്റ്ഫോം",
        hero_title: "പൗരന്മാരെ ശാക്തീകരിക്കുന്നു, കമ്മ്യൂണിറ്റികളെ ബന്ധിപ്പിക്കുന്നു.",
        hero_desc: "പ്രാദേശിക പ്രശ്നങ്ങൾ റിപ്പോർട്ട് ചെയ്യാനും പൊതു അറ്റകുറ്റപ്പണികൾ ട്രാക്ക് ചെയ്യാനുമുള്ള വിശ്വസനീയമായ പ്ലാറ്റ്ഫോം.",
        cta_btn: "ആപ്ലിക്കേഷൻ ഡൗൺലോഡ് ചെയ്യുക",
        val_title: "എന്തുകൊണ്ട് നാഗരിക് സേതു?", val_desc: "വേഗത, സുതാര്യത, എളുപ്പത്തിലുള്ള ട്രാക്കിംഗ് എന്നിവയ്ക്കായി നിർമ്മിച്ചത്.",
        f1_t: "പ്രശ്നങ്ങൾ റിപ്പോർട്ട് ചെയ്യുക", f1_d: "പ്രാദേശിക സിവിക് പ്രശ്നങ്ങൾ നേരിട്ട് അധികാരികളെ എളുപ്പത്തിൽ അറിയിക്കുക.",
        f2_t: "പുരോഗതി ട്രാക്ക് ചെയ്യുക", f2_d: "നിലവിലെ അറ്റകുറ്റപ്പണികളുടെ നില തത്സമയം കാണുക.",
        f3_t: "അടിയന്തര സഹായം", f3_d: "നിർണായക സാഹചര്യങ്ങളിൽ വേഗത്തിലുള്ള പിന്തുണ നേടുക.",
        f4_t: "തത്സമയ അപ്‌ഡേറ്റുകൾ", f4_d: "ഔദ്യോഗിക അറിയിപ്പുകൾ ഉപയോഗിച്ച് നിങ്ങളുടെ പ്രദേശത്തെക്കുറിച്ച് അറിയുക.",
        stat_title: "വ്യക്തമായ സുതാര്യത.", stat_desc: "നഗരത്തിന്റെ പ്രകടനം തൽക്ഷണം കാണുക. പരിഹാര വേഗത ട്രാക്ക് ചെയ്യുക.",
        work_title: "ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു", 
        w1_t: "റിപ്പോർട്ട്", w1_d: "പ്രശ്നം പറയുക.", w2_t: "ചുമതലപ്പെടുത്തുക", w2_d: "ശരിയായ ടീമിന് അയച്ചു.", w3_t: "പരിഹരിക്കുക", w3_d: "ജോലി പൂർത്തിയാകുന്നു.",
        mob_title: "എവിടെനിന്നും ആക്സസ് ചെയ്യുക.", mob_desc: "യാത്രയ്ക്കിടയിൽ പ്രശ്നങ്ങൾ റിപ്പോർട്ട് ചെയ്യുക. സ്മാർട്ട്ഫോണുകൾക്കായി ഒപ്റ്റിമൈസ് ചെയ്തു.",
        imp_title: "ഒരുമിച്ച് മികച്ച നഗരങ്ങൾ.", imp_desc: "ആയിരക്കണക്കിന് പൗരന്മാർക്കൊപ്പം ചേരുക. ഒരു നെറ്റ്‌വർക്ക് വേഗത്തിലുള്ള പരിഹാരം ഉറപ്പാക്കുന്നു.",
        footer_text: "മോവിറ സിവിക് നൽകുന്ന നാഗരിക് സേതു", select_lang: "ഭാഷ തിരഞ്ഞെടുക്കുക", built_by: "നിർമ്മിച്ചത്"
    },
    bn: {
        lang: "বাংলা", products: "পণ্য", careers: "ক্যারিয়ার", coming_soon: "শীঘ্রই আসছে",
        badge: "স্মার্ট সিভিক প্ল্যাটফর্ম",
        hero_title: "নাগরিকদের ক্ষমতায়ন, সম্প্রদায়গুলিকে সংযুক্ত করা।",
        hero_desc: "স্থানীয় সমস্যা রিপোর্ট করার এবং পাবলিক মেরামত ট্র্যাক করার একটি বিশ্বস্ত প্ল্যাটফর্ম।",
        cta_btn: "অ্যাপ্লিকেশন ডাউনলোড করুন",
        val_title: "কেন নাগরিকসেতু বেছে নেবেন?", val_desc: "গতি, স্বচ্ছতা এবং সহজ ট্র্যাকিংয়ের জন্য নির্মিত।",
        f1_t: "সমস্যা রিপোর্ট করুন", f1_d: "স্থানীয় নাগরিক সমস্যাগুলি সরাসরি কর্তৃপক্ষের কাছে সহজেই রিপোর্ট করুন।",
        f2_t: "অগ্রগতি ট্র্যাক করুন", f2_d: "রিয়েল টাইমে বর্তমান মেরামতের অবস্থা দেখুন।",
        f3_t: "জরুরী সাহায্য", f3_d: "সঙ্কটজনক পরিস্থিতিতে দ্রুত সমর্থন পান।",
        f4_t: "লাইভ আপডেট", f4_d: "অফিসিয়াল নোটিশের সাথে আপনার স্থানীয় এলাকা সম্পর্কে অবগত থাকুন।",
        stat_title: "পরিষ্কার স্বচ্ছতা।", stat_desc: "শহরের কর্মক্ষমতা অবিলম্বে দেখুন। সমাধানের গতি ট্র্যাক করুন।",
        work_title: "এটি কিভাবে কাজ করে", 
        w1_t: "রিপোর্ট", w1_d: "সমস্যাটি বলুন।", w2_t: "অর্পণ করুন", w2_d: "সঠিক দলে পাঠানো হয়েছে।", w3_t: "সমাধান", w3_d: "কাজ সম্পন্ন হয়।",
        mob_title: "যেকোনো জায়গা থেকে অ্যাক্সেস করুন।", mob_desc: "চলতে চলতে সমস্যা রিপোর্ট করুন। স্মার্টফোনের জন্য অপ্টিমাইজ করা হয়েছে।",
        imp_title: "একসাথে ভালো শহর।", imp_desc: "হাজার হাজার নাগরিকের সাথে যোগ দিন। একটি নেটওয়ার্ক দ্রুত সমাধান নিশ্চিত করে।",
        footer_text: "মোভিরার সিভিক দ্বারা নাগরিকসেতু", select_lang: "ভাষা নির্বাচন করুন", built_by: "দ্বারা নির্মিত"
    },
    pa: {
        lang: "ਪੰਜਾਬੀ", products: "ਉਤਪਾਦ", careers: "ਕਰੀਅਰ", coming_soon: "ਜਲਦੀ ਆ ਰਿਹਾ ਹੈ",
        badge: "ਸਮਾਰਟ ਸਿਵਿਕ ਪਲੇਟਫਾਰਮ",
        hero_title: "ਨਾਗਰਿਕਾਂ ਦਾ ਸਸ਼ਕਤੀਕਰਨ, ਭਾਈਚਾਰਿਆਂ ਨੂੰ ਜੋੜਨਾ।",
        hero_desc: "ਸਥਾਨਕ ਸਮੱਸਿਆਵਾਂ ਦੀ ਰਿਪੋਰਟ ਕਰਨ ਅਤੇ ਜਨਤਕ ਮੁਰੰਮਤ ਨੂੰ ਟਰੈਕ ਕਰਨ ਲਈ ਇੱਕ ਭਰੋਸੇਯੋਗ ਪਲੇਟਫਾਰਮ।",
        cta_btn: "ਐਪਲੀਕੇਸ਼ਨ ਡਾਊਨਲੋਡ ਕਰੋ",
        val_title: "ਨਾਗਰਿਕਸੇਤੂ ਕਿਉਂ ਚੁਣੋ?", val_desc: "ਗਤੀ, ਪਾਰਦਰਸ਼ਤਾ ਅਤੇ ਆਸਾਨ ਟਰੈਕਿੰਗ ਲਈ ਬਣਾਇਆ ਗਿਆ।",
        f1_t: "ਮੁੱਦਿਆਂ ਦੀ ਰਿਪੋਰਟ ਕਰੋ", f1_d: "ਸਥਾਨਕ ਨਾਗਰਿਕ ਸਮੱਸਿਆਵਾਂ ਦੀ ਸਿੱਧੇ ਅਧਿਕਾਰੀਆਂ ਨੂੰ ਆਸਾਨੀ ਨਾਲ ਰਿਪੋਰਟ ਕਰੋ।",
        f2_t: "ਤਰੱਕੀ ਟਰੈਕ ਕਰੋ", f2_d: "ਅਸਲ ਸਮੇਂ ਵਿੱਚ ਮੌਜੂਦਾ ਮੁਰੰਮਤ ਦੀ ਸਥਿਤੀ ਦੇਖੋ।",
        f3_t: "ਐਮਰਜੈਂਸੀ ਮਦਦ", f3_d: "ਨਾਜ਼ੁਕ ਸਥਿਤੀਆਂ ਦੌਰਾਨ ਤੇਜ਼ ਸਹਾਇਤਾ ਪ੍ਰਾਪਤ ਕਰੋ।",
        f4_t: "ਲਾਈਵ ਅੱਪਡੇਟ", f4_d: "ਅਧਿਕਾਰਤ ਨੋਟਿਸਾਂ ਦੇ ਨਾਲ ਆਪਣੇ ਸਥਾਨਕ ਖੇਤਰ ਬਾਰੇ ਸੂਚਿਤ ਰਹੋ।",
        stat_title: "ਸਪੱਸ਼ਟ ਪਾਰਦਰਸ਼ਤਾ।", stat_desc: "ਸ਼ਹਿਰ ਦੀ ਕਾਰਗੁਜ਼ਾਰੀ ਤੁਰੰਤ ਦੇਖੋ। ਹੱਲ ਦੀ ਗਤੀ ਨੂੰ ਟਰੈਕ ਕਰੋ।",
        work_title: "ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ", 
        w1_t: "ਰਿਪੋਰਟ", w1_d: "ਸਮੱਸਿਆ ਦੱਸੋ।", w2_t: "ਸੌਂਪੋ", w2_d: "ਸਹੀ ਟੀਮ ਨੂੰ ਭੇਜਿਆ ਗਿਆ।", w3_t: "ਹੱਲ ਕਰੋ", w3_d: "ਕੰਮ ਪੂਰਾ ਹੋ ਜਾਂਦਾ ਹੈ।",
        mob_title: "ਕਿਤੇ ਵੀ ਪਹੁੰਚ ਕਰੋ।", mob_desc: "ਚਲਦੇ-ਫਿਰਦੇ ਸਮੱਸਿਆਵਾਂ ਦੀ ਰਿਪੋਰਟ ਕਰੋ। ਸਮਾਰਟਫ਼ੋਨਾਂ ਲਈ ਅਨੁਕੂਲਿਤ।",
        imp_title: "ਇਕੱਠੇ ਬਿਹਤਰ ਸ਼ਹਿਰ।", imp_desc: "ਹਜ਼ਾਰਾਂ ਨਾਗਰਿਕਾਂ ਨਾਲ ਜੁੜੋ। ਇੱਕ ਨੈੱਟਵਰਕ ਤੇਜ਼ ਹੱਲ ਯਕੀਨੀ ਬਣਾਉਂਦਾ ਹੈ।",
        footer_text: "ਮੋਵਿਰਾ ਸਿਵਿਕ ਦੁਆਰਾ ਨਾਗਰਿਕਸੇਤੂ", select_lang: "ਭਾਸ਼ਾ ਚੁਣੋ", built_by: "ਦੁਆਰਾ ਬਣਾਇਆ ਗਿਆ"
    },
    or: {
        lang: "ଓଡ଼ିଆ", products: "ଉତ୍ପାଦଗୁଡିକ", careers: "କ୍ୟାରିୟର୍", coming_soon: "ଶୀଘ୍ର ଆସୁଛି",
        badge: "ସ୍ମାର୍ଟ ସିଭିକ୍ ପ୍ଲାଟଫର୍ମ",
        hero_title: "ନାଗରିକମାନଙ୍କୁ ସଶକ୍ତ କରିବା, ସମ୍ପ୍ରଦାୟକୁ ଯୋଡିବା।",
        hero_desc: "ସ୍ଥାନୀୟ ସମସ୍ୟା ରିପୋର୍ଟ କରିବା ଏବଂ ସାର୍ବଜନୀନ ମରାମତି ଟ୍ରାକ୍ କରିବା ପାଇଁ ଏକ ବିଶ୍ୱସ୍ତ ପ୍ଲାଟଫର୍ମ।",
        cta_btn: "ଆପ୍ଲିକେସନ୍ ଡାଉନଲୋଡ୍ କରନ୍ତୁ",
        val_title: "ନାଗରିକସେତୁ କାହିଁକି ବାଛିବେ?", val_desc: "ଗତି, ସ୍ୱଚ୍ଛତା ଏବଂ ସହଜ ଟ୍ରାକିଂ ପାଇଁ ନିର୍ମିତ।",
        f1_t: "ସମସ୍ୟା ରିପୋର୍ଟ କରନ୍ତୁ", f1_d: "ସ୍ଥାନୀୟ ନାଗରିକ ସମସ୍ୟାଗୁଡ଼ିକୁ ସିଧାସଳଖ କର୍ତ୍ତୃପକ୍ଷଙ୍କୁ ସହଜରେ ରିପୋର୍ଟ କରନ୍ତୁ।",
        f2_t: "ପ୍ରଗତି ଟ୍ରାକ୍ କରନ୍ତୁ", f2_d: "ବାସ୍ତବ ସମୟରେ ବର୍ତ୍ତମାନର ମରାମତିର ସ୍ଥିତି ଦେଖନ୍ତୁ।",
        f3_t: "ଜରୁରୀକାଳୀନ ସାହାଯ୍ୟ", f3_d: "ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ପରିସ୍ଥିତିରେ ଦ୍ରୁତ ସମର୍ଥନ ପ୍ରାପ୍ତ କରନ୍ତୁ।",
        f4_t: "ଲାଇଭ୍ ଅପଡେଟ୍", f4_d: "ଅଫିସିଆଲ୍ ନୋଟିସ୍ ସହିତ ଆପଣଙ୍କ ସ୍ଥାନୀୟ ଅଞ୍ଚଳ ବିଷୟରେ ଅବଗତ ରୁହନ୍ତୁ।",
        stat_title: "ସ୍ପଷ୍ଟ ସ୍ୱଚ୍ଛତା।", stat_desc: "ସହରର କାର୍ଯ୍ୟଦକ୍ଷତା ତୁରନ୍ତ ଦେଖନ୍ତୁ। ସମାଧାନ ଗତି ଟ୍ରାକ୍ କରନ୍ତୁ।",
        work_title: "ଏହା କିପରି କାମ କରେ", 
        w1_t: "ରିପୋର୍ଟ", w1_d: "ସମସ୍ୟା କୁହନ୍ତୁ।", w2_t: "ନ୍ୟସ୍ତ କରନ୍ତୁ", w2_d: "ସଠିକ୍ ଟିମ୍ କୁ ପଠାଯାଇଛି।", w3_t: "ସମାଧାନ", w3_d: "କାମ ସମ୍ପୂର୍ଣ୍ଣ ହୁଏ।",
        mob_title: "ଯେକୌଣସି ସ୍ଥାନରୁ ଆକ୍ସେସ୍ କରନ୍ତୁ।", mob_desc: "ଯାତ୍ରା ସମୟରେ ସମସ୍ୟା ରିପୋର୍ଟ କରନ୍ତୁ। ସ୍ମାର୍ଟଫୋନ୍ ପାଇଁ ଅପ୍ଟିମାଇଜ୍ କରାଯାଇଛି।",
        imp_title: "ଏକାଠି ଭଲ ସହର।", imp_desc: "ହଜାର ହଜାର ନାଗରିକଙ୍କ ସହିତ ଯୋଗ ଦିଅନ୍ତୁ। ଗୋଟିଏ ନେଟୱାର୍କ ଦ୍ରୁତ ସମାଧାନ ନିଶ୍ଚିତ କରେ।",
        footer_text: "ମୋଭିରା ସିଭିକ୍ ଦ୍ୱାରା ନାଗରିକସେତୁ", select_lang: "ଭାଷା ବାଛନ୍ତୁ", built_by: "ଦ୍ୱାରା ନିର୍ମିତ"
    },
    as: {
        lang: "অসমীয়া", products: "সামগ্ৰী", careers: "কেৰিয়াৰ", coming_soon: "অতি সোনকালেই আহি আছে",
        badge: "স্মাৰ্ট চিভিক প্লেটফৰ্ম",
        hero_title: "নাগৰিকক সৱলীকৰণ, সম্প্ৰদায়সমূহক সংযোগ কৰা।",
        hero_desc: "স্থানীয় সমস্যা ৰিপোৰ্ট কৰিবলৈ আৰু ৰাজহুৱা মেৰামতি ট্ৰেক কৰিবলৈ এটা নিৰ্ভৰযোগ্য প্লেটফৰ্ম।",
        cta_btn: "এপ্লিকেচন ডাউনলোড কৰক",
        val_title: "নাগৰিকসেতু কিয় বাছনি কৰিব?", val_desc: "দ্ৰুতি, স্বচ্ছতা আৰু সহজ ট্ৰেকিঙৰ বাবে নিৰ্মিত।",
        f1_t: "সমস্যা ৰিপোৰ্ট কৰক", f1_d: "স্থানীয় নাগৰিক সমস্যাবোৰ পোনপটীয়াকৈ কৰ্তৃপক্ষক সহজে ৰিপোৰ্ট কৰক।",
        f2_t: "প্ৰগতি ট্ৰেক কৰক", f2_d: "বৰ্তমানৰ মেৰামতিৰ স্থিতি ৰিয়েল টাইমত চাওক।",
        f3_t: "জৰুৰীকালীন সহায়", f3_d: "গুৰুত্বপূৰ্ণ পৰিস্থিতিত দ্ৰুত সমৰ্থন প্ৰাপ্ত কৰক।",
        f4_t: "লাইভ আপডেট", f4_d: "চৰকাৰী জাননীৰ সৈতে আপোনাৰ স্থানীয় অঞ্চলৰ বিষয়ে অৱগত থাকক।",
        stat_title: "স্পষ্ট স্বচ্ছতা।", stat_desc: "চহৰৰ প্ৰদৰ্শন লগে লগে চাওক। সমাধানৰ দ্ৰুতি ট্ৰেক কৰক।",
        work_title: "ই কেনেকৈ কাম কৰে", 
        w1_t: "ৰিপোৰ্ট", w1_d: "সমস্যাটো জনাওক।", w2_t: "অৰ্পণ কৰক", w2_d: "সঠিক দললৈ প্ৰেৰণ কৰা হৈছে।", w3_t: "সমাধান", w3_d: "কাম সম্পূৰ্ণ হয়।",
        mob_title: "যিকোনো ঠাইৰ পৰা এক্সেছ কৰক।", mob_desc: "যিকোনো ঠাইৰ পৰা সমস্যা ৰিপোৰ্ট কৰক। স্মাৰ্টফোনৰ বাবে অনুকূলিত।",
        imp_title: "একেলাগে উন্নত চহৰ।", imp_desc: "হাজাৰ হাজাৰ নাগৰিকৰ সৈতে যোগ দিয়ক। এটা নেটৱৰ্কে দ্ৰুত সমাধান নিশ্চিত কৰে।",
        footer_text: "মভিৰা চিভিকৰ দ্বাৰা নাগৰিকসেতু", select_lang: "ভাষা বাছক", built_by: "নিৰ্মাণ কৰিছে"
    },
    ur: {
        lang: "اردو", products: "مصنوعات", careers: "کیریئرز", coming_soon: "جلد آ رہا ہے",
        badge: "اسمارٹ سوک پلیٹ فارم",
        hero_title: "شہریوں کو بااختیار بنانا، کمیونٹیز کو جوڑنا۔",
        hero_desc: "مقامی مسائل کی اطلاع دینے اور عوامی مرمت کو ٹریک کرنے کا ایک قابل اعتماد پلیٹ فارم۔",
        cta_btn: "ایپلیکیشن ڈاؤن لوڈ کریں",
        val_title: "ناگرک سیتو کیوں منتخب کریں؟", val_desc: "رفتار، شفافیت اور آسان ٹریکنگ کے لیے بنایا گیا۔",
        f1_t: "مسائل کی اطلاع دیں", f1_d: "مقامی شہری مسائل کی براہ راست حکام کو آسانی سے اطلاع دیں۔",
        f2_t: "پیشرفت ٹریک کریں", f2_d: "موجودہ مرمت کی حیثیت حقیقی وقت میں دیکھیں۔",
        f3_t: "ہنگامی مدد", f3_d: "اہم حالات کے دوران تیز رفتار مدد حاصل کریں۔",
        f4_t: "لائیو اپ ڈیٹس", f4_d: "سرکاری نوٹسز کے ساتھ اپنے علاقے کے بارے میں باخبر رہیں۔",
        stat_title: "واضح شفافیت۔", stat_desc: "شہر کی کارکردگی کو فوری طور پر دیکھیں۔ حل کی رفتار کو ٹریک کریں۔",
        work_title: "یہ کیسے کام کرتا ہے", 
        w1_t: "رپورٹ", w1_d: "مسئلہ بتائیں۔", w2_t: "تفویض کریں", w2_d: "صحیح ٹیم کو بھیجا گیا۔", w3_t: "حل کریں", w3_d: "کام مکمل ہو جاتا ہے۔",
        mob_title: "کہیں سے بھی رسائی حاصل کریں۔", mob_desc: "چلتے پھرتے مسائل کی اطلاع دیں۔ اسمارٹ فونز کے لیے بہتر بنایا گیا۔",
        imp_title: "ایک ساتھ بہتر شہر۔", imp_desc: "ہزاروں شہریوں کے ساتھ شامل ہوں۔ ایک نیٹ ورک تیز حل کو یقینی بناتا ہے۔",
        footer_text: "موویرا سوک کی طرف سے ناگرک سیتو", select_lang: "زبان منتخب کریں", built_by: "بذریعہ بنایا گیا"
    },
    bho: {
        lang: "भोजपुरी", products: "उत्पाद", careers: "करियर", coming_soon: "जल्द आवत बा",
        badge: "स्मार्ट नागरिक मंच",
        hero_title: "नागरिक लोग के सशक्त कइल, समुदाय के जोड़ल।",
        hero_desc: "स्थानीय समस्या बतावे आ सार्वजनिक मरम्मत ट्रैक करे खातिर एगो भरोसेमंद मंच।",
        cta_btn: "एप्लीकेशन डाउनलोड करीं",
        val_title: "नागरिकसेतु काहे चुनीं?", val_desc: "गति, पारदर्शिता आ आसान ट्रैकिंग खातिर बनावल गइल।",
        f1_t: "समस्या दर्ज करीं", f1_d: "स्थानीय नागरिक समस्या के सीधा अधिकारी लोग के आसानी से रिपोर्ट करीं।",
        f2_t: "प्रगति ट्रैक करीं", f2_d: "वर्तमान मरम्मत के स्थिति वास्तविक समय में देखीं।",
        f3_t: "आपातकालीन मदद", f3_d: "गंभीर स्थिति के दौरान तेजी से सहायता प्राप्त करीं।",
        f4_t: "लाइव अपडेट", f4_d: "आधिकारिक नोटिस के साथ आपन एरिया के बारे में अपडेट रहीं।",
        stat_title: "स्पष्ट पारदर्शिता।", stat_desc: "शहर के प्रदर्शन तुरंत देखीं। समाधान के गति ट्रैक करीं।",
        work_title: "ई कइसे काम करेला", 
        w1_t: "रिपोर्ट", w1_d: "समस्या बताईं।", w2_t: "सौंपीं", w2_d: "सही टीम के भेजल गइल।", w3_t: "समाधान", w3_d: "काम पूरा हो जाला।",
        mob_title: "कहीं भी पहुँचीं।", mob_desc: "चलत-फिरत समस्या के रिपोर्ट करीं। स्मार्टफोन खातिर अनुकूलित।",
        imp_title: "एक साथ बेहतर शहर।", imp_desc: "हजारों नागरिक लोग से जुड़ीं। एगो नेटवर्क तेज समाधान सुनिश्चित करेला।",
        footer_text: "मोविरा सिविक द्वारा नागरिकसेतु", select_lang: "भाषा चुनीं", built_by: "द्वारा बनावल"
    }
};

export default function MarketingLanding() {
    const navigate = useNavigate();
    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    const [showProductsPrompt, setShowProductsPrompt] = useState(false);

    // STRICT COLOR VARIABLES (Movyra NagrikSetu Brand)
    const theme = {
        primary: "#00897B",    // Civic Teal
        bg: "#00897B",         // Main Background
        text: "#FFFFFF",       // White text for contrast on teal
        cardBg: "#FFFFFF",     // White cards
        cardText: "#111111",   // Black text in cards
        accent: "#FFB300",     // Action Yellow
        success: "#2E7D32",    // Success Green
        emergency: "#D32F2F",  // Emergency Red
        info: "#1565C0",       // Information Blue
        border: "rgba(255,255,255,0.2)"
    };

    const currentT = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    const localCity = "India";

    const languageOptions = [
        { code: 'en', label: 'English' }, { code: 'hi', label: 'हिन्दी' }, { code: 'hinglish', label: 'Hinglish' },
        { code: 'mr', label: 'मराठी' }, { code: 'gu', label: 'ગુજરાતી' }, { code: 'te', label: 'తెలుగు' },
        { code: 'ta', label: 'தமிழ்' }, { code: 'kn', label: 'ಕನ್ನಡ' }, { code: 'ml', label: 'മലയാളം' },
        { code: 'bn', label: 'বাংলা' }, { code: 'pa', label: 'ਪੰਜਾਬੀ' }, { code: 'or', label: 'ଓଡ଼ିଆ' },
        { code: 'as', label: 'অসমীয়া' }, { code: 'ur', label: 'اردو' }, { code: 'bho', label: 'भोजपुरी' }
    ];

    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        if (TRANSLATIONS[sysLang]) setLang(sysLang);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Strict redirect to download funnel
    const handleDownloadRedirect = () => {
        navigate('/download');
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <div style={{ backgroundColor: theme.bg, color: theme.text, minHeight: '100vh', fontFamily: 'sans-serif', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
            
            <style>
                {`
                @keyframes fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade { animation: fade 0.6s ease-out forwards; }
                html { scroll-behavior: smooth; }
                `}
            </style>

            {/* MINIMAL TOP HEADER */}
            <header className="w-full flex items-center justify-between px-6 md:px-12 py-6 animate-fade relative z-50 border-b border-white/20">
                <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo(0,0)}>
                    <img 
                        src="/logo-1.png" 
                        alt="M" 
                        className="h-8 w-auto mr-[1px]" 
                        onError={(e) => { e.target.style.display = 'none' }} 
                    />
                    <span className="font-black text-2xl -ml-1">
                        &nbsp;ovyra <span className="font-medium text-sm ml-1">NagrikSetu</span>
                    </span>
                </div>
                
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setShowLangPrompt(true)}
                        className="px-4 py-2 rounded-full border border-white/50 text-sm font-bold hover:bg-white/10 transition-colors flex items-center gap-2 outline-none"
                    >
                        <Globe size={16} /> <span className="hidden sm:inline">{currentT.lang}</span>
                    </button>
                    <button 
                        onClick={() => setShowProductsPrompt(true)}
                        className="px-4 py-2 rounded-full border border-white/50 text-sm font-bold hover:bg-white/10 transition-colors hidden md:flex items-center gap-2 outline-none"
                    >
                        {currentT.products}
                    </button>
                </div>
            </header>

            {/* LANGUAGE SELECTOR MODAL */}
            <AnimatePresence>
                {showLangPrompt && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] backdrop-blur-md flex items-center justify-center p-6 bg-black/60"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            style={{ backgroundColor: theme.cardBg, color: theme.cardText }}
                            className="w-full max-w-[400px] rounded-3xl p-8 flex flex-col shadow-2xl relative max-h-[80vh] overflow-y-auto"
                        >
                            <button 
                                onClick={() => setShowLangPrompt(false)} 
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors outline-none"
                            >
                                <X size={18} />
                            </button>
                            
                            <h2 className="text-[1.4rem] font-black tracking-tight mb-6 text-center mt-4">
                                {currentT.select_lang}
                            </h2>
                            
                            <div className="flex flex-col gap-2">
                                {languageOptions.map((option) => (
                                    <button 
                                        key={option.code}
                                        onClick={() => { setLang(option.code); setShowLangPrompt(false); }}
                                        style={{ 
                                            backgroundColor: lang === option.code ? '#E0F2F1' : 'transparent',
                                            borderColor: lang === option.code ? theme.primary : '#E0E0E0',
                                            color: lang === option.code ? theme.primary : theme.cardText
                                        }}
                                        className="w-full p-4 rounded-xl flex items-center justify-between transition-colors border outline-none hover:border-[#00897B]"
                                    >
                                        <span className="font-bold text-[1rem]">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PRODUCTS ECOSYSTEM MODAL */}
            <AnimatePresence>
                {showProductsPrompt && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] backdrop-blur-md flex items-center justify-center p-6 bg-black/60"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            style={{ backgroundColor: theme.cardBg, color: theme.cardText }}
                            className="w-full max-w-[500px] rounded-3xl p-8 flex flex-col shadow-2xl relative"
                        >
                            <button 
                                onClick={() => setShowProductsPrompt(false)} 
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors outline-none"
                            >
                                <X size={18} />
                            </button>

                            <h2 className="text-[1.5rem] font-black tracking-tight mb-8 text-center mt-4">{currentT.products}</h2>

                            <div className="flex flex-col gap-4">
                                {/* Sahay */}
                                <div className="flex items-center gap-4 p-4 rounded-2xl border border-[#E0E0E0] bg-[#F9FAFB]">
                                    <img src="/logo.png" alt="M" className="h-6 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                                    <div className="flex flex-col">
                                        <span className="font-black text-xl leading-none">
                                            ovyra <span className="font-medium text-[1rem] text-[#666666]">Sahay</span>
                                        </span>
                                    </div>
                                </div>
                                {/* Civic */}
                                <div className="flex items-center gap-4 p-4 rounded-2xl border border-[#E0E0E0] bg-[#F9FAFB]">
                                    <img src="/logo.png" alt="M" className="h-6 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                                    <div className="flex flex-col">
                                        <span className="font-black text-xl leading-none">
                                            ovyra <span className="font-medium text-[1rem] text-[#666666]">Civic</span>
                                        </span>
                                    </div>
                                </div>
                                {/* NagrikSetu */}
                                <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-[#00897B] bg-[#E0F2F1]">
                                    <img src="/logo.png" alt="M" className="h-6 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                                    <div className="flex flex-col">
                                        <span className="font-black text-xl leading-none text-[#00897B]">
                                            ovyra <span className="font-bold text-[1rem]">NagrikSetu</span>
                                        </span>
                                    </div>
                                </div>
                                {/* SevaSetu */}
                                <div className="flex items-center justify-between p-4 rounded-2xl border border-[#E0E0E0] bg-white opacity-60">
                                    <div className="flex items-center gap-4">
                                        <img src="/logo.png" alt="M" className="h-6 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                                        <div className="flex flex-col">
                                            <span className="font-black text-xl leading-none">
                                                ovyra <span className="font-medium text-[1rem] text-[#666666]">SevaSetu</span>
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-[0.75rem] font-bold px-3 py-1 bg-[#E0E0E0] rounded-full uppercase tracking-wider">{currentT.coming_soon}</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SECTION 1: HERO */}
            <section className="relative pt-24 pb-20 px-6 md:px-12 max-w-[1400px] mx-auto flex flex-col justify-center w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="z-10">
                        <motion.div variants={fadeUp} className="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-8 border border-white/30 bg-white/10">
                            <ShieldCheck size={18} />
                            <span className="text-[0.85rem] font-bold tracking-widest uppercase">{currentT.badge}</span>
                        </motion.div>
                        <motion.h1 variants={fadeUp} className="text-[3.5rem] md:text-[4.5rem] font-black leading-[1.1] tracking-tighter mb-6">
                            {currentT.hero_title}
                        </motion.h1>
                        <motion.p variants={fadeUp} className="text-[1.1rem] md:text-[1.25rem] max-w-[550px] leading-relaxed mb-10 opacity-90">
                            {currentT.hero_desc}
                        </motion.p>
                        <motion.div variants={fadeUp}>
                            <button 
                                onClick={handleDownloadRedirect} 
                                style={{ backgroundColor: theme.accent, color: theme.cardText }}
                                className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-[1.1rem] flex items-center justify-center gap-3 transition-transform hover:scale-105 outline-none shadow-lg"
                            >
                                {currentT.cta_btn} <ArrowRight size={20} />
                            </button>
                        </motion.div>
                    </motion.div>

                    {/* HERO GRAPHIC: Animated Network SVG */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="hidden lg:flex justify-end relative">
                        <svg viewBox="0 0 400 400" className="w-full h-auto max-w-[500px]" fill="none">
                            <circle cx="200" cy="200" r="180" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="8 8"/>
                            <circle cx="200" cy="200" r="120" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                            <motion.circle cx="200" cy="200" r="60" fill="#FFFFFF" initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }} />
                            <path d="M200 140 L200 50 M260 200 L350 200 M200 260 L200 350 M140 200 L50 200" stroke="#FFFFFF" strokeWidth="3"/>
                            <circle cx="200" cy="50" r="8" fill={theme.accent} />
                            <circle cx="350" cy="200" r="8" fill={theme.accent} />
                            <circle cx="200" cy="350" r="8" fill={theme.accent} />
                            <circle cx="50" cy="200" r="8" fill={theme.accent} />
                        </svg>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 2: APP SHOWCASE GRID */}
            <section className="py-16 px-6 md:px-12 max-w-[1400px] mx-auto w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Primary Report Card */}
                    <button onClick={handleDownloadRedirect} style={{ backgroundColor: theme.cardBg, color: theme.cardText }} className="p-8 rounded-2xl flex flex-col items-start text-left transition-transform hover:-translate-y-1 outline-none border-none shadow-xl">
                        <div style={{ backgroundColor: '#E0F2F1', color: theme.primary }} className="w-14 h-14 rounded-full flex items-center justify-center mb-6">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-[1.25rem] font-black mb-2">{currentT.f1_t}</h3>
                        <p className="text-[0.95rem] text-[#666666] mb-8 leading-relaxed">{currentT.f1_d}</p>
                        <div style={{ color: theme.primary }} className="mt-auto flex items-center gap-2 font-bold text-[0.9rem]">
                            {currentT.cta_btn} <ArrowRight size={16} />
                        </div>
                    </button>

                    <button onClick={handleDownloadRedirect} style={{ backgroundColor: theme.cardBg, color: theme.cardText }} className="p-8 rounded-2xl flex flex-col items-start text-left transition-transform hover:-translate-y-1 outline-none border-none shadow-xl">
                        <div style={{ backgroundColor: '#E8F5E9', color: theme.success }} className="w-14 h-14 rounded-full flex items-center justify-center mb-6">
                            <Activity size={24} />
                        </div>
                        <h3 className="text-[1.25rem] font-black mb-2">{currentT.f2_t}</h3>
                        <p className="text-[0.95rem] text-[#666666] mb-8 leading-relaxed">{currentT.f2_d}</p>
                        <div style={{ color: theme.primary }} className="mt-auto flex items-center gap-2 font-bold text-[0.9rem]">
                            {currentT.cta_btn} <ArrowRight size={16} />
                        </div>
                    </button>

                    <button onClick={handleDownloadRedirect} style={{ backgroundColor: theme.cardBg, color: theme.cardText }} className="p-8 rounded-2xl flex flex-col items-start text-left transition-transform hover:-translate-y-1 outline-none border-none shadow-xl">
                        <div style={{ backgroundColor: '#FFEBEE', color: theme.emergency }} className="w-14 h-14 rounded-full flex items-center justify-center mb-6">
                            <Phone size={24} />
                        </div>
                        <h3 className="text-[1.25rem] font-black mb-2">{currentT.f3_t}</h3>
                        <p className="text-[0.95rem] text-[#666666] mb-8 leading-relaxed">{currentT.f3_d}</p>
                        <div style={{ color: theme.primary }} className="mt-auto flex items-center gap-2 font-bold text-[0.9rem]">
                            {currentT.cta_btn} <ArrowRight size={16} />
                        </div>
                    </button>

                    <button onClick={handleDownloadRedirect} style={{ backgroundColor: theme.cardBg, color: theme.cardText }} className="p-8 rounded-2xl flex flex-col items-start text-left transition-transform hover:-translate-y-1 outline-none border-none shadow-xl">
                        <div style={{ backgroundColor: '#E3F2FD', color: theme.info }} className="w-14 h-14 rounded-full flex items-center justify-center mb-6">
                            <Megaphone size={24} />
                        </div>
                        <h3 className="text-[1.25rem] font-black mb-2">{currentT.f4_t}</h3>
                        <p className="text-[0.95rem] text-[#666666] mb-8 leading-relaxed">{currentT.f4_d}</p>
                        <div style={{ color: theme.primary }} className="mt-auto flex items-center gap-2 font-bold text-[0.9rem]">
                            {currentT.cta_btn} <ArrowRight size={16} />
                        </div>
                    </button>
                </div>
            </section>

            {/* SECTION 3: LIVE ANALYTICS PREVIEW */}
            <section className="py-16 px-6 md:px-12 max-w-[1400px] mx-auto w-full">
                <div style={{ backgroundColor: theme.cardBg, color: theme.cardText }} className="rounded-3xl p-10 md:p-16 border-none flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden relative shadow-xl">
                    <div className="relative z-10 lg:max-w-[40%]">
                        <TrendingUp size={36} color={theme.primary} className="mb-6" />
                        <h2 className="text-[2.5rem] font-black tracking-tighter mb-4">{currentT.stat_title}</h2>
                        <p className="text-[1.1rem] leading-relaxed mb-8 text-[#666666]">
                            {currentT.stat_desc}
                        </p>
                        <button onClick={handleDownloadRedirect} style={{ color: theme.primary }} className="font-bold text-[1.1rem] flex items-center gap-2 hover:underline">
                            {currentT.cta_btn} <ArrowRight size={18} />
                        </button>
                    </div>

                    {/* Animated Bar Chart Graphic */}
                    <div className="w-full lg:w-[50%] h-[300px] flex items-end gap-4 relative z-10">
                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#E0E0E0]"></div>
                        {[40, 70, 45, 90, 60, 100].map((height, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ height: 0 }}
                                whileInView={{ height: `${height}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: idx * 0.1 }}
                                style={{ backgroundColor: theme.primary }}
                                className="flex-1 rounded-t-lg opacity-90 shadow-sm"
                            ></motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 4: CITIZEN WORKFLOW */}
            <section className="py-16 px-6 md:px-12 max-w-[1400px] mx-auto text-center w-full">
                <h2 className="text-[2.5rem] font-black tracking-tighter mb-16">{currentT.work_title}</h2>
                
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 relative">
                    {/* Connecting Line (Hidden on Mobile) */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] -translate-y-1/2 z-0 bg-white/20"></div>

                    {[
                        { num: "1", title: currentT.w1_t, desc: currentT.w1_d },
                        { num: "2", title: currentT.w2_t, desc: currentT.w2_d },
                        { num: "3", title: currentT.w3_t, desc: currentT.w3_d }
                    ].map((step, idx) => (
                        <div key={idx} style={{ backgroundColor: theme.cardBg, color: theme.cardText }} className="relative z-10 w-full md:w-1/3 p-8 rounded-3xl flex flex-col items-center text-center shadow-xl">
                            <div style={{ backgroundColor: theme.primary, color: theme.text }} className="w-14 h-14 rounded-full flex items-center justify-center font-black text-[1.2rem] mb-6 shadow-md">
                                {step.num}
                            </div>
                            <h3 className="text-[1.25rem] font-black mb-2">{step.title}</h3>
                            <p className="text-[0.95rem] text-[#666666] font-medium">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* SECTION 5: MOBILE ACCESSIBILITY & COMMUNITY */}
            <section className="py-16 px-6 md:px-12 max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                <div style={{ backgroundColor: theme.cardBg, color: theme.cardText }} className="rounded-3xl p-10 md:p-16 shadow-xl flex flex-col justify-center">
                    <Smartphone size={36} color={theme.primary} className="mb-6" />
                    <h2 className="text-[2.5rem] font-black tracking-tighter mb-4">{currentT.mob_title}</h2>
                    <p className="text-[1.1rem] leading-relaxed text-[#666666] mb-8">
                        {currentT.mob_desc}
                    </p>
                    {/* Simple Static SVG Phone */}
                    <svg viewBox="0 0 200 200" className="w-full max-w-[150px] h-auto mx-auto mt-4" fill="none">
                        <rect x="50" y="20" width="100" height="160" rx="20" fill="#E0E0E0" stroke="#CCCCCC" strokeWidth="4" />
                        <rect x="56" y="26" width="88" height="148" rx="14" fill="#FFFFFF" />
                        <rect x="66" y="50" width="56" height="12" rx="4" fill="#00897B" />
                        <rect x="66" y="70" width="68" height="8" rx="4" fill="#E0E0E0" />
                        <rect x="66" y="86" width="48" height="8" rx="4" fill="#E0E0E0" />
                        <circle cx="100" cy="155" r="8" stroke="#CCCCCC" strokeWidth="2" />
                    </svg>
                </div>

                <div style={{ backgroundColor: theme.cardBg, color: theme.cardText }} className="rounded-3xl p-10 md:p-16 shadow-xl flex flex-col justify-center items-center text-center">
                    <Users size={36} color={theme.primary} className="mb-6" />
                    <h2 className="text-[2.5rem] font-black tracking-tighter mb-4">{currentT.imp_title}</h2>
                    <p className="text-[1.1rem] leading-relaxed text-[#666666] mb-8">
                        {currentT.imp_desc}
                    </p>
                    {/* Animated Nodes SVG */}
                    <div className="relative w-full max-w-[300px] aspect-video mx-auto mt-4">
                        <svg viewBox="0 0 400 200" className="w-full h-full" fill="none">
                            <path d="M50 100 C150 150 250 50 350 100" stroke="#00897B" strokeWidth="2" strokeDasharray="6 6" />
                            <motion.circle cx="50" cy="100" r="12" fill="#00897B" initial={{ scale: 1 }} animate={{ scale: 1.5, opacity: 0.5 }} transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }} />
                            <motion.circle cx="200" cy="100" r="16" fill="#00897B" initial={{ scale: 1 }} animate={{ scale: 1.3, opacity: 0.8 }} transition={{ repeat: Infinity, duration: 2, repeatType: "reverse", delay: 0.5 }} />
                            <motion.circle cx="350" cy="100" r="12" fill="#00897B" initial={{ scale: 1 }} animate={{ scale: 1.5, opacity: 0.5 }} transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse", delay: 1 }} />
                        </svg>
                    </div>
                </div>

            </section>

            {/* MINIMAL FOOTER */}
            <footer className="w-full mt-auto flex flex-col md:flex-row items-center justify-between gap-8 px-8 md:px-12 py-10 border-t border-white/20 relative z-10 bg-[#007065]">
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                    <span onClick={() => setShowProductsPrompt(true)} className="text-[0.9rem] font-bold cursor-pointer hover:underline transition-all">
                        {currentT.products}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                    <Link to="/careers" className="text-[0.9rem] font-bold hover:underline transition-all">
                        {currentT.careers}
                    </Link>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                    
                    {/* Built by section with explicit AnyAstro image */}
                    <div className="flex items-center gap-2 text-[0.8rem] uppercase tracking-wider font-bold opacity-90">
                        {currentT.built_by} 
                        <a href="https://rebrand.ly/aatns" target="_blank" rel="noopener noreferrer" className="ml-1 hover:opacity-80 transition-opacity">
                            <img 
                                src="/aat.png" 
                                alt="AnyAstro" 
                                className="h-5 w-auto object-contain" 
                                onError={(e) => { e.target.style.display = 'none'; e.target.insertAdjacentHTML('afterend', '<span class="underline">AnyAstro Techno Solutions</span>'); }} 
                            />
                        </a>
                    </div>
                </div>
                
                <div className="flex items-center gap-6">
                    {/* Footer Custom Branding */}
                    <div className="flex items-center opacity-80" onClick={scrollToTop}>
                        <img 
                            src="/logo.png" 
                            alt="M" 
                            className="h-6 w-auto mr-[1px]" 
                            onError={(e) => { e.target.style.display = 'none' }} 
                        />
                        <span className="font-black text-xl -ml-[3px]">
                            ovyra <span className="font-medium text-[0.75rem] ml-1 tracking-wide">NagrikSetu</span>
                        </span>
                    </div>

                    <button onClick={scrollToTop} className="p-2.5 rounded-full border border-white/30 hover:bg-white/10 transition-colors outline-none flex items-center justify-center">
                        <ArrowUp size={16} />
                    </button>
                </div>
            </footer>
        </div>
    );
}