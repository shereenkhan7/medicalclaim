import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { UploadDropzone } from './components/UploadDropzone';
import { UploadQueue } from './components/UploadQueue';
import { ClaimsTable } from './components/ClaimsTable';
import { StatsOverview } from './components/StatsOverview';
import { EditRecordModal } from './components/EditRecordModal';
import { ReceiptPreviewModal } from './components/ReceiptPreviewModal';
import { MedicalRecord, UploadQueueItem } from './types';
import { AlertCircle, CheckCircle2, Info, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'mediclaim_records_v1';

// Initial starter records demonstrating the 6 required fields
const INITIAL_DEMO_RECORDS: MedicalRecord[] = [
  {
    id: 'demo-1',
    employeeName: 'Sarah Lim Wei Ling',
    clinicName: 'Raffles Medical Group (Marina Bay)',
    subTotal: 75.00,
    gst: 6.75,
    grandTotal: 81.75,
    illnessSummary: 'Acute Upper Respiratory Tract Infection (URTI) & Fever',
    visitDate: '2026-09-28',
    receiptNumber: 'RM-2026-094182',
    currency: 'SGD',
    notes: 'Prescribed Paracetamol 500mg, Leftose, Duro-Tuss. 2 days MC issued.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    status: 'verified',
  },
  {
    id: 'demo-2',
    employeeName: 'Marcus Tan Zhi Qiang',
    clinicName: 'Novena Specialists Dental Surgery',
    subTotal: 265.00,
    gst: 23.85,
    grandTotal: 288.85,
    illnessSummary: 'Dental Caries & Gingival Inflammation (Toothache)',
    visitDate: '2026-09-29',
    receiptNumber: 'NDS-88204',
    currency: 'SGD',
    notes: 'Scaling, polishing and composite resin restoration on tooth #26.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'verified',
  },
];

export default function App() {
  const [records, setRecords] = useState<MedicalRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load records from storage', e);
    }
    return INITIAL_DEMO_RECORDS;
  });

  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Modals state
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [previewRecord, setPreviewRecord] = useState<MedicalRecord | null>(null);

  // Persist records
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.warn('Could not persist records to localStorage', e);
    }
  }, [records]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // OCR Processing Handler
  const handleProcessImage = useCallback(
    async (file: File, previewUrl: string) => {
      const queueId = `q-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const newQueueItem: UploadQueueItem = {
        id: queueId,
        file,
        previewUrl,
        status: 'processing',
        progress: 20,
      };

      setUploadQueue((prev) => [newQueueItem, ...prev]);
      setIsProcessing(true);

      try {
        const base64Data = await fileToBase64(file);

        // Call backend OCR endpoint
        const response = await fetch('/api/extract-receipt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: file.type || 'image/jpeg',
            filename: file.name,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with status ${response.status}`);
        }

        const resData = await response.json();
        if (!resData.success || !resData.data) {
          throw new Error(resData.error || 'Failed to extract receipt information');
        }

        const extracted = resData.data;

        // Build new MedicalRecord
        const newRecord: MedicalRecord = {
          id: `claim-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          employeeName: extracted.employeeName || 'Not Specified',
          clinicName: extracted.clinicName || 'Unknown Clinic',
          subTotal: Number(extracted.subTotal) || 0,
          gst: Number(extracted.gst) || 0,
          grandTotal: Number(extracted.grandTotal) || 0,
          illnessSummary: extracted.illnessSummary || 'General Medical Consultation',
          visitDate: extracted.visitDate || new Date().toISOString().split('T')[0],
          receiptNumber: extracted.receiptNumber || 'N/A',
          currency: extracted.currency || 'SGD',
          notes: extracted.notes || '',
          receiptImage: previewUrl,
          receiptFilename: file.name,
          createdAt: new Date().toISOString(),
          status: 'verified',
        };

        // Prepend to table records
        setRecords((prev) => [newRecord, ...prev]);

        // Update queue item
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === queueId
              ? { ...item, status: 'success', progress: 100, extractedRecord: newRecord }
              : item
          )
        );

        setToastMessage({
          type: 'success',
          text: `Successfully extracted claim for ${newRecord.employeeName} ($${newRecord.grandTotal.toFixed(2)})`,
        });
      } catch (err: any) {
        console.error('Error during OCR processing:', err);
        const errMsg = err.message || 'Error processing receipt';

        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === queueId
              ? { ...item, status: 'error', progress: 0, error: errMsg }
              : item
          )
        );

        setToastMessage({
          type: 'error',
          text: `OCR Extraction Failed: ${errMsg}`,
        });
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const handleSaveRecord = (savedRecord: MedicalRecord) => {
    setRecords((prev) => {
      const index = prev.findIndex((r) => r.id === savedRecord.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = savedRecord;
        return copy;
      } else {
        return [savedRecord, ...prev];
      }
    });

    setToastMessage({
      type: 'success',
      text: `Record for "${savedRecord.employeeName}" saved successfully`,
    });
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setToastMessage({
      type: 'info',
      text: 'Record removed from submission table',
    });
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all records from the submission table?')) {
      setRecords([]);
      setToastMessage({
        type: 'info',
        text: 'All records cleared',
      });
    }
  };

  const handleOpenAddManual = () => {
    setEditingRecord(null);
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (rec: MedicalRecord) => {
    setEditingRecord(rec);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-xl border flex items-center gap-3 text-xs font-semibold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                : toastMessage.type === 'error'
                ? 'bg-rose-900 text-rose-100 border-rose-700'
                : 'bg-slate-900 text-slate-100 border-slate-700'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toastMessage.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Header records={records} onAddManual={handleOpenAddManual} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Intro Banner */}
        <div
          className="rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden border"
          style={{ borderColor: '#0af8f1', backgroundColor: '#08481f' }}
        >
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-200 border border-teal-400/30 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              Automated Optical Character Recognition (OCR)
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Medical Cost Submission &amp; OCR Portal
            </h1>
            <p className="text-sm text-teal-100/90 leading-relaxed mb-4">
              Upload or drag and drop clinic receipts, hospital invoices, or doctor bills. The system extracts
              <strong className="text-white"> Employee Name</strong>,
              <strong className="text-white"> Clinic Name</strong>,
              <strong className="text-white"> Sub-Total</strong>,
              <strong className="text-white"> GST</strong>,
              <strong className="text-white"> Grand Total</strong>, and
              <strong className="text-white"> Summary of Illness</strong> into a consolidated table, ready to download into an Excel (.xlsx) report.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-teal-200">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                Realtime multimodal AI OCR
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                Multi-receipt batch queue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                Direct Excel (.xlsx) download
              </span>
            </div>
          </div>
          {/* Subtle background decorative element */}
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* Stats Overview */}
        <StatsOverview records={records} />

        {/* Upload & Drag-and-Drop Area */}
        <section aria-label="Upload Section">
          <UploadDropzone
            onProcessImage={handleProcessImage}
            isProcessing={isProcessing}
            queueCount={uploadQueue.length}
          />
        </section>

        {/* Upload Queue Progress */}
        {uploadQueue.length > 0 && (
          <section aria-label="Upload Queue">
            <UploadQueue
              queue={uploadQueue}
              onDismiss={(id) => setUploadQueue((prev) => prev.filter((item) => item.id !== id))}
              onClearFinished={() =>
                setUploadQueue((prev) => prev.filter((item) => item.status === 'processing'))
              }
            />
          </section>
        )}

        {/* Primary Claims Table with required 6 fields and Excel download */}
        <section aria-label="Claims Table">
          <ClaimsTable
            records={records}
            onEditRecord={handleOpenEdit}
            onDeleteRecord={handleDeleteRecord}
            onClearAll={handleClearAll}
            onPreviewRecord={(rec) => setPreviewRecord(rec)}
            onAddManual={handleOpenAddManual}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            MediClaim &bull; Automated Medical Cost Extraction &amp; XLSX Expense Reporting
          </p>
          <p className="text-[11px] text-slate-400">
            Complies with Singapore Goods and Services Tax (GST) &amp; Corporate Reimbursable Standards
          </p>
        </div>
      </footer>

      {/* Edit & Add Record Modal */}
      <EditRecordModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveRecord}
        initialData={editingRecord}
      />

      {/* Verification & Receipt Preview Modal */}
      <ReceiptPreviewModal
        record={previewRecord}
        onClose={() => setPreviewRecord(null)}
      />
    </div>
  );
}
