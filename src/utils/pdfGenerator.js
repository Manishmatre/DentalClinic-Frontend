  import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

/**
 * Generate a PDF receipt for a payment
 * @param {Object} receipt - The receipt data
 * @param {Object} clinicInfo - The clinic information
 * @returns {jsPDF} - The generated PDF document
 */
export const generateReceiptPDF = (receipt, clinicInfo = {}) => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Default clinic info if not provided
  const clinic = {
    name: clinicInfo.name || 'Your Clinic Name',
    address: clinicInfo.address || 'Clinic Address, City, State, PIN',
    phone: clinicInfo.phone || '+91 1234567890',
    email: clinicInfo.email || 'info@yourclinic.com',
    logo: clinicInfo.logo || null,
    gstNumber: clinicInfo.gstNumber || 'GSTIN: 27XXXXX1234X1Z5',
    ...clinicInfo
  };

  // Add clinic logo if available
  if (clinic.logo) {
    try {
      doc.addImage(clinic.logo, 'JPEG', 10, 10, 50, 30);
    } catch (error) {
      console.warn('Failed to add clinic logo to PDF', error);
    }
  }

  // Add clinic information
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(clinic.name, 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(clinic.address, 105, 25, { align: 'center' });
  doc.text(`Phone: ${clinic.phone} | Email: ${clinic.email}`, 105, 30, { align: 'center' });
  doc.text(clinic.gstNumber, 105, 35, { align: 'center' });

  // Add receipt title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT RECEIPT', 105, 45, { align: 'center' });
  
  // Add a horizontal line
  doc.setLineWidth(0.5);
  doc.line(10, 50, 200, 50);

  // Add receipt details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  
  // Left column
  doc.text('Receipt Number:', 10, 60);
  doc.text('Date:', 10, 65);
  doc.text('Invoice Number:', 10, 70);
  doc.text('Patient Name:', 10, 75);
  
  // Right column
  doc.text('Payment Method:', 105, 60);
  doc.text('Transaction ID:', 105, 65);
  doc.text('Payment Status:', 105, 70);
  
  // Left column values
  doc.setFont('helvetica', 'normal');
  doc.text(receipt.receiptNumber || 'REC-' + Math.random().toString(36).substring(2, 10).toUpperCase(), 50, 60);
  doc.text(format(new Date(receipt.paymentDate || new Date()), 'dd/MM/yyyy'), 50, 65);
  doc.text(receipt.invoiceNumber || 'INV-XXXX', 50, 70);
  doc.text(receipt.patientName || 'Patient Name', 50, 75);
  
  // Right column values
  doc.text(receipt.paymentMethod || 'Cash', 150, 60);
  doc.text(receipt.transactionId || receipt.upiId || receipt.chequeNumber || 'N/A', 150, 65);
  doc.text(receipt.paymentStatus || 'Paid', 150, 70);
  
  // Add a horizontal line
  doc.line(10, 85, 200, 85);
  
  // Add payment details table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Details', 105, 95, { align: 'center' });
  
  // Create the table
  const tableColumn = ['Description', 'Amount (₹)'];
  const tableRows = [
    ['Payment Amount', receipt.amount ? receipt.amount.toFixed(2) : '0.00'],
  ];
  
  // Add GST breakdown if available
  if (receipt.gstDetails) {
    if (receipt.gstDetails.cgst) {
      tableRows.push(['CGST', receipt.gstDetails.cgst.toFixed(2)]);
    }
    if (receipt.gstDetails.sgst) {
      tableRows.push(['SGST', receipt.gstDetails.sgst.toFixed(2)]);
    }
    if (receipt.gstDetails.igst) {
      tableRows.push(['IGST', receipt.gstDetails.igst.toFixed(2)]);
    }
  }
  
  // Add total row
  tableRows.push(['Total', receipt.amount ? receipt.amount.toFixed(2) : '0.00']);
  
  // Add the table
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 100,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 3,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [66, 66, 66],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 140 },
      1: { cellWidth: 40, halign: 'right' },
    },
  });
  
  // Get the final y position after the table
  const finalY = doc.autoTable.previous.finalY + 10;
  
  // Add amount in words
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Amount in words:', 10, finalY);
  doc.setFont('helvetica', 'normal');
  doc.text(numberToWords(receipt.amount || 0) + ' Rupees Only', 50, finalY);
  
  // Add notes if available
  if (receipt.notes) {
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 10, finalY + 10);
    doc.setFont('helvetica', 'normal');
    doc.text(receipt.notes, 10, finalY + 15);
  }
  
  // Add footer
  doc.setFontSize(8);
  doc.text('This is a computer-generated receipt and does not require a signature.', 105, 280, { align: 'center' });
  
  return doc;
};

