import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

/**
 * ============================================================================
 * COMPONENT: VENDOR PRODUCT ENTRY FORM (mv-main)
 * Purpose: Secure form to inject new inventory items into the global catalog.
 * Behavior: Enforces data validation, calls Gemini REST API for descriptions,
 * handles native physical image uploads to PocketBase, and writes authenticated 
 * payloads to Firestore in a single unified pipeline.
 * Structural Constraint: Strict zero emoji vector configuration. No simulations.
 * Uses clear business language without technical jargon.
 * ============================================================================
 */

export default function ProductEntryForm({ role, storeId }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    weight: '',
    category: '',
    description: '',
    variants: ''
  });

  // Native Image Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [systemFeedback, setSystemFeedback] = useState({ status: 'IDLE', message: '' }); // IDLE, SUCCESS, ERROR

  // Real-time API Integration for AI Content Generation
  const generateAIDescription = async () => {
    if (!formData.name || !formData.category) {
      setSystemFeedback({ status: 'ERROR', message: 'Product Name and Category are required to generate a description.' });
      return;
    }

    setIsGeneratingAI(true);
    setSystemFeedback({ status: 'IDLE', message: '' });

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setIsGeneratingAI(false);
      setSystemFeedback({ status: 'ERROR', message: 'AI Assistant is currently offline. Please write a description manually.' });
      return;
    }

    const promptText = `Write a concise, professional, and appealing 2-sentence product description for a grocery e-commerce app. The product is "${formData.name}", category is "${formData.category}", weight/unit is "${formData.weight || 'standard'}". Focus on quality and freshness. Do not use promotional buzzwords like "buy now".`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      });

      if (!response.ok) throw new Error("AI Endpoint connection failed.");

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text.trim();
      
      setFormData(prev => ({ ...prev, description: generatedText }));
      setSystemFeedback({ status: 'SUCCESS', message: 'Description generated successfully.' });
    } catch (error) {
      console.error("AI Generation Failure:", error);
      setSystemFeedback({ status: 'ERROR', message: 'AI failed to generate a description. Please try again or write it manually.' });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Drag and Drop Image Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFileSelection(e.target.files[0]);
    }
  };

  const processFileSelection = (file) => {
    if (!file.type.startsWith('image/')) {
      setSystemFeedback({ status: 'ERROR', message: 'Please select a valid image file (JPG, PNG, WEBP).' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB Limit
      setSystemFeedback({ status: 'ERROR', message: 'File size exceeds the 5MB limit.' });
      return;
    }

    setSelectedFile(file);
    setSystemFeedback({ status: 'IDLE', message: '' });
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const clearImageSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Unified Publish Pipeline (Upload Image -> Write to Firestore)
  const handlePublish = async (e) => {
    e.preventDefault();
    if (!storeId) {
      setSystemFeedback({ status: 'ERROR', message: 'Your account is not linked to a store. Cannot save product.' });
      return;
    }

    setIsSubmitting(true);
    setSystemFeedback({ status: 'IDLE', message: '' });

    try {
      let finalImageUrl = '';

      // Phase 1: Upload Physical Asset to PocketBase
      if (selectedFile) {
        setSystemFeedback({ status: 'IDLE', message: 'Uploading image asset...' });
        const uploadPayload = new FormData();
        uploadPayload.append('image_file', selectedFile);
        uploadPayload.append('product_name', formData.name);
        uploadPayload.append('vendor_id', storeId);

        const pbResponse = await fetch('https://movyra-mv-main-db-gradio.hf.space/api/collections/product_images/records', {
          method: 'POST',
          body: uploadPayload
        });

        if (!pbResponse.ok) {
          throw new Error('Image upload rejected by the storage server.');
        }

        const pbData = await pbResponse.json();
        finalImageUrl = `https://movyra-mv-main-db-gradio.hf.space/api/files/${pbData.collectionId}/${pbData.id}/${pbData.image_file}`;
      }

      // Phase 2: Write Complete Payload to Firestore
      setSystemFeedback({ status: 'IDLE', message: 'Writing to global database...' });
      
      const variantArray = formData.variants 
        ? formData.variants.split(',').map(v => v.trim()).filter(Boolean) 
        : [];

      const dbPayload = {
        name: formData.name,
        price: Number(formData.price),
        weight: formData.weight,
        category: formData.category,
        description: formData.description,
        variants: variantArray,
        imageUrl: finalImageUrl, 
        storeId: storeId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isTodaysChoice: false
      };

      await addDoc(collection(db, 'products'), dbPayload);

      setSystemFeedback({ status: 'SUCCESS', message: 'Product added to your store successfully.' });
      
      // Reset Form State
      setFormData({ name: '', price: '', weight: '', category: '', description: '', variants: '' });
      clearImageSelection();

      setTimeout(() => setSystemFeedback({ status: 'IDLE', message: '' }), 5000);
    } catch (error) {
      console.error("Pipeline Execution Failure:", error);
      setSystemFeedback({ status: 'ERROR', message: 'Failed to add product. Please verify your connection and permissions.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6 md:p-10 relative overflow-y-auto">
      
      <div className="max-w-[800px] mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-[2rem] font-black tracking-tight leading-none mb-2">Add New Product</h1>
          <p className="text-[#888888] text-[0.95rem]">Fill out the details below to add a new item to your store.</p>
        </div>

        <AnimatePresence mode="wait">
          {systemFeedback.status !== 'IDLE' && systemFeedback.message !== '' && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }}
              className={`w-full mb-6 p-4 rounded-xl border font-bold text-[0.85rem] flex items-center gap-3 ${
                systemFeedback.status === 'ERROR' 
                  ? 'bg-[#ff4444]/10 border-[#ff4444]/30 text-[#ff4444]' 
                  : systemFeedback.status === 'SUCCESS'
                    ? 'bg-[#00ff88]/10 border-[#00ff88]/30 text-[#00ff88]'
                    : 'bg-[#111111] border-[#333333] text-white' // Loading state color
              }`}
            >
              {systemFeedback.status === 'ERROR' ? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              ) : systemFeedback.status === 'SUCCESS' ? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              ) : (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {systemFeedback.message}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handlePublish} className="w-full bg-[#050505] border border-[#1c1c1c] rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl">
          
          {/* Native Image Uploader Section */}
          <div className="w-full border-b border-[#1c1c1c] pb-6">
            <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-[#666666] mb-3">Product Photo (Optional)</label>
            
            {!previewUrl ? (
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full h-[180px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                  isDragging ? 'border-[#00ff88] bg-[#00ff88]/5' : 'border-[#333333] hover:border-[#666666] bg-[#111111]'
                }`}
              >
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke={isDragging ? '#00ff88' : '#666666'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 transition-colors duration-300"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                <span className="font-bold text-[0.95rem] mb-1 text-white">Click to select or drag and drop</span>
                <span className="text-[#666666] text-[0.75rem] font-medium">Supported formats: JPG, PNG, WEBP (Max 5MB)</span>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/jpeg, image/png, image/webp" className="hidden" />
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <div className="w-[120px] h-[120px] rounded-xl border border-[#333333] overflow-hidden shrink-0 bg-[#111111] flex items-center justify-center relative group">
                  <img src={previewUrl} alt="Selected Product Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={clearImageSelection} className="bg-[#ff4444] text-white p-2 rounded-full hover:scale-110 transition-transform">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                </div>
                <div className="flex flex-col">
                  <h3 className="font-bold text-[0.95rem] text-white mb-1 truncate max-w-[300px]">{selectedFile?.name}</h3>
                  <span className="text-[#666666] text-[0.8rem] font-mono mb-3">{(selectedFile?.size / 1024 / 1024).toFixed(2)} MB</span>
                  <button type="button" onClick={clearImageSelection} className="text-[#ff4444] text-[0.8rem] font-bold hover:text-[#ff6666] transition-colors self-start">
                    Remove Image
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-[#666666] mb-2">Product Name <span className="text-[#ff4444]">*</span></label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Organic Avocados"
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                className="w-full bg-[#111111] border border-[#333333] text-white px-4 py-3.5 rounded-xl outline-none focus:border-[#00ff88] transition-colors text-[0.95rem]" 
              />
            </div>
            
            <div>
              <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-[#666666] mb-2">Category <span className="text-[#ff4444]">*</span></label>
              <div className="relative">
                <select 
                  required 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})} 
                  className="w-full bg-[#111111] border border-[#333333] text-white px-4 py-3.5 rounded-xl outline-none focus:border-[#00ff88] transition-colors text-[0.95rem] appearance-none"
                >
                  <option value="" disabled>Select a Category</option>
                  <option value="Produce">Produce</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Meats">Meats</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Pantry">Pantry</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Beverages">Beverages</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#666666]">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-[#666666] mb-2">Price (INR) <span className="text-[#ff4444]">*</span></label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888] font-bold">₹</div>
                <input 
                  type="number" 
                  required 
                  min="0" 
                  step="0.01" 
                  placeholder="0.00"
                  value={formData.price} 
                  onChange={e => setFormData({...formData, price: e.target.value})} 
                  className="w-full bg-[#111111] border border-[#333333] text-white pl-8 pr-4 py-3.5 rounded-xl outline-none focus:border-[#00ff88] transition-colors text-[0.95rem]" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-[#666666] mb-2">Weight or Quantity <span className="text-[#ff4444]">*</span></label>
              <input 
                type="text" 
                required 
                placeholder="e.g. 500g, 1L, 1 Dozen"
                value={formData.weight} 
                onChange={e => setFormData({...formData, weight: e.target.value})} 
                className="w-full bg-[#111111] border border-[#333333] text-white px-4 py-3.5 rounded-xl outline-none focus:border-[#00ff88] transition-colors text-[0.95rem]" 
              />
            </div>
          </div>

          <div className="border-t border-[#1c1c1c] pt-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-[#666666]">Product Description <span className="text-[#ff4444]">*</span></label>
              
              <button 
                type="button" 
                onClick={generateAIDescription}
                disabled={isGeneratingAI || isSubmitting}
                className="flex items-center gap-1.5 text-[0.75rem] font-bold text-[#00ff88] hover:text-white transition-colors disabled:opacity-50"
              >
                {isGeneratingAI ? (
                  <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                )}
                {isGeneratingAI ? 'Generating...' : 'Auto-Generate Details'}
              </button>
            </div>
            <textarea 
              required
              rows="4"
              placeholder="Describe the product..."
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              className="w-full bg-[#111111] border border-[#333333] text-white px-4 py-3.5 rounded-xl outline-none focus:border-[#00ff88] transition-colors text-[0.95rem] resize-none" 
            />
          </div>

          <div>
            <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-[#666666] mb-2">Size Options (Optional)</label>
            <input 
              type="text" 
              placeholder="Comma separated (e.g. 250g, 500g, 1Kg)"
              value={formData.variants} 
              onChange={e => setFormData({...formData, variants: e.target.value})} 
              className="w-full bg-[#111111] border border-[#333333] text-white px-4 py-3.5 rounded-xl outline-none focus:border-[#00ff88] transition-colors text-[0.95rem]" 
            />
          </div>

          <div className="pt-4 border-t border-[#1c1c1c]">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-white text-black h-14 rounded-xl font-black tracking-tight text-[1.05rem] hover:bg-[#e0e0e0] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Processing Upload...
                </>
              ) : (
                <>
                  Add to Store
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}