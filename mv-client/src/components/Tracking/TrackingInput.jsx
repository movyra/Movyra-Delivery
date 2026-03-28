import React, { useState, useRef } from 'react';
import { Box, Search, X, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// COMPONENT: TRACKING INPUT (MOVYRA LIGHT THEME)
// A premium, interactive search bar featuring 6 functional sections:
// Form Engine, Left Prefix, Input Processor, Clear Action, Submit Action, 
// and Real-time Validation Engine.
// ============================================================================

export default function TrackingInput({ 
  value = '', 
  onChange, 
  onSubmit, 
  isLoading = false 
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // SECTION 1: Form Engine & Validation Logic
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Real validation: Tracking numbers usually have a minimum length
    if (value.trim().length === 0) {
      setError('Please enter a tracking number.');
      inputRef.current?.focus();
      return;
    }
    
    if (value.trim().length < 6) {
      setError('Tracking number must be at least 6 characters.');
      inputRef.current?.focus();
      return;
    }

    if (onSubmit) {
      onSubmit(value.trim());
    }
  };

  // Input Processor: Auto-capitalize and strip illegal characters
  const handleInputChange = (e) => {
    const rawValue = e.target.value;
    // Cast to uppercase and remove special characters (allow alphanumeric and spaces)
    const formattedValue = rawValue.toUpperCase().replace(/[^A-Z0-9 ]/g, '');
    
    if (onChange) onChange(formattedValue);
    if (error) setError(''); // Clear error on typing
  };

  const handleClear = () => {
    if (onChange) onChange('');
    setError('');
    inputRef.current?.focus();
  };

  return (
    <div className="w-full relative flex flex-col gap-2">
      
      {/* SECTION 2: Animated Form Wrapper */}
      <motion.form 
        onSubmit={handleSubmit}
        animate={{ 
          scale: isFocused ? 1.02 : 1,
          boxShadow: isFocused ? '0 10px 30px rgba(30, 106, 245, 0.15)' : '0 2px 10px rgba(0, 0, 0, 0.02)'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`relative w-full flex items-center bg-white rounded-[24px] border-2 transition-colors duration-300 ${
          error ? 'border-red-400' : isFocused ? 'border-movyra-blue' : 'border-gray-100'
        }`}
      >
        
        {/* SECTION 3: Left Prefix Icon Container */}
        <div className="pl-4 py-4 pr-3 flex-shrink-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${
            isFocused ? 'bg-movyra-blue text-white shadow-md shadow-movyra-blue/20' : 'bg-blue-50 text-movyra-blue'
          }`}>
            <Box size={20} strokeWidth={2.5} />
          </div>
        </div>

        {/* SECTION 4: Core Input Element */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Tracking Number"
          disabled={isLoading}
          className="flex-1 py-5 bg-transparent font-black text-[17px] tracking-wide text-gray-900 placeholder:text-gray-300 placeholder:font-bold focus:outline-none disabled:opacity-50 min-w-0"
        />

        <div className="pr-3 flex items-center gap-2 flex-shrink-0">
          
          {/* SECTION 5: Dynamic Clear Action */}
          <AnimatePresence>
            {value.length > 0 && !isLoading && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.15 } }}
                type="button"
                onClick={handleClear}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 active:scale-90 transition-colors"
                aria-label="Clear input"
              >
                <X size={16} strokeWidth={3} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* SECTION 6: Submit/Loading Action Module */}
          <button
            type="submit"
            disabled={isLoading || value.length === 0}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
              value.length > 0
                ? 'bg-movyra-blue text-white shadow-md shadow-movyra-blue/30 active:scale-95'
                : 'bg-gray-100 text-gray-400'
            }`}
            aria-label="Search Tracking"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin text-white" />
            ) : (
              <Search size={20} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </motion.form>

      {/* Real-time Validation Feedback */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="flex items-center gap-2 px-4 text-red-500 overflow-hidden"
          >
            <AlertCircle size={14} strokeWidth={2.5} />
            <span className="text-sm font-bold">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}