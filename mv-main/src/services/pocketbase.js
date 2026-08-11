/**
 * Movyra PocketBase Integration Client
 * Centralized service for handling external media uploads and real-time dashboard data synchronization.
 */

import PocketBase from 'pocketbase';

const POCKETBASE_URL = 'https://movyra-mv-main-db-gradio.hf.space';
const pb = new PocketBase(POCKETBASE_URL);

// ============================================================================
// EXISTING MEDIA & REGISTRATION UPLOAD FUNCTIONS (STRICTLY UNTOUCHED)
// ============================================================================

export const uploadSahayMedia = async (file, caseId, photoType, uploaderType) => {
    try {
        const formData = new FormData();
        formData.append('photo', file);
        if (caseId) formData.append('case_id', caseId);
        if (photoType) formData.append('photo_type', photoType);
        if (uploaderType) formData.append('uploaded_by_type', uploaderType);

        const response = await fetch(`${POCKETBASE_URL}/api/collections/sahay_media/records`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const exactMessage = errorData.message || 'Media upload communication failed.';
            throw new Error(`PocketBase Rejected: ${exactMessage}`);
        }

        const record = await response.json();
        return `${POCKETBASE_URL}/api/files/${record.collectionId}/${record.id}/${record.photo}`;
    } catch (error) {
        console.error('PocketBase Upload Error:', error);
        throw error;
    }
};

export const uploadVolunteerVerification = async (caseId, volunteerName, volunteerMobile, volunteerEmail, volunteerPhotoFile, needyPhotoFile) => {
    try {
        const formData = new FormData();
        formData.append('case_id', caseId);
        formData.append('volunteer_name', volunteerName);
        formData.append('volunteer_mobile', volunteerMobile);
        if (volunteerEmail) formData.append('volunteer_email', volunteerEmail);
        formData.append('volunteer_photo', volunteerPhotoFile);
        formData.append('needy_photo', needyPhotoFile);
        formData.append('verification_status', 'pending');

        const response = await fetch(`${POCKETBASE_URL}/api/collections/volunteer_verifications/records`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const exactMessage = errorData.message || 'Verification record upload failed.';
            throw new Error(`PocketBase Rejected: ${exactMessage}`);
        }

        const record = await response.json();
        
        return {
            recordId: record.id,
            volunteerPhotoUrl: `${POCKETBASE_URL}/api/files/${record.collectionId}/${record.id}/${record.volunteer_photo}`,
            needyPhotoUrl: `${POCKETBASE_URL}/api/files/${record.collectionId}/${record.id}/${record.needy_photo}`
        };
    } catch (error) {
        console.error('PocketBase Verification Error:', error);
        throw error;
    }
};

export const uploadUserProfilePicture = async (userId, avatarFile) => {
    try {
        const formData = new FormData();
        formData.append('user_id', userId);
        formData.append('avatar', avatarFile);

        const response = await fetch(`${POCKETBASE_URL}/api/collections/user_avatars/records`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const exactMessage = errorData.message || 'Avatar upload communication failed.';
            throw new Error(`PocketBase Rejected: ${exactMessage}`);
        }

        const record = await response.json();
        return `${POCKETBASE_URL}/api/files/${record.collectionId}/${record.id}/${record.avatar}`;
    } catch (error) {
        console.error('PocketBase Avatar Upload Error:', error);
        throw error;
    }
};

export const uploadOrganizationVerification = async (applicationId, orgName, idDocumentFile, orgPhotoFile) => {
    try {
        const formData = new FormData();
        formData.append('application_id', applicationId);
        formData.append('organization_name', orgName);
        formData.append('id_document', idDocumentFile);
        formData.append('org_photo', orgPhotoFile);
        formData.append('verification_status', 'pending');

        const response = await fetch(`${POCKETBASE_URL}/api/collections/organization_verifications/records`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const exactMessage = errorData.message || 'Organization verification upload failed.';
            throw new Error(`PocketBase Rejected: ${exactMessage}`);
        }

        const record = await response.json();
        
        return {
            recordId: record.id,
            idDocumentUrl: `${POCKETBASE_URL}/api/files/${record.collectionId}/${record.id}/${record.id_document}`,
            orgPhotoUrl: `${POCKETBASE_URL}/api/files/${record.collectionId}/${record.id}/${record.org_photo}`
        };
    } catch (error) {
        console.error('PocketBase Organization Verification Error:', error);
        throw error;
    }
};

export const uploadCivicMedia = async (file, complaintId, category) => {
    try {
        const formData = new FormData();
        formData.append('media', file);
        if (complaintId) formData.append('complaint_id', complaintId);
        if (category) formData.append('category', category);

        const response = await fetch(`${POCKETBASE_URL}/api/collections/civic_media/records`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const exactMessage = errorData.message || 'Civic media upload communication failed.';
            throw new Error(`PocketBase Rejected: ${exactMessage}`);
        }

        const record = await response.json();
        return `${POCKETBASE_URL}/api/files/${record.collectionId}/${record.id}/${record.media}`;
    } catch (error) {
        console.error('PocketBase Civic Media Upload Error:', error);
        throw error;
    }
};

