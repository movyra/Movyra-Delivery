import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * ============================================================================
 * COMPONENT: VENDOR GRADIO AI VISION INTEGRATION (mv-main)
 * Purpose: Securely embeds the external Hugging Face Gradio environment.
 * Behavior: Renders an authorized iframe with clipboard read/write capabilities
 * to allow seamless asset generation and transfer.
 * Structural Constraint: Strict zero emoji vector configuration.
 * ============================================================================
 */

export default function GradioImageIntegration() {
  const [isEngineLoading, setIsEngineLoading] = useState(true);

  return (
    <div className="w-full h-full flex flex-col p-6 md:p-10 relative overflow-hidden bg-[#000000]">
      
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-[2rem] font-black tracking-tight leading-none mb-2 text-white">AI Vision Engine</h1>
        <p className="text-[#888888] text-[0.95rem]">Synthesize and process high-fidelity product assets using the integrated neural deployment space.</p>
      </div>

      <div className="w-full flex-1 bg-[#050505] border border-[#1c1c1c] rounded-[24px] relative overflow-hidden shadow-[0_0_50px_rgba(0,255,136,0.02)]">
        
        {/* Secure Loading State Overlay */}
        {isEngineLoading && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#050505] backdrop-blur-md"
          >
            <div className="w-10 h-10 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(0,255,136,0.5)]"></div>
            <span className="text-[#666666] text-[0.85rem] uppercase tracking-widest font-bold">Establishing Secure Neural Link</span>
            <span className="text-[#444444] text-[0.7rem] font-mono mt-2">Target: movyra-mv-main-db-gradio.hf.space</span>
          </motion.div>
        )}

        {/* External Space Iframe Execution */}
        <iframe
          src="https://movyra-mv-main-db-gradio.hf.space"
          title="Movyra AI Vision Integration"
          className={`w-full h-full border-0 relative z-20 transition-opacity duration-700 ${isEngineLoading ? 'opacity-0' : 'opacity-100'}`}
          allow="camera; microphone; clipboard-write; clipboard-read;"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
          onLoad={() => setIsEngineLoading(false)}
        ></iframe>

      </div>

      {/* Operational Disclaimer */}
      <div className="mt-4 flex-shrink-0 flex items-center justify-between border-t border-[#111111] pt-4">
        <div className="flex items-center gap-2 text-[#666666] text-[0.75rem] font-bold uppercase tracking-widest">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          End-to-End Encrypted Tunnel
        </div>
        <span className="text-[#444444] text-[0.7rem] font-mono">
          Model execution operates strictly within external container limits.
        </span>
      </div>

    </div>
  );
}