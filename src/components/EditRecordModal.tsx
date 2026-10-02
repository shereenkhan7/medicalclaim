import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Calculator } from 'lucide-react';
import { MedicalRecord } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: MedicalRecord) => void;
  initialData?: MedicalRecord | null;
}

export const EditRecordModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const isEditing = Boolean(initialData?.id);

  const [employeeName, setEmployeeName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [subTotal, setSubTotal] = useState<string>('0.00');
  const [gst, setGst] = useState<string>('0.00');
  const [grandTotal, setGrandTotal] = useState<string>('0.00');
  const [illnessSummary, setIllnessSummary] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setEmployeeName(initialData.employeeName || '');
      setClinicName(initialData.clinicName || '');
      setSubTotal(initialData.subTotal.toFixed(2));
      setGst(initialData.gst.toFixed(2));
      setGrandTotal(initialData.grandTotal.toFixed(2));
      setIllnessSummary(initialData.illnessSummary || '');
      setVisitDate(initialData.visitDate || new Date().toISOString().split('T')[0]);
      setReceiptNumber(initialData.receiptNumber || '');
      setNotes(initialData.notes || '');
    } else {
      setEmployeeName('');
      setClinicName('');
      setSubTotal('0.00');
      setGst('0.00');
      setGrandTotal('0.00');
      setIllnessSummary('');
      setVisitDate(new Date().toISOString().split('T')[0]);
      setReceiptNumber('');
      setNotes('');
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Auto-calculate grand total helper
  const handleAutoCalcGrandTotal = () => {
    const s = parseFloat(subTotal) || 0;
    const g = parseFloat(gst) || 0;
    setGrandTotal((s + g).toFixed(2));
  };

  const handleSubTotalChange = (val: string) => {
    setSubTotal(val);
    const s = parseFloat(val) || 0;
    const g = parseFloat(gst) || 0;
    setGrandTotal((s + g).toFixed(2));
  };

  const handleGstChange = (val: string) => {
    setGst(val);
    const s = parseFloat(subTotal) || 0;
    const g = parseFloat(val) || 0;
    setGrandTotal((s + g).toFixed(2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!employeeName.trim()) {
      setError('Please provide the employee name.');
      return;
    }
    if (!clinicName.trim()) {
      setError('Please provide the clinic name.');
      return;
    }

    const s = parseFloat(subTotal);
    const g = parseFloat(gst);
    const t = parseFloat(grandTotal);

    if (isNaN(t) || t < 0) {
      setError('Please enter a valid grand total amount.');
      return;
    }

    const updatedRecord: MedicalRecord = {
      id: initialData?.id || `rec-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      employeeName: employeeName.trim(),
      clinicName: clinicName.trim(),
      subTotal: isNaN(s) ? 0 : Number(s.toFixed(2)),
      gst: isNaN(g) ? 0 : Number(g.toFixed(2)),
      grandTotal: Number(t.toFixed(2)),
      illnessSummary: illnessSummary.trim() || 'General Medical Consultation',
      visitDate: visitDate || new Date().toISOString().split('T')[0],
      receiptNumber: receiptNumber.trim() || 'N/A',
      notes: notes.trim(),
      currency: initialData?.currency || '$',
      receiptImage: initialData?.receiptImage,
      receiptFilename: initialData?.receiptFilename,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      status: 'verified',
    };

    onSave(updatedRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              {isEditing ? 'Edit Medical Claim Record' : 'Add Manual Medical Claim'}
            </h3>
            <p className="text-xs text-slate-500">
              {isEditing ? 'Update extracted OCR details or adjust figures' : 'Enter claim details directly into the submission table'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Name of Employee <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="e.g. Sarah Lim Wei Ling"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Clinic Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="e.g. Raffles Medical @ Marina Bay"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Sub-Total ($) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={subTotal}
                  onChange={(e) => handleSubTotalChange(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                GST ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={gst}
                  onChange={(e) => handleGstChange(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Grand Total ($) <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAutoCalcGrandTotal}
                  title="Sum Sub-Total + GST"
                  className="text-[10px] text-teal-600 hover:text-teal-700 flex items-center gap-0.5"
                >
                  <Calculator className="w-3 h-3" /> Sum
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-teal-600 font-bold font-mono text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={grandTotal}
                  onChange={(e) => setGrandTotal(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-teal-50/50 border border-teal-300 rounded-xl text-sm font-bold font-mono text-teal-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Summary of Illness / Diagnosis <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={illnessSummary}
              onChange={(e) => setIllnessSummary(e.target.value)}
              placeholder="e.g. Acute Pharyngitis, Flu symptoms, Gastritis, Dental Cleaning"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Visit Date
              </label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Receipt / Tax Invoice #
              </label>
              <input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                placeholder="e.g. INV-982104"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Additional Notes & Prescriptions
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional remarks, prescribed medications, MC issued, etc."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs flex items-center gap-2 transition"
            >
              <Save className="w-4 h-4" />
              {isEditing ? 'Save Changes' : 'Add Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
