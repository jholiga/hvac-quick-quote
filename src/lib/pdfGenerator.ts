import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quote, BusinessSettings } from '@/types/quote';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Helper to wrap text cleanly
const wrapText = (doc: jsPDF, text: string, maxWidth: number): string[] => {
  if (!text) return [];
  return doc.splitTextToSize(text, maxWidth);
};

export const generatePDF = (quote: Quote, settings: BusinessSettings): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // Colors - clean professional scheme
  const primaryColor: [number, number, number] = [37, 99, 235];
  const darkColor: [number, number, number] = [30, 41, 59];
  const grayColor: [number, number, number] = [100, 116, 139];
  const lightGray: [number, number, number] = [248, 250, 252];
  const borderColor: [number, number, number] = [226, 232, 240];

  // ===== HEADER SECTION =====
  // Top accent bar
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 3, 'F');

  // Business info - Left side
  doc.setFontSize(18);
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.businessName, margin, y);
  
  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  
  if (settings.phone) {
    doc.text(settings.phone, margin, y);
    y += 4;
  }
  if (settings.email) {
    doc.text(settings.email, margin, y);
  }

  // Quote badge - Right side
  const badgeWidth = 45;
  const badgeX = pageWidth - margin - badgeWidth;
  const badgeY = 14;
  
  doc.setFillColor(...lightGray);
  doc.roundedRect(badgeX, badgeY, badgeWidth, 18, 2, 2, 'F');
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.3);
  doc.roundedRect(badgeX, badgeY, badgeWidth, 18, 2, 2, 'S');
  
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTE', badgeX + badgeWidth / 2, badgeY + 6, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(...darkColor);
  doc.text(quote.quoteNumber, badgeX + badgeWidth / 2, badgeY + 13, { align: 'center' });

  // Date below badge
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  doc.setFont('helvetica', 'normal');
  const dateStr = new Date(quote.createdAt).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(dateStr, pageWidth - margin, badgeY + 24, { align: 'right' });

  y = 44;

  // Divider line
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);

  y += 10;

  // ===== CUSTOMER INFO BOX =====
  const customerBoxHeight = 30;
  doc.setFillColor(...lightGray);
  doc.roundedRect(margin, y, contentWidth, customerBoxHeight, 3, 3, 'F');

  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.setFont('helvetica', 'bold');
  doc.text('PREPARED FOR', margin + 8, y + 8);

  doc.setFontSize(12);
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.text(quote.customerName, margin + 8, y + 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  
  // Contact info on right side of box
  let contactX = pageWidth - margin - 8;
  let contactY = y + 10;
  
  if (quote.customerPhone) {
    doc.text(quote.customerPhone, contactX, contactY, { align: 'right' });
    contactY += 5;
  }
  if (quote.customerEmail) {
    doc.text(quote.customerEmail, contactX, contactY, { align: 'right' });
  }

  y += customerBoxHeight + 12;

  // ===== JOB TITLE =====
  if (quote.jobTitle) {
    doc.setFontSize(13);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(quote.jobTitle, margin, y);
    y += 8;
  }

  // ===== SCOPE OF WORK =====
  if (quote.scopeOfWork) {
    doc.setFontSize(10);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'normal');
    
    const scopeLines = wrapText(doc, quote.scopeOfWork, contentWidth);
    
    // Check if we need more space
    const scopeHeight = scopeLines.length * 5;
    if (y + scopeHeight > pageHeight - 80) {
      doc.addPage();
      y = 20;
    }
    
    doc.text(scopeLines, margin, y);
    y += scopeHeight + 10;
  }

  // ===== CALCULATE TOTALS =====
  let subtotal = 0;
  if (quote.isLumpSum) {
    subtotal = quote.lumpSumPrice || 0;
  } else {
    subtotal = quote.lineItems.reduce((sum, item) => {
      const base = item.quantity * item.unitPrice;
      return sum + (item.applyMarkup ? base * settings.defaultMarkup : base);
    }, 0);
  }
  const tax = subtotal * ((quote.taxRate || 0) / 100);
  const total = subtotal + tax;

  // ===== PRICING SECTION =====
  if (quote.isLumpSum) {
    // Lump Sum Display - Clean centered box
    const boxHeight = 45;
    
    // Check page space
    if (y + boxHeight > pageHeight - 60) {
      doc.addPage();
      y = 20;
    }
    
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, boxHeight, 4, 4, 'F');
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.8);
    doc.roundedRect(margin, y, contentWidth, boxHeight, 4, 4, 'S');

    doc.setFontSize(9);
    doc.setTextColor(...grayColor);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'Total price includes all HVAC parts, materials, and labor as described.',
      pageWidth / 2, 
      y + 12, 
      { align: 'center' }
    );

    doc.setFontSize(22);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(total), pageWidth / 2, y + 30, { align: 'center' });

    y += boxHeight + 15;
  } else {
    // Itemized Table
    const tableData = quote.lineItems.map(item => {
      const unitWithMarkup = item.unitPrice * (item.applyMarkup ? settings.defaultMarkup : 1);
      const lineTotal = item.quantity * unitWithMarkup;
      
      // Wrap long descriptions
      const description = item.description.length > 50 
        ? item.description.substring(0, 47) + '...'
        : item.description;
      
      return [
        description,
        item.quantity.toString(),
        formatCurrency(unitWithMarkup),
        formatCurrency(lineTotal),
      ];
    });

    // Check page space for table
    if (y + 40 > pageHeight - 80) {
      doc.addPage();
      y = 20;
    }

    autoTable(doc, {
      startY: y,
      head: [['Description', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        cellPadding: 5,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: darkColor,
        cellPadding: 4,
        lineColor: borderColor,
        lineWidth: 0.2,
      },
      alternateRowStyles: {
        fillColor: [252, 252, 253],
      },
      columnStyles: {
        0: { cellWidth: 'auto', overflow: 'linebreak' },
        1: { cellWidth: 18, halign: 'center' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 32, halign: 'right' },
      },
      didDrawPage: (data) => {
        // Add header accent on new pages
        if (data.pageNumber > 1) {
          doc.setFillColor(...primaryColor);
          doc.rect(0, 0, pageWidth, 3, 'F');
        }
      },
    });

    y = (doc as any).lastAutoTable.finalY + 12;

    // ===== TOTALS SECTION =====
    const totalsWidth = 85;
    const totalsX = pageWidth - margin - totalsWidth;
    
    doc.setFontSize(9);
    doc.setTextColor(...grayColor);
    doc.setFont('helvetica', 'normal');
    
    doc.text('Subtotal:', totalsX, y);
    doc.setTextColor(...darkColor);
    doc.text(formatCurrency(subtotal), pageWidth - margin, y, { align: 'right' });
    y += 7;

    if (quote.taxRate && quote.taxRate > 0) {
      doc.setTextColor(...grayColor);
      doc.text(`Tax (${quote.taxRate}%):`, totalsX, y);
      doc.setTextColor(...darkColor);
      doc.text(formatCurrency(tax), pageWidth - margin, y, { align: 'right' });
      y += 7;
    }

    // Grand Total Box
    y += 3;
    const totalBoxHeight = 14;
    doc.setFillColor(...primaryColor);
    doc.roundedRect(totalsX - 5, y - 4, totalsWidth + 5, totalBoxHeight, 2, 2, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', totalsX, y + 5);
    doc.setFontSize(11);
    doc.text(formatCurrency(total), pageWidth - margin - 3, y + 5, { align: 'right' });

    y += totalBoxHeight + 15;
  }

  // ===== TERMS & CONDITIONS =====
  if (settings.quoteTerms && settings.quoteTerms.length > 0) {
    const termsHeight = settings.quoteTerms.length * 6 + 15;
    
    // Check if we need a new page
    if (y + termsHeight > pageHeight - 30) {
      doc.addPage();
      y = 20;
      
      // Add header accent on new page
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 3, 'F');
    }

    doc.setFontSize(10);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions', margin, y);
    y += 7;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);
    
    settings.quoteTerms.forEach((term) => {
      const termLines = wrapText(doc, `• ${term}`, contentWidth - 5);
      doc.text(termLines, margin + 3, y);
      y += termLines.length * 4 + 2;
    });
  }

  // ===== FOOTER =====
  const footerY = pageHeight - 12;
  doc.setFillColor(...lightGray);
  doc.rect(0, footerY - 8, pageWidth, 20, 'F');
  
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.setFont('helvetica', 'italic');
  doc.text(
    'Thank you for the opportunity to earn your HVAC business.', 
    pageWidth / 2, 
    footerY, 
    { align: 'center' }
  );

  return doc;
};

export const downloadPDF = (quote: Quote, settings: BusinessSettings): void => {
  const doc = generatePDF(quote, settings);
  const customerName = quote.customerName.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
  const fileName = `Quote-${quote.quoteNumber}-${customerName}.pdf`;
  doc.save(fileName);
};

export const previewPDF = (quote: Quote, settings: BusinessSettings): string => {
  const doc = generatePDF(quote, settings);
  return doc.output('datauristring');
};

export const getPDFBlob = (quote: Quote, settings: BusinessSettings): Blob => {
  const doc = generatePDF(quote, settings);
  return doc.output('blob');
};
