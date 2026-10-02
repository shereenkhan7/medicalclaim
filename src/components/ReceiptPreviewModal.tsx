import React from 'react';
import { X, ZoomIn, Calendar, FileText, Building2, User, Stethoscope, DollarSign } from 'lucide-react';
import { MedicalRecord } from '../types';

interface Props {
  record: MedicalRecord | null;
  onClose: () => void;
}

export const ReceiptPreviewModal: React.FC<Props> = ({ record, onClose }) => {
  if (!record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">
                Receipt Verification & OCR Details
              </h3>
              <p className="text-xs text-slate-500">
                {record.receiptFilename || 'Receipt Scan'} &bull; Submitted {new Date(record.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body: 2 columns on desktop */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Receipt Image Preview */}
          <div className="flex flex-col items-center justify-center bg-slate-100 rounded-xl p-4 border border-slate-200 min-h-[350px]">
            {record.receiptImage ? (
              <div className="relative group max-h-[500px] overflow-auto rounded-lg shadow-xs">
                <img
                  src={record.receiptImage}
                  alt="Medical receipt scan"
                  className="max-w-full h-auto object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="text-center text-slate-400 p-8">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Manual entry (No image scanned)</p>
              </div>
            )}
          </div>

          {/* Right: Extracted OCR Fields */}
          <div className="flex flex-col space-y-4">
            <div className="bg-teal-50 border border-teal-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
                  Extracted Total
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                  OCR Verified
                </span>
              </div>
              <div className="text-3xl font-bold text-teal-900">
                ${record.grandTotal.toFixed(2)}
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-teal-700">
                <span>Sub-Total: <strong>${record.subTotal.toFixed(2)}</strong></span>
                <span>GST: <strong>${record.gst.toFixed(2)}</strong></span>
              </div>
            </div>

            <div className="space-y-3 bg-white border border-slate-200 rounded-xl p-4 divide-y divide-slate-100 text-sm">
              <div className="pt-2 first:pt-0 flex items-start justify-between">
                <span className="text-slate-500 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" /> Employee Name
                </span>
                <span className="font-semibold text-slate-800 text-right">
                  {record.employeeName || 'Not Specified'}
                </span>
              </div>

              <div className="pt-2 flex items-start justify-between">
                <span className="text-slate-500 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" /> Clinic Name
                </span>
                <span className="font-semibold text-slate-800 text-right max-w-[220px]">
                  {record.clinicName || 'Unknown'}
                </span>
              </div>

              <div className="pt-2 flex items-start justify-between">
                <span className="text-slate-500 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-slate-400" /> Illness Summary
                </span>
                <span className="font-medium text-amber-800 bg-amber-50 px-2 py-1 rounded text-right max-w-[220px]">
                  {record.illnessSummary || 'General Consultation'}
                </span>
              </div>

              <div className="pt-2 flex items-start justify-between">
                <span className="text-slate-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" /> Visit Date
                </span>
                <span className="font-medium text-slate-700">
                  {record.visitDate || 'N/A'}
                </span>
              </div>

              <div className="pt-2 flex items-start justify-between">
                <span className="text-slate-500 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" /> Receipt / Bill #
                </span>
                <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {record.receiptNumber || 'N/A'}
                </span>
              </div>

              {record.notes && (
                <div className="pt-2">
                  <span className="text-xs font-medium text-slate-500 block mb-1">
                    Medications & Observations:
                  </span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {record.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-auto pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
