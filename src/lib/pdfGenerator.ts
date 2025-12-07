import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quote, BusinessSettings } from '@/types/quote';

export const generatePDF = (quote: Quote, settings: BusinessSettings): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // Colors
  const primaryColor: [number, number, number] = [59, 130, 246];
  const darkColor: [number, number, number] = [30, 41, 59];
  const grayColor: [number, number, number] = [100, 116, 139];

  // Header - Business Info (Left)
  doc.setFontSize(18);
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.businessName, margin, y);
  
  y += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text(settings.phone, margin, y);
  y += 4;
  doc.text(settings.email, margin, y);

  // Header - Quote Info (Right)
  const rightX = pageWidth - margin;
  doc.setFontSize(10);
  doc.setTextColor(...grayColor);
  doc.text(`Quote #: ${quote.quoteNumber}`, rightX, 20, { align: 'right' });
  doc.text(`Date: ${new Date(quote.createdAt).toLocaleDateString()}`, rightX, 26, { align: 'right' });

  // Logo placeholder (initials box)
  if (settings.logo) {
    try {
      doc.addImage(settings.logo, 'PNG', rightX - 30, 32, 30, 30);
    } catch {
      // Draw initials box if logo fails
      drawInitialsBox(doc, rightX - 30, 32, settings.businessName, primaryColor);
    }
  } else {
    drawInitialsBox(doc, rightX - 30, 32, settings.businessName, primaryColor);
  }

  y = 50;

  // Divider
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 15;

  // Customer Info
  doc.setFontSize(11);
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO', margin, y);
  y += 6;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(quote.customerName, margin, y);
  y += 5;
  if (quote.customerPhone) {
    doc.setTextColor(...grayColor);
    doc.text(quote.customerPhone, margin, y);
    y += 5;
  }
  if (quote.customerEmail) {
    doc.text(quote.customerEmail, margin, y);
    y += 5;
  }

  y += 10;

  // Job Title
  doc.setFontSize(14);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text(quote.jobTitle || 'HVAC Service Quote', margin, y);
  
  y += 3;
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + 50, y);
  
  y += 15;

  // Calculate totals
  const subtotal = quote.lineItems.reduce((sum, item) => {
    const base = item.quantity * item.unitPrice;
    return sum + (item.applyMarkup ? base * settings.defaultMarkup : base);
  }, 0);
  const tax = subtotal * (quote.taxRate / 100);
  const total = subtotal + tax;

  if (quote.isLumpSum) {
    // Lump Sum Mode
    doc.setFontSize(10);
    doc.setTextColor(...grayColor);
    doc.setFont('helvetica', 'normal');
    const lumpSumText = 'This quote reflects the total cost for HVAC parts, materials, and labor as described.';
    const splitText = doc.splitTextToSize(lumpSumText, pageWidth - (margin * 2));
    doc.text(splitText, margin, y);
    y += 20;
  } else {
    // Itemized Mode - Table
    const tableData = quote.lineItems.map(item => {
      const lineTotal = item.quantity * item.unitPrice * (item.applyMarkup ? settings.defaultMarkup : 1);
      return [
        item.description,
        item.quantity.toString(),
        formatCurrency(item.unitPrice * (item.applyMarkup ? settings.defaultMarkup : 1)),
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
      },
      bodyStyles: {
        fontSize: 10,
        textColor: darkColor,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' },
      },
    });

    y = (doc as any).lastAutoTable.finalY + 15;
  }

  // Totals Section
  const totalsX = pageWidth - margin - 80;
  
  doc.setFontSize(10);
  doc.setTextColor(...grayColor);
  doc.setFont('helvetica', 'normal');
  
  doc.text('Subtotal:', totalsX, y);
  doc.text(formatCurrency(subtotal), pageWidth - margin, y, { align: 'right' });
  y += 6;

  if (quote.taxRate > 0) {
    doc.text(`Tax (${quote.taxRate}%):`, totalsX, y);
    doc.text(formatCurrency(tax), pageWidth - margin, y, { align: 'right' });
    y += 6;
  }

  // Total line
  y += 2;
  doc.setDrawColor(220, 220, 220);
  doc.line(totalsX, y, pageWidth - margin, y);
  y += 8;

  doc.setFontSize(14);
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', totalsX, y);
  doc.text(formatCurrency(total), pageWidth - margin, y, { align: 'right' });

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  doc.setFont('helvetica', 'italic');
  const footerText = 'Thank you for the opportunity to earn your HVAC business.';
  doc.text(footerText, pageWidth / 2, footerY, { align: 'center' });

  return doc;
};

function drawInitialsBox(
  doc: jsPDF, 
  x: number, 
  y: number, 
  businessName: string,
  color: [number, number, number]
): void {
  const initials = businessName
    .split(' ')
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase() || '')
    .join('');
  
  doc.setFillColor(...color);
  doc.roundedRect(x, y, 30, 30, 3, 3, 'F');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(initials, x + 15, y + 18, { align: 'center' });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export const downloadPDF = (quote: Quote, settings: BusinessSettings): void => {
  const doc = generatePDF(quote, settings);
  const fileName = `Quote-${quote.quoteNumber}-${quote.customerName.replace(/\s+/g, '-')}.pdf`;
  doc.save(fileName);
};

export const previewPDF = (quote: Quote, settings: BusinessSettings): string => {
  const doc = generatePDF(quote, settings);
  return doc.output('datauristring');
};
