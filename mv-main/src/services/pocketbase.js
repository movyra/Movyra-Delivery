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