export const createNgoUserAccount = async (payload, langCode = 'en') => {
    try {
        const requestBody = {
            email: payload.email,
            password: payload.password,
            passwordConfirm: payload.password,
            org_name: payload.org_name || payload.orgName,
            contact: payload.contact,
            plan_type: payload.selectedPlan || 'Free Plan',
            payu_txn_id: payload.txnId || 'FREE_TXN',
            status: 'Active'
        };

        const response = await fetch(`${POCKETBASE_URL}/api/collections/ngo_users/records`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            const TRANSLATIONS = {
                en: "Registration failed. Please check your details.",
                hi: "पंजीकरण विफल रहा। कृपया अपना विवरण जांचें।",
                hinglish: "Registration fail ho gaya. Details check karein.",
                mr: "नोंदणी अयशस्वी. कृपया तुमचे तपशील तपासा.",
                gu: "નોંધણી નિષ્ફળ. કૃપા કરીને તમારી વિગતો તપાસો.",
                te: "నమోదు విఫలమైంది. దయచేసి మీ వివరాలను తనిఖీ చేయండి.",
                ta: "பதிவு தோல்வியடைந்தது. உங்கள் விவரங்களை சரிபார்க்கவும்.",
                pa: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਵੇਰਵਿਆਂ ਦੀ ਜਾਂਚ ਕਰੋ।",
                bho: "पंजीकरण विफल हो गइल। कृपया आपन विवरण जांचीं।",
                bn: "নিবন্ধন ব্যর্থ হয়েছে। আপনার বিবরণ চেক করুন।",
                kn: "ನೋಂದಣಿ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
                ml: "രജിസ്ട്രേഷൻ പരാജയപ്പെട്ടു. നിങ്ങളുടെ വിവരങ്ങൾ പരിശോധിക്കുക.",
                or: "ପଞ୍ଜିକରଣ ବିଫଳ ହୋଇଛି। ଦୟାକରି ଆପଣଙ୍କର ବିବରଣୀ ଯାଞ୍ଚ କରନ୍ତୁ।",
                as: "পঞ্জীয়ন বিফল হৈছে। অনুগ্ৰহ কৰি আপোনাৰ বিৱৰণ পৰীক্ষা কৰক।"
            };

            let exactMessage = TRANSLATIONS[langCode] || TRANSLATIONS['en'];

            if (errorData.data) {
                const invalidFields = Object.keys(errorData.data);
                if (invalidFields.length > 0) {
                    const firstField = invalidFields[0];
                    const detail = errorData.data[firstField].message;
                    exactMessage = `Database Error (${firstField}): ${detail}`;
                }
            }
            
            throw new Error(exactMessage);
        }

        return await response.json();
    } catch (error) {
        console.error('PocketBase NGO User Creation Error:', error);
        throw error;
    }
};

// ============================================================================
// NEW: MASSIVE CROSS-PLATFORM DATA FETCHING & REAL-TIME SSE SUBSCRIPTIONS
// Purpose: To feed the SevaSetu Master Organization Dashboard
// ============================================================================

/**
 * Generic Fetcher for Initial Data Load
 * STRICT FIX: Added { requestKey: null } to disable auto-cancellation (Error 0 fix).
 * Wrapped in a strict catch block that always returns an empty array on 403/404 errors.
 */
export const fetchCollectionData = async (collectionName) => {
    try {
        const records = await pb.collection(collectionName).getList(1, 50, {
            sort: '-created',
            requestKey: null
        });
        return records.items;
    } catch (error) {
        console.error(`Failed to fetch ${collectionName}:`, error);
        return [];
    }
};

/**
 * Live Server-Sent Events (SSE) Subscription Engine.
 * Attaches a listener to a specific PocketBase collection and fires the callback on any Create/Update/Delete.
 * @param {string} collectionName - Target PB collection (e.g., 'civic_reports')
 * @param {function} callback - Function to execute when data changes
 * @returns {function} Unsubscribe function to prevent memory leaks
 */
export const subscribeToCollection = (collectionName, callback) => {
    try {
        pb.collection(collectionName).subscribe('*', function (e) {
            callback(e);
        });
        
        // Return cleanup function
        return () => {
            pb.collection(collectionName).unsubscribe('*');
        };
    } catch (error) {
        console.error(`Subscription failed for ${collectionName}:`, error);
        return () => {}; // Return empty function on fail
    }
};

// ============================================================================
// DEDICATED FETCHERS FOR ALL TARGET COLLECTIONS
// STRICT FIX: Remapped 'sahay_cases' -> 'volunteer_verifications'
// STRICT FIX: Remapped 'civic_complaints' -> 'civic_reports'
// ============================================================================

export const fetchVolunteerVerifications = () => fetchCollectionData('volunteer_verifications');
export const fetchSevaSetuWaitlist = () => fetchCollectionData('sevasetu_waitlist');
export const fetchSevaSetuAdminRequests = () => fetchCollectionData('sevasetu_admin_requests');
export const fetchSahayMedia = () => fetchCollectionData('sahay_media');
export const fetchSahayCases = () => fetchCollectionData('volunteer_verifications'); // Base Sahay proxy
export const fetchOrganizationVerifications = () => fetchCollectionData('organization_verifications');
export const fetchNagrikEvidence = () => fetchCollectionData('nagrik_evidence');
export const fetchCivicReports = () => fetchCollectionData('civic_reports'); // Standard Civic Schema
export const fetchCivicMedia = () => fetchCollectionData('civic_media');
export const fetchNgoUsers = () => fetchCollectionData('ngo_users');
export const fetchCareerApplications = () => fetchCollectionData('career_applications');

// Export the raw client for edge-case direct queries if needed in the UI
export const pocketbaseClient = pb;