/**
 * Generate a PDF invoice
 * @param {Object} invoice - The invoice data
 * @param {Object} clinicInfo - The clinic information
 * @returns {jsPDF} - The generated PDF document
 */
export const generateInvoicePDF = (invoice, clinicInfo = {}) => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Default clinic info if not provided
  const clinic = {
    name: clinicInfo.name || 'Your Clinic Name',
    address: clinicInfo.address || 'Clinic Address, City, State, PIN',
    phone: clinicInfo.phone || '+91 1234567890',
    email: clinicInfo.email || 'info@yourclinic.com',
    logo: clinicInfo.logo || null,
    gstNumber: clinicInfo.gstNumber || 'GSTIN: 27XXXXX1234X1Z5',
    ...clinicInfo
  };

  // Add clinic logo if available
  if (clinic.logo) {
    try {
      doc.addImage(clinic.logo, 'JPEG', 10, 10, 50, 30);
    } catch (error) {
      console.warn('Failed to add clinic logo to PDF', error);
    }
  }

  // Add clinic information
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(clinic.name, 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(clinic.address, 105, 25, { align: 'center' });
  doc.text(`Phone: ${clinic.phone} | Email: ${clinic.email}`, 105, 30, { align: 'center' });
  doc.text(clinic.gstNumber, 105, 35, { align: 'center' });

  // Add invoice title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', 105, 45, { align: 'center' });
  
  // Add a horizontal line
  doc.setLineWidth(0.5);
  doc.line(10, 50, 200, 50);

  // Add invoice details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  
  // Left column
  doc.text('Invoice Number:', 10, 60);
  doc.text('Date:', 10, 65);
  doc.text('Due Date:', 10, 70);
  doc.text('Patient Name:', 10, 75);
  doc.text('Patient ID:', 10, 80);
  
  // Right column
  doc.text('Payment Status:', 105, 60);
  doc.text('Payment Method:', 105, 65);
  doc.text('Doctor:', 105, 70);
  
  // Left column values
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.invoiceNumber || 'INV-XXXX', 50, 60);
  doc.text(format(new Date(invoice.date || new Date()), 'dd/MM/yyyy'), 50, 65);
  doc.text(format(new Date(invoice.dueDate || new Date()), 'dd/MM/yyyy'), 50, 70);
  doc.text(invoice.patientName || 'Patient Name', 50, 75);
  doc.text(invoice.patientId || 'PT-XXXX', 50, 80);
  
  // Right column values
  doc.text(invoice.paymentStatus || 'Unpaid', 150, 60);
  doc.text(invoice.paymentMethod || 'N/A', 150, 65);
  doc.text(invoice.doctorName || 'Dr. Name', 150, 70);
  
  // Add a horizontal line
  doc.line(10, 85, 200, 85);
  
  // Add invoice items table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Items', 105, 95, { align: 'center' });
  
  // Create the table
  const tableColumn = ['#', 'Description', 'HSN/SAC', 'Qty', 'Rate (₹)', 'GST %', 'Amount (₹)'];
  
  // Prepare table rows from invoice items
  const tableRows = (invoice.items || []).map((item, index) => [
    index + 1,
    item.description || 'Service',
    item.hsnSac || '',
    item.quantity || 1,
    item.rate ? item.rate.toFixed(2) : '0.00',
    item.gstRate ? `${item.gstRate}%` : '0%',
    item.amount ? item.amount.toFixed(2) : '0.00'
  ]);
  
  // If no items, add a placeholder row
  if (tableRows.length === 0) {
    tableRows.push([1, 'Medical Service', '', 1, '0.00', '0%', '0.00']);
  }
  
  // Add the table
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 100,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [66, 66, 66],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 60 },
      2: { cellWidth: 25 },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 20, halign: 'center' },
      6: { cellWidth: 25, halign: 'right' },
    },
  });
  
  // Get the final y position after the table
  const finalY = doc.autoTable.previous.finalY + 10;
  
  // Add summary table (subtotal, GST, total)
  const summaryColumn = ['', ''];
  const summaryRows = [
    ['Subtotal:', invoice.subtotal ? `₹${invoice.subtotal.toFixed(2)}` : '₹0.00'],
  ];
  
  // Add GST breakdown if available
  if (invoice.gstDetails) {
    if (invoice.gstDetails.cgst) {
      summaryRows.push(['CGST:', `₹${invoice.gstDetails.cgst.toFixed(2)}`]);
    }
    if (invoice.gstDetails.sgst) {
      summaryRows.push(['SGST:', `₹${invoice.gstDetails.sgst.toFixed(2)}`]);
    }
    if (invoice.gstDetails.igst) {
      summaryRows.push(['IGST:', `₹${invoice.gstDetails.igst.toFixed(2)}`]);
    }
  }
  
  // Add total and balance due
  summaryRows.push(['Total:', invoice.total ? `₹${invoice.total.toFixed(2)}` : '₹0.00']);
  summaryRows.push(['Amount Paid:', invoice.paidAmount ? `₹${invoice.paidAmount.toFixed(2)}` : '₹0.00']);
  summaryRows.push(['Balance Due:', invoice.balanceDue ? `₹${invoice.balanceDue.toFixed(2)}` : '₹0.00']);
  
  // Add the summary table
  doc.autoTable({
    head: [],
    body: summaryRows,
    startY: finalY,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 150, fontStyle: 'bold' },
      1: { cellWidth: 30, halign: 'right' },
    },
    margin: { left: 100 },
  });
  
  // Get the final y position after the summary table
  const summaryFinalY = doc.autoTable.previous.finalY + 10;
  
  // Add amount in words
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Amount in words:', 10, summaryFinalY);
  doc.setFont('helvetica', 'normal');
  doc.text(numberToWords(invoice.total || 0) + ' Rupees Only', 50, summaryFinalY);
  
  // Add terms and conditions
  doc.setFont('helvetica', 'bold');
  doc.text('Terms and Conditions:', 10, summaryFinalY + 10);
  doc.setFont('helvetica', 'normal');
  doc.text('1. Payment is due within 30 days.', 10, summaryFinalY + 15);
  doc.text('2. Please quote invoice number when making payment.', 10, summaryFinalY + 20);
  
  // Add footer
  doc.setFontSize(8);
  doc.text('This is a computer-generated invoice and does not require a signature.', 105, 280, { align: 'center' });
  
  return doc;
};

