export interface SampleReceiptConfig {
  id: string;
  title: string;
  badge: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  gstRegNo: string;
  invoiceNo: string;
  date: string;
  employeeName: string;
  employeeId: string;
  doctorName: string;
  illness: string;
  items: { desc: string; qty: number; price: number }[];
  subTotal: number;
  gstRate: number; // e.g. 0.09
  gstAmount: number;
  grandTotal: number;
  paymentMethod: string;
}

export const SAMPLE_RECEIPTS_DATA: SampleReceiptConfig[] = [
  {
    id: 'sample-1',
    title: 'GP Consultation & Flu Rx',
    badge: 'URTI / Flu',
    clinicName: 'Raffles Medical Group (Marina Bay)',
    clinicAddress: '10 Marina Boulevard, #01-03 MBFC Tower 2, Singapore 018983',
    clinicPhone: '+65 6538 2998',
    gstRegNo: 'M2-0019284-X',
    invoiceNo: 'RM-2026-094182',
    date: '2026-09-28',
    employeeName: 'Sarah Lim Wei Ling',
    employeeId: 'EMP-8831',
    doctorName: 'Dr. Kevin Tan (MCR: 14892A)',
    illness: 'Acute Upper Respiratory Tract Infection (URTI) & Fever',
    items: [
      { desc: 'GP Consultation (Extended Hours)', qty: 1, price: 38.00 },
      { desc: 'Paracetamol 500mg (20 Tabs)', qty: 1, price: 9.50 },
      { desc: 'Leftose Anti-inflammatory Tablets', qty: 1, price: 14.00 },
      { desc: 'Duro-Tuss Expectorant Syrup 100ml', qty: 1, price: 13.50 },
    ],
    subTotal: 75.00,
    gstRate: 0.09,
    gstAmount: 6.75,
    grandTotal: 81.75,
    paymentMethod: 'Corporate / Contactless Card',
  },
  {
    id: 'sample-2',
    title: 'Dental Scaling & Filling',
    badge: 'Dental Pain',
    clinicName: 'Novena Specialists Dental Surgery',
    clinicAddress: '10 Sinaran Drive, #09-12 Novena Medical Center, Singapore 307506',
    clinicPhone: '+65 6397 7011',
    gstRegNo: '201509841K',
    invoiceNo: 'NDS-88204',
    date: '2026-09-29',
    employeeName: 'Marcus Tan Zhi Qiang',
    employeeId: 'EMP-4420',
    doctorName: 'Dr. Audrey Fong (BDS, Singapore)',
    illness: 'Dental Caries & Gingival Inflammation (Toothache)',
    items: [
      { desc: 'Dental Examination & Diagnosis', qty: 1, price: 50.00 },
      { desc: 'Scaling and Ultrasonic Polishing', qty: 1, price: 110.00 },
      { desc: 'Composite Resin Restoration (Tooth #26)', qty: 1, price: 90.00 },
      { desc: 'Chlorhexidine Antiseptic Mouthwash', qty: 1, price: 15.00 },
    ],
    subTotal: 265.00,
    gstRate: 0.09,
    gstAmount: 23.85,
    grandTotal: 288.85,
    paymentMethod: 'Visa / PayNow',
  },
  {
    id: 'sample-3',
    title: 'Gastroenteritis & Acid Reflux',
    badge: 'Gastric Bug',
    clinicName: 'Minmed Clinic @ One Raffles Place',
    clinicAddress: '1 Raffles Place, #04-18, Singapore 048616',
    clinicPhone: '+65 6536 2911',
    gstRegNo: '201201994W',
    invoiceNo: 'MMC-602931',
    date: '2026-09-30',
    employeeName: 'Priya Ramanathan',
    employeeId: 'EMP-6109',
    doctorName: 'Dr. Daniel Goh (MBBS, FRACGP)',
    illness: 'Acute Gastroenteritis with Nausea & Abdominal Colic',
    items: [
      { desc: 'General Consultation - Doctor Consult', qty: 1, price: 42.00 },
      { desc: 'Omeprazole 20mg (14 Caps)', qty: 1, price: 22.00 },
      { desc: 'Buscopan 10mg (20 Tabs)', qty: 1, price: 16.00 },
      { desc: 'Oral Rehydration Salts Hydralyte (10 sachets)', qty: 1, price: 12.00 },
    ],
    subTotal: 92.00,
    gstRate: 0.09,
    gstAmount: 8.28,
    grandTotal: 100.28,
    paymentMethod: 'NETS QR Debit',
  },
];

/**
 * Draws a realistic, high-contrast, thermal/paper medical receipt on an HTML canvas
 * and returns a high-resolution JPEG Data URL and File object for OCR testing.
 */
