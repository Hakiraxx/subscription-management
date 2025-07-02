import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const testPDFExport = () => {
  try {
    console.log('Testing PDF export...');
    const doc = new jsPDF();
    
    // Test basic text
    doc.text('Test PDF', 20, 20);
    
    // Test autoTable
    console.log('Testing autoTable function...');
    console.log('doc.autoTable:', typeof doc.autoTable);
    
    if (typeof doc.autoTable === 'function') {
      doc.autoTable({
        head: [['Name', 'Email', 'Country']],
        body: [
          ['David', 'david@example.com', 'Sweden'],
          ['Castille', 'castille@example.com', 'Norway'],
        ],
        startY: 30,
      });
      console.log('autoTable test successful!');
    } else {
      console.error('doc.autoTable is not a function!');
      return false;
    }
    
    doc.save('test-pdf.pdf');
    return true;
  } catch (error) {
    console.error('PDF Test Error:', error);
    return false;
  }
};
