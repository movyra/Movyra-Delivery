/**
 * ============================================================================
 * SERVICE: POCKETBASE COMPREHENSIVE KYC PIPELINE (mv-main)
 * Architecture: Pure Data Layer & External SDK Connection
 * Description: Securely connects to the dedicated Gradio PocketBase instance to 
 * process real-time multipart/form-data uploads encompassing live facial 
 * capture and dual-sided compliance documents.
 * ============================================================================
 */

import PocketBase from 'pocketbase';

// Strictly bind the network endpoint to the specified external workspace
const POCKETBASE_URL = 'https://movyra-mv-main-db-gradio.hf.space/';

// Initialize the PocketBase client targeting the external database
const pb = new PocketBase(POCKETBASE_URL);

// Disable auto-cancellation to ensure large multi-document uploads process completely
pb.autoCancellation(false);

/**
 * Executes a real-time multipart form data upload to the external PocketBase instance.
 * @param {string} userEmail - The registered email of the applicant.
 * @param {File} liveFaceFile - The captured live facial verification image.
 * @param {File} aadhaarFrontFile - The selected Aadhaar Front document.
 * @param {File} aadhaarBackFile - The selected Aadhaar Back document.
 * @param {File} panFrontFile - The selected PAN Front document.
 * @param {File} panBackFile - The selected PAN Back document.
 * @param {File} gstFile - The selected GST document.
 * @param {File} businessDocsFile - The selected Business Incorporation document.
 * @returns {Promise<Object>} - Returns the created database record on success.
 */
export const uploadVendorKYCDocuments = async (
  userEmail, 
  liveFaceFile, 
  aadhaarFrontFile, 
  aadhaarBackFile, 
  panFrontFile, 
  panBackFile, 
  gstFile, 
  businessDocsFile
) => {
  // 1. Strict Validation Guard
  if (!userEmail) {
    console.error('KYC Upload Aborted: Missing required tracking identifier (email).');
    throw new Error('A valid email address must be provided to proceed.');
  }

  try {
    // 2. Construct Multipart FormData Payload
    const formData = new FormData();
    
    // Append tracking identifier and initial status
    formData.append('email', userEmail);
    formData.append('kyc_status', 'pending');
    
    // Append real-time binary File objects dynamically if provided
    if (liveFaceFile) formData.append('live_face', liveFaceFile);
    if (aadhaarFrontFile) formData.append('aadhaar_front', aadhaarFrontFile);
    if (aadhaarBackFile) formData.append('aadhaar_back', aadhaarBackFile);
    if (panFrontFile) formData.append('pan_front', panFrontFile);
    if (panBackFile) formData.append('pan_back', panBackFile);
    if (gstFile) formData.append('gst_certificate', gstFile);
    if (businessDocsFile) formData.append('business_docs', businessDocsFile);

    // 3. Execute Secure Network Request to 'vendor_kyc' collection
    const record = await pb.collection('vendor_kyc').create(formData);
    
    return record;

  } catch (error) {
    console.error('Network Error during PocketBase KYC Upload:', error);
    throw error;
  }
};

/**
 * Retrieves the secure public URLs for a registered entity's complete KYC document suite.
 * @param {string} pbRecordId - The unique PocketBase record identifier stored in Firestore.
 * @returns {Promise<Object>} - An object containing the exact URLs for all submitted files.
 */
export const getKYCDocumentUrls = async (pbRecordId) => {
  if (!pbRecordId || pbRecordId === 'none') {
    throw new Error('Document Retrieval Aborted: Invalid or missing PocketBase Record ID.');
  }

  try {
    // 1. Execute precise network query to fetch the specific vendor record
    const record = await pb.collection('vendor_kyc').getOne(pbRecordId);

    // 2. Utilize the native SDK to construct secure absolute URLs based on hashed filenames
    const resolveUrl = (fileName) => fileName ? pb.files.getUrl(record, fileName) : null;

    return {
      email: record.email,
      kycStatus: record.kyc_status,
      liveFaceUrl: resolveUrl(record.live_face),
      aadhaarFrontUrl: resolveUrl(record.aadhaar_front),
      aadhaarBackUrl: resolveUrl(record.aadhaar_back),
      panFrontUrl: resolveUrl(record.pan_front),
      panBackUrl: resolveUrl(record.pan_back),
      gstUrl: resolveUrl(record.gst_certificate),
      businessDocsUrl: resolveUrl(record.business_docs)
    };

  } catch (error) {
    console.error('Network Error during PocketBase Document Retrieval:', error);
    throw error;
  }
};