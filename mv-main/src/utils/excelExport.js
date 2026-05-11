/**
 * ============================================================================
 * UTILITY: EXCEL EXPORT ENGINE (mv-main)
 * Architecture: Pure Data Transformation Utility
 * Dependencies: xlsx
 * Description: Transforms array of objects from Firestore into a formatted .xlsx
 * ============================================================================
 */

import * as XLSX from 'xlsx';

export const exportToExcel = (data, filename = 'Movyra_Waitlist_Export') => {
  // 1. Data Validation Guard
  if (!data || data.length === 0) {
    console.warn('Export aborted: No data provided to the export utility.');
    return false;
  }

  try {
    // 2. Format Data payload for Excel strict columns
    const formattedData = data.map((item, index) => ({
      '#': index + 1,
      'Registration ID': item.id || 'N/A',
      'Entity Name': item.name || 'Anonymous',
      'Contact Vector (Email)': item.email || 'N/A',
      'Contact Vector (Phone)': item.phone || 'N/A',
      'Requested Role': item.role || 'Unspecified',
      // Ensure timestamp handles both Firestore Objects and String formats
      'Ingestion Timestamp': item.timestamp || 
                             (item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : 'N/A')
    }));

    // 3. Initialize Workbook and Worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    
    // 4. Append Worksheet to Workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Waitlist Registry');

    // 5. Calculate dynamic filename with precise timestamp
    const dateStamp = new Date().toISOString().replace(/[:.]/g, '-');
    const finalFilename = `${filename}_${dateStamp}.xlsx`;

    // 6. Trigger Native Browser Download
    XLSX.writeFile(workbook, finalFilename);
    
    return true; // Indicate success
  } catch (error) {
    console.error('Critical Error during Excel Generation:', error);
    return false; // Indicate failure
  }
};