import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    updateDoc, 
    doc, 
    arrayUnion, 
    serverTimestamp,
    orderBy,
    limit
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

/**
 * ============================================================================
 * MOVYRA SAHAY - CENTRALIZED SERVICE LAYER
 * Handles core business logic for rescue operations, community verifications,
 * duplicate detection, and automated communication.
 * ============================================================================
 */

/**
 * Detects if a similar case already exists to prevent duplicate rescue dispatch.
 * Checks recent active cases in the same category within a basic location match.
 * 
 * @param {string} category - The rescue category.
 * @param {string} address - The address string provided by the user.
 * @returns {string|null} - Returns the ID of the duplicate case if found, else null.
 */
export const checkDuplicateCase = async (category, address) => {
    try {
        const casesRef = collection(db, 'sahay_cases');
        const q = query(
            casesRef, 
            where('category', '==', category),
            where('status', 'in', ['Reported', 'Verified', 'Assigned']),
            orderBy('createdAt', 'desc'),
            limit(10)
        );
        
        const snapshot = await getDocs(q);
        const addressLower = address.toLowerCase();

        for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            const existingAddress = (data.address || '').toLowerCase();
            
            // Basic proximity match using address text inclusion
            if (existingAddress.includes(addressLower) || addressLower.includes(existingAddress)) {
                return docSnap.id;
            }
        }
        return null;
    } catch (error) {
        console.error("Duplicate detection failed:", error);
        return null; // Proceed safely even if detection fails
    }
};

/**
 * Creates a new Sahay rescue case, checking for duplicates first.
 * 
 * @param {Object} caseData - The payload containing user, location, and case details.
 * @returns {Object} - Result object containing status and case ID.
 */
export const createSahayCase = async (caseData) => {
    try {
        const duplicateId = await checkDuplicateCase(caseData.category, caseData.address);
        
        if (duplicateId) {
            // Auto-confirm the existing case instead of creating a new one
            await confirmSahayCase(duplicateId, caseData.userId);
            return { status: 'merged', id: duplicateId };
        }

        const casesRef = collection(db, 'sahay_cases');
        const newCase = await addDoc(casesRef, {
            ...caseData,
            status: 'Reported',
            confirmedBy: [],
            privateNotes: [],
            createdAt: serverTimestamp()
        });

        return { status: 'created', id: newCase.id };
    } catch (error) {
        console.error("Failed to create Sahay case:", error);
        throw new Error("System error during case creation. Please try again.");
    }
};

/**
 * Appends a user ID to the community confirmation array of a specific case.
 * 
 * @param {string} caseId - The ID of the case to confirm.
 * @param {string} userId - The ID of the user confirming the case.
 */
export const confirmSahayCase = async (caseId, userId) => {
    try {
        const caseRef = doc(db, 'sahay_cases', caseId);
        await updateDoc(caseRef, {
            confirmedBy: arrayUnion(userId)
        });
        return true;
    } catch (error) {
        console.error("Failed to process confirmation:", error);
        throw new Error("System error during confirmation. Please try again.");
    }
};

/**
 * Triggers an automated email via the Firebase Mail Extension.
 * 
 * @param {Array<string>} recipientEmails - Target email addresses.
 * @param {string} subject - Email subject line.
 * @param {string} htmlContent - HTML formatted email body.
 */
export const sendSahayEmailNotification = async (recipientEmails, subject, htmlContent) => {
    try {
        const mailRef = collection(db, 'mail');
        await addDoc(mailRef, {
            to: recipientEmails,
            message: {
                subject: subject,
                html: htmlContent
            },
            createdAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Failed to trigger email notification:", error);
        throw new Error("System error during communication dispatch.");
    }
};

/**
 * Updates the operational status of a case.
 * 
 * @param {string} caseId - The ID of the case.
 * @param {string} newStatus - The target status (e.g., 'Closed').
 * @param {string} userId - The ID of the user performing the action.
 */
export const updateCaseStatus = async (caseId, newStatus, userId) => {
    try {
        const caseRef = doc(db, 'sahay_cases', caseId);
        const updatePayload = { status: newStatus };
        
        if (newStatus === 'Closed') {
            updatePayload.closedAt = serverTimestamp();
            updatePayload.closedBy = userId;
        } else if (newStatus === 'Assigned') {
            updatePayload.assignedAt = serverTimestamp();
            updatePayload.assignedToId = userId;
        }

        await updateDoc(caseRef, updatePayload);
        return true;
    } catch (error) {
        console.error("Failed to update case status:", error);
        throw new Error("System error during status update.");
    }
};