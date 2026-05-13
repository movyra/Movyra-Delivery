/**
 * ============================================================================
 * SERVICE: POCKETBASE KYC PIPELINE & ARTIFACT RETRIEVAL (mv-main)
 * Architecture: Pure Data Layer & External SDK Connection
 * Description: Securely connects to the Hugging Face PocketBase instance to 
 * process real-time multipart/form-data uploads and retrieve document URLs.
 * ============================================================================
 */

import PocketBase from 'pocketbase';

// Strictly bind the network endpoint to the secure local environment variable
const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL;

if (!POCKETBASE_URL) {
  console.error('Critical System Error: VITE_POCKETBASE_URL environment variable is missing.');
}

// Initialize the PocketBase client
const pb = new PocketBase(POCKETBASE_URL);

// Disable auto-cancellation to ensure large document uploads process completely
pb.autoCancellation(false);

/**
 * Executes a real-time multipart form data upload to the PocketBase instance.
 * @param {string} userEmail - The registered email of the vendor.
 * @param {File} gstFile - The selected GST document File object.
 * @param {File} panFile - The selected PAN document File object.
 * @param {File} aadhaarFile - The selected Aadhaar document File object.
 * @returns {Promise<Object>} - Returns the created database record on success.
 */
export const uploadVendorKYCDocuments = async (userEmail, gstFile, panFile, aadhaarFile) => {
  // 1. Strict Validation Guard (Zero Mock Data Allowed)
  if (!userEmail || !gstFile || !panFile || !aadhaarFile) {
    console.error('KYC Upload Aborted: Missing required live document files or tracking identifier.');
    throw new Error('All official KYC documents must be provided to proceed.');
  }

  try {
    // 2. Construct Multipart FormData Payload
    const formData = new FormData();
    
    // Append tracking identifier and initial status
    formData.append('vendor_email', userEmail);
    formData.append('kyc_status', 'pending');
    
    // Append real-time binary File objects
    formData.append('gst_document', gstFile);
    formData.append('pan_document', panFile);
    formData.append('aadhaar_document', aadhaarFile);

    // 3. Execute Secure Network Request to 'vendor_kyc' collection
    const record = await pb.collection('vendor_kyc').create(formData);
    
    return record;

  } catch (error) {
    console.error('Network Error during PocketBase KYC Upload:', error);
    throw error;
  }
};

/**
 * Retrieves the secure public URLs for a registered entity's KYC documents.
 * @param {string} pbRecordId - The unique PocketBase record identifier stored in Firestore.
 * @returns {Promise<Object>} - An object containing the exact URLs for GST, PAN, and Aadhaar files.
 */
export const getKYCDocumentUrls = async (pbRecordId) => {
  if (!pbRecordId || pbRecordId === 'none') {
    throw new Error('Document Retrieval Aborted: Invalid or missing PocketBase Record ID.');
  }

  try {
    // 1. Execute precise network query to fetch the specific vendor record
    const record = await pb.collection('vendor_kyc').getOne(pbRecordId);

    // 2. Utilize the native SDK to construct the secure absolute URLs based on the hashed filenames
    const gstUrl = pb.files.getUrl(record, record.gst_document);
    const panUrl = pb.files.getUrl(record, record.pan_document);
    const aadhaarUrl = pb.files.getUrl(record, record.aadhaar_document);

    return {
      gstUrl,
      panUrl,
      aadhaarUrl,
      kycStatus: record.kyc_status
    };

  } catch (error) {
    console.error('Network Error during PocketBase Document Retrieval:', error);
    throw error;
  }
};