export function generateReceiptImage(cfg: SampleReceiptConfig): Promise<{ dataUrl: string; file: File }> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const width = 640;
    const height = 960;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d')!;

    // Background paper texture
    ctx.fillStyle = '#fbfbfb';
    ctx.fillRect(0, 0, width, height);

    // Subtle receipt border / drop shadow accent
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // Top Header band
    ctx.fillStyle = '#0f766e';
    ctx.fillRect(10, 10, width - 20, 12);

    let y = 50;

    // Clinic Name
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(cfg.clinicName, width / 2, y);

    y += 24;
    ctx.fillStyle = '#475569';
    ctx.font = '12px sans-serif';
    ctx.fillText(cfg.clinicAddress, width / 2, y);

    y += 18;
    ctx.fillText(`Tel: ${cfg.clinicPhone}  |  GST Reg No: ${cfg.gstRegNo}`, width / 2, y);

    y += 26;
    // Divider line
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(35, y);
    ctx.lineTo(width - 35, y);
    ctx.stroke();
    ctx.setLineDash([]);

    y += 24;
    // Title
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('*** OFFICIAL TAX INVOICE / RECEIPT ***', width / 2, y);

    y += 32;
    ctx.textAlign = 'left';
    ctx.font = '13px monospace';
    ctx.fillStyle = '#1e293b';

    // Left & Right columns
    ctx.fillText(`Invoice No : ${cfg.invoiceNo}`, 40, y);
    ctx.fillText(`Date: ${cfg.date}`, 420, y);

    y += 22;
    ctx.fillText(`Employee   : ${cfg.employeeName} (${cfg.employeeId})`, 40, y);
    y += 22;
    ctx.fillText(`Attending  : ${cfg.doctorName}`, 40, y);

    y += 22;
    ctx.fillStyle = '#b45309';
    ctx.fillText(`Diagnosis  : ${cfg.illness}`, 40, y);

    y += 24;
    // Divider
    ctx.strokeStyle = '#94a3b8';
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(35, y);
    ctx.lineTo(width - 35, y);
    ctx.stroke();
    ctx.setLineDash([]);

    y += 22;
    // Table Header
    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('ITEM / DESCRIPTION', 40, y);
    ctx.fillText('QTY', 420, y);
    ctx.textAlign = 'right';
    ctx.fillText('AMOUNT ($)', width - 40, y);

    y += 12;
    ctx.strokeStyle = '#cbd5e1';
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(35, y);
    ctx.lineTo(width - 35, y);
    ctx.stroke();

    y += 24;
    // Items
    ctx.font = '13px monospace';
    ctx.fillStyle = '#334155';

    for (const item of cfg.items) {
      ctx.textAlign = 'left';
      ctx.fillText(item.desc, 40, y);
      ctx.fillText(String(item.qty), 430, y);
      ctx.textAlign = 'right';
      ctx.fillText(item.price.toFixed(2), width - 40, y);
      y += 24;
    }

    y += 10;
    // Divider
    ctx.strokeStyle = '#94a3b8';
    ctx.setLineDash([4, 2]);
    ctx.beginPath();
    ctx.moveTo(35, y);
    ctx.lineTo(width - 35, y);
    ctx.stroke();
    ctx.setLineDash([]);

    y += 28;
    // Totals section
    ctx.textAlign = 'right';
    ctx.font = '14px monospace';
    ctx.fillStyle = '#1e293b';

    ctx.fillText('SUB-TOTAL (SGD):', width - 180, y);
    ctx.fillText(`$${cfg.subTotal.toFixed(2)}`, width - 40, y);

    y += 24;
    ctx.fillText(`GST @ 9.0%:`, width - 180, y);
    ctx.fillText(`$${cfg.gstAmount.toFixed(2)}`, width - 40, y);

    y += 28;
    // Grand Total box
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(width - 350, y - 20, 315, 34);
    ctx.strokeStyle = '#0f766e';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(width - 350, y - 20, 315, 34);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('GRAND TOTAL (SGD):', width - 160, y + 2);
    ctx.fillStyle = '#0f766e';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`$${cfg.grandTotal.toFixed(2)}`, width - 40, y + 2);

    y += 45;
    ctx.font = '12px monospace';
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'left';
    ctx.fillText(`Payment Mode: ${cfg.paymentMethod} (APPROVED)`, 40, y);
    ctx.textAlign = 'right';
    ctx.fillText('STATUS: PAID IN FULL', width - 40, y);

    y += 40;
    // Barcode Simulation
    ctx.fillStyle = '#1e293b';
    const barcodeWidth = 360;
    const barcodeHeight = 45;
    const barcodeX = (width - barcodeWidth) / 2;
    for (let bx = 0; bx < barcodeWidth; bx += 3) {
      if (Math.sin(bx * 0.4) > -0.2) {
        ctx.fillRect(barcodeX + bx, y, (bx % 5 === 0 ? 2.5 : 1.5), barcodeHeight);
      }
    }

    y += barcodeHeight + 20;
    ctx.textAlign = 'center';
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`* This is a computer generated medical invoice. Claimable under Corporate Insurance *`, width / 2, y);

    y += 18;
    ctx.fillText(`Thank you for visiting ${cfg.clinicName}`, width / 2, y);

    // Bottom decorative serration
    const toothCount = 32;
    const toothW = width / toothCount;
    ctx.fillStyle = '#cbd5e1';
    for (let i = 0; i < toothCount; i++) {
      ctx.beginPath();
      ctx.moveTo(i * toothW, height);
      ctx.lineTo((i + 0.5) * toothW, height - 8);
      ctx.lineTo((i + 1) * toothW, height);
      ctx.fill();
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    canvas.toBlob((blob) => {
      const file = new File([blob!], `${cfg.invoiceNo}.jpg`, { type: 'image/jpeg' });
      resolve({ dataUrl, file });
    }, 'image/jpeg', 0.95);
  });
}
