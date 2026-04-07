import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Plane, ShieldCheck, Zap, Crown } from 'lucide-react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Real Preferences & Translation Engine
import usePreferencesStore from '../../store/usePreferencesStore';
import { t } from '../../utils/translations';

/**
 * UI COMPONENT: PROMO BANNER (UBER-STYLE ILLUSTRATIVE CARDS)
 * Architecture: High-fidelity, rounded, illustrative promotional blocks.
 * Features:
 * 1. Variant Switching: Airport, Safety, Eco, Premium.
 * 2. Real-time User Context: Injects live Firebase Auth displayName.
 * 3. Parallax SVG Backgrounds: Continuous floating animations.
 * 4. Active Routing: Real navigation triggers via react-router.
 * 5. Global i18n Sync: Fully translated copy.
 */

export default function PromoBanner({ variant = 'safety', className = '' }) {
  const navigate = useNavigate();
  const { language } = usePreferencesStore();
  const [firstName, setFirstName] = useState('');

  // FEATURE 1: Real-time User Context Injection
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.displayName) {
        setFirstName(user.displayName.split(' ')[0]);
      } else {
        setFirstName(t('Guest', language));
      }
    });
    return () => unsubscribe();
  }, [language]);

  // FEATURE 2: Dynamic Variant Configuration Engine
  const getVariantConfig = () => {
    switch (variant) {
      case 'airport':
        return {
          bgClass: 'bg-[#0B1A3A] dark:bg-[#071126]',
          textClass: 'text-white',
          title: firstName ? `${t('Welcome to the Airport', language)}, ${firstName}` : t('Welcome to the Airport', language),
          subtitle: t('Navigate to a designated pickup spot, then request your ride. We will be ready for you.', language),
          cta: t('See Pickup Areas', language),
          route: '/booking/set-location',
          Icon: Plane,
          iconColor: 'text-white/10',
          iconAnimation: { y: [-5, 5], x: [0, 10] }
        };
      case 'safety':
        return {
          bgClass: 'bg-[#E2F1FF] dark:bg-[#1A365D]',
          textClass: 'text-[#111111] dark:text-[#E2F1FF]',
          title: t('We stand for safety.', language),
          subtitle: t('Discover our advanced safety features designed to keep you protected on every trip.', language),
          cta: t('Safety Tools', language),
          route: '/profile-settings',
          Icon: ShieldCheck,
          iconColor: 'text-[#BCE3FF]/40 dark:text-[#0B1A3A]/40',
          iconAnimation: { y: [-10, 10], rotate: [-5, 5] }
        };
      case 'eco':
        return {
          bgClass: 'bg-[#E8F5E9] dark:bg-[#1B3320]',
          textClass: 'text-[#111111] dark:text-[#E8F5E9]',
          title: t('Go anywhere, go green.', language),
          subtitle: t('Choose electric vehicles and help reduce emissions in your city.', language),
          cta: t('Explore Eco Rides', language),
          route: '/booking/select-vehicle',
          Icon: Zap,
          iconColor: 'text-[#C8E6C9]/50 dark:text-[#111111]/30',
          iconAnimation: { scale: [0.95, 1.05], rotate: [0, -10] }
        };
      case 'premium':
        return {
          bgClass: 'bg-[#111111] dark:bg-[#222222]',
          textClass: 'text-[#F6F6F6] dark:text-white',
          title: t('Unlock Movyra Premium', language),
          subtitle: t('Get priority dispatch, top-rated partners, and exclusive pricing on every trip.', language),
          cta: t('View Benefits', language),
          route: '/profile-settings',
          Icon: Crown,
          iconColor: 'text-[#333333] dark:text-black/50',
          iconAnimation: { y: [0, -8, 0], scale: [1, 1.05, 1] }
        };
      default:
        return {
          bgClass: 'bg-gray-100 dark:bg-gray-800',
          textClass: 'text-gray-900 dark:text-white',
          title: t('Promotional Offer', language),
          subtitle: t('Check out our latest updates.', language),
          cta: t('Learn More', language),
          route: '/',
          Icon: ArrowRight,
          iconColor: 'text-gray-200 dark:text-gray-700',
          iconAnimation: { x: [0, 5] }
        };
    }
  };

  const config = getVariantConfig();
  const ActiveIcon = config.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(config.route)}
      className={`relative w-full rounded-[24px] p-6 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.08)] cursor-pointer group transition-colors duration-300 ${config.bgClass} ${className}`}
    >
      {/* FEATURE 3: Immersive Parallax SVG Background */}
      <div className="absolute -right-6 -bottom-6 top-0 w-[55%] pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(255,255,255,0.1)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
        <motion.div
          animate={config.iconAnimation}
          transition={{ repeat: Infinity, duration: 4, repeatType: "reverse", ease: "easeInOut" }}
          className="w-full h-full flex items-center justify-end pr-4"
        >
          <ActiveIcon size={140} strokeWidth={1} className={`${config.iconColor} -rotate-12`} />
        </motion.div>
      </div>

      {/* FEATURE 4 & 5: High-Contrast Foreground Content with Routing & Translations */}
      <div className="relative z-20 flex flex-col h-full justify-between gap-4 max-w-[65%]">
        <div className="space-y-2">
          <h3 className={`text-[20px] sm:text-[22px] font-black leading-tight tracking-tight ${config.textClass}`}>
            {config.title}
          </h3>
          <p className={`text-[13px] font-medium leading-snug opacity-80 ${config.textClass}`}>
            {config.subtitle}
          </p>
        </div>
        
        <div className={`mt-2 flex items-center gap-1.5 text-[14px] font-bold group-hover:underline transition-all ${config.textClass}`}>
          {config.cta}
          <motion.div
            initial={{ x: 0 }}
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <ArrowRight size={16} strokeWidth={2.5} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}