import * as XLSX from 'xlsx';
import { MedicalRecord } from '../types';

export function exportRecordsToExcel(records: MedicalRecord[], filenamePrefix = 'Medical_Claims_Submission') {
  if (records.length === 0) {
    return;
  }

  // Column Headers matching the 6 requested fields + key audit fields
  const headers = [
    'Item #',
    'Name of Employee',
    'Clinic Name',
    'Sub-Total ($)',
    'GST ($)',
    'Grand Total ($)',
    'Summary of Illness',
    'Visit Date',
    'Receipt / Bill #',
    'Currency',
    'Notes & Prescriptions',
    'Status',
  ];

  const dataRows = records.map((rec, index) => [
    index + 1,
    rec.employeeName || 'Not Specified',
    rec.clinicName || 'Unknown Clinic',
    rec.subTotal ?? 0,
    rec.gst ?? 0,
    rec.grandTotal ?? 0,
    rec.illnessSummary || 'General Consultation',
    rec.visitDate || '',
    rec.receiptNumber || 'N/A',
    rec.currency || 'SGD',
    rec.notes || '',
    (rec.status || 'verified').toUpperCase(),
  ]);

  // Aggregate sums
  const totalSubTotal = records.reduce((acc, cur) => acc + (Number(cur.subTotal) || 0), 0);
  const totalGst = records.reduce((acc, cur) => acc + (Number(cur.gst) || 0), 0);
  const totalGrandTotal = records.reduce((acc, cur) => acc + (Number(cur.grandTotal) || 0), 0);

  // Summary footer row
  const summaryRow = [
    'TOTAL',
    `Total Claims: ${records.length}`,
    '-',
    Number(totalSubTotal.toFixed(2)),
    Number(totalGst.toFixed(2)),
    Number(totalGrandTotal.toFixed(2)),
    '-',
    '-',
    '-',
    '-',
    '-',
    '-',
  ];

  const worksheetData = [
    ['COMPANY MEDICAL EXPENSE CLAIM SUBMISSION REPORT'],
    [`Generated on: ${new Date().toLocaleString()}`],
    [], // empty spacer
    headers,
    ...dataRows,
    [], // empty spacer
    summaryRow,
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Column width styling
  worksheet['!cols'] = [
    { wch: 8 },  // Item #
    { wch: 26 }, // Name of Employee
    { wch: 32 }, // Clinic Name
    { wch: 16 }, // Sub-Total
    { wch: 14 }, // GST
    { wch: 18 }, // Grand Total
    { wch: 40 }, // Summary of Illness
    { wch: 14 }, // Visit Date
    { wch: 20 }, // Receipt / Bill #
    { wch: 10 }, // Currency
    { wch: 35 }, // Notes & Prescriptions
    { wch: 12 }, // Status
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Medical Cost Submissions');

  const dateStr = new Date().toISOString().split('T')[0];
  const finalFilename = `${filenamePrefix}_${dateStr}.xlsx`;
  XLSX.writeFile(workbook, finalFilename);
}
