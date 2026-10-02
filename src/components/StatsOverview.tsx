import React from 'react';
import { DollarSign, FileCheck, Receipt, Building2 } from 'lucide-react';
import { MedicalRecord } from '../types';

interface Props {
  records: MedicalRecord[];
}

export const StatsOverview: React.FC<Props> = ({ records }) => {
  const totalSubTotal = records.reduce((sum, r) => sum + (Number(r.subTotal) || 0), 0);
  const totalGst = records.reduce((sum, r) => sum + (Number(r.gst) || 0), 0);
  const totalGrandTotal = records.reduce((sum, r) => sum + (Number(r.grandTotal) || 0), 0);

  const uniqueEmployees = new Set(records.map((r) => r.employeeName).filter(Boolean)).size;
  const uniqueClinics = new Set(records.map((r) => r.clinicName).filter(Boolean)).size;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Grand Total */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-teal-500/40 transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Grand Total
          </span>
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          ${totalGrandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Total claimable reimbursable amount
        </p>
      </div>

      {/* Sub-Total */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-slate-300 transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Net Sub-Total
          </span>
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          ${totalSubTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Excluding tax / GST
        </p>
      </div>

      {/* GST Amount */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-slate-300 transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total GST
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <span className="text-xs font-bold font-mono">GST</span>
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-amber-700 tracking-tight">
          ${totalGst.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Input tax recoverable
        </p>
      </div>

      {/* Claims count */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-slate-300 transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Submitted Claims
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <FileCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {records.length}
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Across {uniqueEmployees} employee{uniqueEmployees !== 1 ? 's' : ''} &amp; {uniqueClinics} clinic{uniqueClinics !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};
