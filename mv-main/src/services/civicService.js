import { collection, addDoc, getDocs, query, where, updateDoc, doc, serverTimestamp, increment, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig'; 
import PocketBase from 'pocketbase';

/**
 * ============================================================================
 * MODULE: MOVYRA CIVIC DATA MANAGEMENT SERVICE
 * Features:
 * 1. Visual Evidence Processing (PocketBase)
 * 2. Automated Duplicate Complaint Detection (Geohash Proximity)
 * 3. Community Demand Aggregation (Support Counters)
 * 4. Civic Data Ingestion and Retrieval
 * ============================================================================
 */

// Initialize external document storage connection
// Utilizes environment variables for secure deployment across environments
const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090');

/**
 * Process and store visual evidence for civic complaints.
 * Transmits the file to the dedicated PocketBase storage container.
 * 
 * @param {File} file - The image or document evidence provided by the citizen.
 * @returns {Promise<string>} - The secure public URL of the uploaded document.
 */
export const uploadCivicEvidence = async (file) => {
    try {
        const formData = new FormData();
        formData.append('document', file);
        
        const record = await pb.collection('civic_evidence').create(formData);
        return pb.files.getUrl(record, record.document);
    } catch (error) {
        console.error("Visual evidence processing failed:", error);
        throw error;
    }
};

/**
 * Detect identical active complaints within the immediate geographic vicinity.
 * Utilizes Geohash prefix matching to establish a proximity boundary.
 * 
 * @param {string} geohashPrefix - The geographic coordinate hash for the location.
 * @param {string} category - The specific classification of the civic issue.
 * @returns {Promise<Array>} - A list of identical active complaints in the area.
 */
export const findNearbyDuplicate = async (geohashPrefix, category) => {
    try {
        const complaintsRef = collection(db, 'civic_complaints');
        
        // Execute a strict boundary query checking category, active status, and geographic proximity
        const duplicateQuery = query(
            complaintsRef,
            where('category', '==', category),
            where('status', 'in', ['Submitted', 'Reported', 'Assigned', 'In Progress']),
            where('geohash', '>=', geohashPrefix),
            where('geohash', '<=', geohashPrefix + '\uf8ff'),
            limit(5)
        );
        
        const snapshot = await getDocs(duplicateQuery);
        return snapshot.docs.map(document => ({ id: document.id, ...document.data() }));
    } catch (error) {
        console.error("Automated duplicate detection failed:", error);
        throw error;
    }
};

/**
 * Ingest a newly verified civic complaint into the master database.
 * Strictly isolates writes to the civic_complaints collection to prevent
 * unauthorized administrative access errors.
 * 
 * @param {Object} complaintData - The validated payload containing issue details and location.
 * @returns {Promise<string>} - The unique tracking identifier for the new record.
 */
export const submitCivicComplaint = async (complaintData) => {
    try {
        const complaintsRef = collection(db, 'civic_complaints');
        
        // Enforce safe payload parameters and ensure a valid public identifier
        const safePayload = {
            ...complaintData,
            userId: complaintData.userId || 'PUBLIC_CITIZEN',
            status: 'Submitted',
            supportCount: 1,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        
        const documentReference = await addDoc(complaintsRef, safePayload);
        
        return documentReference.id;
    } catch (error) {
        console.error("Complaint ingestion failed:", error);
        throw error;
    }
};

/**
 * Increment the community demand metric for an existing civic issue.
 * Utilizes atomic increments to ensure accurate counts during simultaneous interactions.
 * 
 * @param {string} complaintId - The unique tracking identifier of the existing issue.
 * @returns {Promise<boolean>} - Confirmation of successful aggregation.
 */
export const addCommunitySupport = async (complaintId) => {
    try {
        const complaintRef = doc(db, 'civic_complaints', complaintId);
        
        await updateDoc(complaintRef, {
            supportCount: increment(1),
            updatedAt: serverTimestamp()
        });
        
        return true;
    } catch (error) {
        console.error("Community demand aggregation failed:", error);
        throw error;
    }
};

/**
 * Retrieve the latest official announcements and administrative notices.
 * 
 * @returns {Promise<Array>} - A chronologically sorted list of active public notices.
 */
export const getPublicNotices = async () => {
    try {
        const noticesRef = collection(db, 'civic_notices');
        
        const noticeQuery = query(
            noticesRef, 
            orderBy('createdAt', 'desc'), 
            limit(10)
        );
        
        const snapshot = await getDocs(noticeQuery);
        return snapshot.docs.map(document => ({ id: document.id, ...document.data() }));
    } catch (error) {
        console.error("Notice retrieval failed:", error);
        throw error;
    }
};