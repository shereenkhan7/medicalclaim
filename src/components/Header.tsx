import React from 'react';
import { Stethoscope, FileSpreadsheet, PlusCircle, ShieldCheck } from 'lucide-react';
import { MedicalRecord } from '../types';
import { exportRecordsToExcel } from '../utils/exportToExcel';

interface Props {
  records: MedicalRecord[];
  onAddManual: () => void;
}

export const Header: React.FC<Props> = ({ records, onAddManual }) => {
  const totalGrand = records.reduce((sum, r) => sum + (Number(r.grandTotal) || 0), 0);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                Medi<span className="text-teal-600">Claim</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                <ShieldCheck className="w-3 h-3 text-teal-600" />
                OCR Powered
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Medical Cost Submission &amp; Invoice Extraction
            </p>
          </div>
        </div>

        {/* Header Right Action Items */}
        <div className="flex items-center gap-3">
          {records.length > 0 && (
            <div className="hidden md:flex flex-col text-right mr-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Total Claims
              </span>
              <span className="text-sm font-bold text-teal-800 font-mono">
                ${totalGrand.toFixed(2)} ({records.length})
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={onAddManual}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            <PlusCircle className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">Add Record</span>
          </button>

          <button
            type="button"
            onClick={() => exportRecordsToExcel(records)}
            disabled={records.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-xl shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export to Excel</span>
          </button>
        </div>
      </div>
    </header>
  );
};