/**
 * Convert a number to words (Indian numbering system)
 * @param {Number} num - The number to convert
 * @returns {String} - The number in words
 */
const numberToWords = (num) => {
  const single = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const double = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const formatTens = (num) => {
    if (num < 10) return single[num];
    else if (num < 20) return double[num - 10];
    else {
      return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + single[num % 10] : '');
    }
  };
  
  // Handle decimal part
  let rupees = Math.floor(num);
  let paise = Math.round((num - rupees) * 100);
  
  let result = '';
  
  // Convert rupees to words (Indian numbering system)
  if (rupees === 0) {
    result = 'Zero';
  } else {
    // Handle crores (10 million)
    if (rupees >= 10000000) {
      result += formatTens(Math.floor(rupees / 10000000)) + ' Crore ';
      rupees %= 10000000;
    }
    
    // Handle lakhs (100 thousand)
    if (rupees >= 100000) {
      result += formatTens(Math.floor(rupees / 100000)) + ' Lakh ';
      rupees %= 100000;
    }
    
    // Handle thousands
    if (rupees >= 1000) {
      result += formatTens(Math.floor(rupees / 1000)) + ' Thousand ';
      rupees %= 1000;
    }
    
    // Handle hundreds
    if (rupees >= 100) {
      result += formatTens(Math.floor(rupees / 100)) + ' Hundred ';
      rupees %= 100;
    }
    
    // Handle tens and units
    if (rupees > 0) {
      result += formatTens(rupees);
    }
  }
  
  // Add paise if any
  if (paise > 0) {
    result += ' and ' + formatTens(paise) + ' Paise';
  }
  
  return result.trim();
};

export default {
  generateReceiptPDF,
  generateInvoicePDF
};
