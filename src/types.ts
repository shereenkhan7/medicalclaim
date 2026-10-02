export interface MedicalRecord {
  id: string;
  employeeName: string;
  clinicName: string;
  subTotal: number;
  gst: number;
  grandTotal: number;
  illnessSummary: string;
  receiptNumber?: string;
  visitDate?: string;
  currency?: string;
  notes?: string;
  receiptImage?: string; // base64 or object URL for preview
  receiptFilename?: string;
  createdAt: string;
  status?: 'verified' | 'pending' | 'flagged';
}

export interface UploadQueueItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  progress: number;
  error?: string;
  extractedRecord?: MedicalRecord;
}
