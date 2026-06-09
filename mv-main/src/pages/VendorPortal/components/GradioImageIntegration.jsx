import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ============================================================================
 * COMPONENT: NATIVE PRODUCT IMAGE UPLOADER (mv-main)
 * Purpose: Replaces broken iframe with a direct API upload pipeline.
 * Behavior: Accepts local image files via drag-and-drop or click, transmits 
 * them to the PocketBase backend via REST API, and returns a public URL.
 * Structural Constraint: Strict zero emoji vector configuration.
 * Note: File kept original name to preserve router integrity.
 * ============================================================================
 */

export default function GradioImageIntegration() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ status: 'IDLE', message: '', link: '' }); // IDLE, SUCCESS, ERROR
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);

  // Handle Drag and Drop Interface Events
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
      setUploadStatus({ status: 'ERROR', message: 'Please select a valid image file (JPG, PNG, WEBP).', link: '' });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB Limit
      setUploadStatus({ status: 'ERROR', message: 'File size exceeds the 5MB limit.', link: '' });
      return;
    }

    setSelectedFile(file);
    setUploadStatus({ status: 'IDLE', message: '', link: '' });
    
    // Generate a temporary local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadStatus({ status: 'IDLE', message: '', link: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const executeDirectUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadStatus({ status: 'IDLE', message: '', link: '' });

    const uploadPayload = new FormData();
    uploadPayload.append('image_file', selectedFile);
    // Adding placeholder text fields required by your schema
    uploadPayload.append('product_name', selectedFile.name); 
    uploadPayload.append('vendor_id', 'vendor_upload');

    try {
      const response = await fetch('https://movyra-mv-main-db-gradio.hf.space/api/collections/product_images/records', {
        method: 'POST',
        body: uploadPayload
      });

      if (!response.ok) {
        throw new Error('Upload rejected by the storage server.');
      }

      const responseData = await response.json();
      
      // Construct the final public URL based on PocketBase standard routing
      const finalImageUrl = `https://movyra-mv-main-db-gradio.hf.space/api/files/${responseData.collectionId}/${responseData.id}/${responseData.image_file}`;

      setUploadStatus({ 
        status: 'SUCCESS', 
        message: 'Image uploaded successfully.', 
        link: finalImageUrl 
      });

    } catch (error) {
      console.error('Transmission Failure:', error);
      setUploadStatus({ status: 'ERROR', message: 'Network transmission failed. Please try again.', link: '' });
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = () => {
    if (uploadStatus.link) {
      navigator.clipboard.writeText(uploadStatus.link);
      alert("Image link copied to clipboard. You can now paste this into the Add New Product form.");
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6 md:p-10 relative overflow-y-auto bg-[#000000]">
      
      <div className="max-w-[800px] mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-[2rem] font-black tracking-tight leading-none mb-2 text-white">Upload Product Photos</h1>
          <p className="text-[#888888] text-[0.95rem]">Add high-quality images of your items to attract more customers.</p>
        </div>

        <AnimatePresence mode="wait">
          {uploadStatus.status !== 'IDLE' && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }}
              className={`w-full mb-6 p-4 rounded-xl border font-bold text-[0.85rem] flex items-center gap-3 ${
                uploadStatus.status === 'ERROR' 
                  ? 'bg-[#ff4444]/10 border-[#ff4444]/30 text-[#ff4444]' 
                  : 'bg-[#00ff88]/10 border-[#00ff88]/30 text-[#00ff88]'
              }`}
            >
              {uploadStatus.status === 'ERROR' ? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              )}
              {uploadStatus.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary Upload Interface */}
        <div className="w-full bg-[#050505] border border-[#1c1c1c] rounded-2xl p-6 md:p-8 flex flex-col shadow-2xl">
          
          {!previewUrl ? (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full h-[250px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                isDragging ? 'border-[#00ff88] bg-[#00ff88]/5' : 'border-[#222222] hover:border-[#444444] bg-[#111111]/50'
              }`}
            >
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke={isDragging ? '#00ff88' : '#444444'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 transition-colors duration-300"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              <span className="font-bold text-[1.1rem] mb-2 text-white">Click to select or drag and drop</span>
              <span className="text-[#666666] text-[0.8rem] font-medium">Supported formats: JPG, PNG, WEBP (Max 5MB)</span>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept="image/jpeg, image/png, image/webp" 
                className="hidden" 
              />
            </div>
          ) : (
            <div className="w-full flex flex-col md:flex-row gap-8 items-center">
              
              <div className="w-[200px] h-[200px] rounded-xl border border-[#222222] overflow-hidden shrink-0 bg-[#111111] flex items-center justify-center relative group">
                <img src={previewUrl} alt="Selected Product Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={handleClearSelection} className="bg-[#ff4444] text-white p-2 rounded-full hover:scale-110 transition-transform">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col w-full">
                <h3 className="font-bold text-[1.1rem] mb-1 truncate text-white">{selectedFile?.name}</h3>
                <span className="text-[#666666] text-[0.85rem] mb-6 font-mono">{(selectedFile?.size / 1024 / 1024).toFixed(2)} MB</span>
                
                {uploadStatus.status === 'SUCCESS' ? (
                  <div className="flex flex-col gap-3">
                    <div className="w-full bg-[#111111] border border-[#333333] p-3 rounded-xl flex items-center justify-between gap-3">
                      <span className="text-[#888888] text-[0.8rem] truncate font-mono select-all">{uploadStatus.link}</span>
                      <button 
                        onClick={copyToClipboard}
                        className="shrink-0 bg-white text-black px-4 py-2 rounded-lg font-bold text-[0.8rem] hover:bg-[#e0e0e0] transition-colors flex items-center gap-2"
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        Copy Link
                      </button>
                    </div>
                    <button onClick={handleClearSelection} className="text-[#666666] text-[0.85rem] font-bold hover:text-white transition-colors self-start mt-2">
                      Upload Another Image
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={executeDirectUpload}
                    disabled={isUploading}
                    className="w-full bg-[#00ff88] text-black h-12 rounded-xl font-black tracking-tight text-[1rem] hover:bg-[#00cc6a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        Uploading to Server...
                      </>
                    ) : (
                      <>
                        Confirm Upload
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      </>
                    )}
                  </button>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}