/**
 * Movyra PocketBase Integration Client
 * Centralized service for handling external media uploads.
 */

const POCKETBASE_URL = 'https://movyra-mv-main-db-gradio.hf.space';

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

/**
 * Uploads organization verification documents and profile photo.
 * @param {string} applicationId - The anonymously generated application ID.
 * @param {string} orgName - The name of the organization.
 * @param {File} idDocumentFile - The verification ID document (Aadhar, PAN, etc.).
 * @param {File} orgPhotoFile - The organization's profile picture or logo.
 * @returns {Promise<Object>} An object containing the secure URLs for both uploaded files.
 */
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

/**
 * Uploads media evidence (photos and videos) anonymously for Movyra Civic public reports.
 * @param {File} file - The raw photo or video file.
 * @param {string} [complaintId] - Optional associated civic complaint document ID.
 * @param {string} [category] - Optional category tag.
 * @returns {Promise<string>} Static URL pointing to the uploaded media asset.
 */
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