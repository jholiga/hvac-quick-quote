import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quote, BusinessSettings } from '@/types/quote';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const generatePDF = (quote: Quote, settings: BusinessSettings): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = 25;

  // Colors - professional blue/gray scheme
  const primaryColor: [number, number, number] = [37, 99, 235];
  const darkColor: [number, number, number] = [15, 23, 42];
  const grayColor: [number, number, number] = [100, 116, 139];
  const lightGray: [number, number, number] = [241, 245, 249];

  // Header background accent line
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 4, 'F');

  // Business Name - Left
  doc.setFontSize(20);
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.businessName, margin, y);

  // Quote number badge - Right
  doc.setFillColor(...lightGray);
  doc.roundedRect(pageWidth - margin - 50, y - 8, 50, 20, 3, 3, 'F');
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  doc.setFont('helvetica', 'normal');
  doc.text('QUOTE', pageWidth - margin - 25, y - 2, { align: 'center' });
  doc.setFontSize(11);
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.text(quote.quoteNumber, pageWidth - margin - 25, y + 6, { align: 'center' });

  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text(settings.phone, margin, y);
  y += 5;
  doc.text(settings.email, margin, y);

  // Date on right
  doc.text(`Date: ${new Date(quote.createdAt).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, pageWidth - margin, y, { align: 'right' });

  y += 15;

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  y += 15;

  // Customer Info Box
  doc.setFillColor(...lightGray);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 35, 3, 3, 'F');

  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  doc.setFont('helvetica', 'bold');
  doc.text('PREPARED FOR', margin + 10, y + 10);

  doc.setFontSize(12);
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.text(quote.customerName, margin + 10, y + 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  let contactY = y + 20;
  if (quote.customerPhone) {
    doc.text(quote.customerPhone, margin + 10, y + 28);
  }
  if (quote.customerEmail) {
    doc.text(quote.customerEmail, pageWidth - margin - 10, y + 20, { align: 'right' });
  }

  y += 45;

  // Job Title
  if (quote.jobTitle) {
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(quote.jobTitle, margin, y);
    y += 10;
  }

  // Scope of Work
  if (quote.scopeOfWork) {
    doc.setFontSize(10);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'normal');
    const scopeLines = doc.splitTextToSize(quote.scopeOfWork, pageWidth - margin * 2);
    doc.text(scopeLines, margin, y);
    y += scopeLines.length * 5 + 10;
  }

  // Calculate totals
  let subtotal = 0;
  if (quote.isLumpSum) {
    subtotal = quote.lumpSumPrice;
  } else {
    subtotal = quote.lineItems.reduce((sum, item) => {
      const base = item.quantity * item.unitPrice;
      return sum + (item.applyMarkup ? base * settings.defaultMarkup : base);
    }, 0);
  }
  const tax = subtotal * (quote.taxRate / 100);
  const total = subtotal + tax;

  if (quote.isLumpSum) {
    // Lump Sum Display - Clean summary box
    y += 5;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 50, 4, 4, 'F');
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(1);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 50, 4, 4, 'S');

    doc.setFontSize(10);
    doc.setTextColor(...grayColor);
    doc.setFont('helvetica', 'normal');
    const summaryText = 'Total price includes all HVAC parts, materials, and labor as described above.';
    doc.text(summaryText, pageWidth / 2, y + 15, { align: 'center' });

    doc.setFontSize(24);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(total), pageWidth / 2, y + 35, { align: 'center' });

    y += 60;
  } else {
    // Itemized Table
    const tableData = quote.lineItems.map(item => {
      const unitWithMarkup = item.unitPrice * (item.applyMarkup ? settings.defaultMarkup : 1);
      const lineTotal = item.quantity * unitWithMarkup;
      return [
        item.description,
        item.quantity.toString(),
        formatCurrency(unitWithMarkup),
        formatCurrency(lineTotal),
      ];
    });

    autoTable(doc, {
      startY: y,
      head: [['Description', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        cellPadding: 6,
      },
      bodyStyles: {
        fontSize: 10,
        textColor: darkColor,
        cellPadding: 5,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 40, halign: 'right' },
      },
    });

    y = (doc as any).lastAutoTable.finalY + 15;

    // Totals Section
    const totalsX = pageWidth - margin - 90;
    
    doc.setFontSize(10);
    doc.setTextColor(...grayColor);
    doc.setFont('helvetica', 'normal');
    
    doc.text('Subtotal:', totalsX, y);
    doc.setTextColor(...darkColor);
    doc.text(formatCurrency(subtotal), pageWidth - margin, y, { align: 'right' });
    y += 8;

    if (quote.taxRate > 0) {
      doc.setTextColor(...grayColor);
      doc.text(`Tax (${quote.taxRate}%):`, totalsX, y);
      doc.setTextColor(...darkColor);
      doc.text(formatCurrency(tax), pageWidth - margin, y, { align: 'right' });
      y += 8;
    }

    // Total with box
    y += 4;
    doc.setFillColor(...primaryColor);
    doc.roundedRect(totalsX - 10, y - 6, pageWidth - margin - totalsX + 20, 18, 2, 2, 'F');
    
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', totalsX, y + 4);
    doc.text(formatCurrency(total), pageWidth - margin - 5, y + 4, { align: 'right' });

    y += 25;
  }

  // Terms & Conditions
  if (settings.quoteTerms && settings.quoteTerms.length > 0) {
    // Check if we need a new page
    if (y > pageHeight - 80) {
      doc.addPage();
      y = 25;
    }

    doc.setFontSize(10);
    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions', margin, y);
    y += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);
    
    settings.quoteTerms.forEach((term, index) => {
      doc.text(`• ${term}`, margin + 5, y);
      y += 6;
    });
  }

  // Footer
  const footerY = pageHeight - 15;
  doc.setFillColor(...lightGray);
  doc.rect(0, footerY - 10, pageWidth, 25, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  doc.setFont('helvetica', 'italic');
  doc.text('Thank you for the opportunity to earn your HVAC business.', pageWidth / 2, footerY, { align: 'center' });

  return doc;
};

export const downloadPDF = (quote: Quote, settings: BusinessSettings): void => {
  const doc = generatePDF(quote, settings);
  const fileName = `Quote-${quote.quoteNumber}-${quote.customerName.replace(/\s+/g, '-')}.pdf`;
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
