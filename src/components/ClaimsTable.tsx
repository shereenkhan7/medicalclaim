import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Trash2,
  Edit2,
  Eye,
  Plus,
  ArrowUpDown,
  Building2,
  User,
  Stethoscope,
  Receipt,
  FileSpreadsheet,
  AlertTriangle,
  ChevronDown,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { MedicalRecord } from '../types';
import { exportRecordsToExcel } from '../utils/exportToExcel';

interface Props {
  records: MedicalRecord[];
  onEditRecord: (record: MedicalRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
  onPreviewRecord: (record: MedicalRecord) => void;
  onAddManual: () => void;
}

type SortField = 'createdAt' | 'employeeName' | 'clinicName' | 'subTotal' | 'gst' | 'grandTotal' | 'visitDate';
type SortOrder = 'asc' | 'desc';

export const ClaimsTable: React.FC<Props> = ({
  records,
  onEditRecord,
  onDeleteRecord,
  onClearAll,
  onPreviewRecord,
  onAddManual,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const term = searchTerm.toLowerCase().trim();
      if (!term) return true;
      return (
        rec.employeeName.toLowerCase().includes(term) ||
        rec.clinicName.toLowerCase().includes(term) ||
        rec.illnessSummary.toLowerCase().includes(term) ||
        (rec.receiptNumber && rec.receiptNumber.toLowerCase().includes(term)) ||
        (rec.notes && rec.notes.toLowerCase().includes(term))
      );
    });
  }, [records, searchTerm]);

  // Sort records
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'subTotal' || sortField === 'gst' || sortField === 'grandTotal') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else {
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredRecords, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.size === sortedRecords.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedRecords.map((r) => r.id)));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleExportExcel = () => {
    const recordsToExport =
      selectedIds.size > 0
        ? records.filter((r) => selectedIds.has(r.id))
        : records;
    exportRecordsToExcel(recordsToExport);
  };

  // Running totals for the current view
  const currentSubTotal = sortedRecords.reduce((sum, r) => sum + (Number(r.subTotal) || 0), 0);
  const currentGst = sortedRecords.reduce((sum, r) => sum + (Number(r.gst) || 0), 0);
  const currentGrandTotal = sortedRecords.reduce((sum, r) => sum + (Number(r.grandTotal) || 0), 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* Table Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-800">
                Medical Claims Submission Table
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800">
                {records.length} {records.length === 1 ? 'record' : 'records'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Extracted via OCR &bull; Ready for employer audit &amp; Excel submission
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Search box */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search employee, clinic, illness..."
              className="w-full sm:w-64 pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
            />
          </div>

          <button
            type="button"
            onClick={onAddManual}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition"
          >
            <Plus className="w-3.5 h-3.5 text-teal-600" />
            <span>Add Manual Record</span>
          </button>

          {/* Export to Excel (.xlsx) button */}
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={records.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download formatted Excel spreadsheet"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>
              {selectedIds.size > 0
                ? `Download XLSX (${selectedIds.size})`
                : 'Download XLSX'}
            </span>
          </button>

          {records.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
              title="Clear all records"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Table view */}
      <div className="overflow-x-auto min-h-[300px]">
        {records.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
              <Receipt className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              No medical claim records yet
            </h3>
            <p className="text-xs text-slate-500 max-w-md mb-5">
              Upload or drag and drop a medical receipt / clinic invoice above. The OCR system will automatically parse the Employee, Clinic, Sub-Total, GST, Grand Total, and Illness summary.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onAddManual}
                className="px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl border border-teal-200 transition"
              >
                + Add Record Manually
              </button>
            </div>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/75 text-slate-600 font-semibold uppercase tracking-wider select-none">
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="text-slate-400 hover:text-slate-700 transition"
                  >
                    {selectedIds.size === sortedRecords.length && sortedRecords.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-teal-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-2 w-12 text-slate-400">#</th>
                <th
                  onClick={() => handleSort('employeeName')}
                  className="py-3 px-4 cursor-pointer hover:text-teal-700 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>1. Name of Employee</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('clinicName')}
                  className="py-3 px-4 cursor-pointer hover:text-teal-700 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>2. Clinic Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('subTotal')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-teal-700 transition"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>3. Sub-Total</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('gst')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-teal-700 transition"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>4. GST</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('grandTotal')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-teal-700 transition font-bold text-teal-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>5. Grand Total</span>
                    <ArrowUpDown className="w-3 h-3 text-teal-700" />
                  </div>
                </th>
                <th className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                    <span>6. Summary of Illness</span>
                  </div>
                </th>
                <th className="py-3 px-3 text-slate-500">Visit Date</th>
                <th className="py-3 px-4 text-center">Receipt</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedRecords.map((record, index) => {
                const isSelected = selectedIds.has(record.id);
                return (
                  <tr
                    key={record.id}
                    className={`hover:bg-teal-50/40 transition group ${
                      isSelected ? 'bg-teal-50/70' : index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleSelectRow(record.id)}
                        className="text-slate-400 hover:text-slate-600 transition"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-teal-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Row Index */}
                    <td className="py-3 px-2 text-slate-400 font-mono text-[11px]">
                      {index + 1}
                    </td>

                    {/* 1. Name of Employee */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        <span>{record.employeeName || 'Not Specified'}</span>
                      </div>
                      {record.receiptNumber && record.receiptNumber !== 'N/A' && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          Bill: {record.receiptNumber}
                        </div>
                      )}
                    </td>

                    {/* 2. Clinic Name */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 line-clamp-1 max-w-[200px]" title={record.clinicName}>
                        {record.clinicName || 'Unknown Clinic'}
                      </div>
                    </td>

                    {/* 3. Sub-Total */}
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      ${record.subTotal.toFixed(2)}
                    </td>

                    {/* 4. GST */}
                    <td className="py-3 px-4 text-right font-mono text-amber-700">
                      ${record.gst.toFixed(2)}
                    </td>

                    {/* 5. Grand Total */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-teal-900 text-[13px]">
                      ${record.grandTotal.toFixed(2)}
                    </td>

                    {/* 6. Summary of Illness */}
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/70 font-medium text-[11px] max-w-[240px] truncate" title={record.illnessSummary}>
                        {record.illnessSummary || 'General Consultation'}
                      </div>
                      {record.notes && (
                        <p className="text-[10px] text-slate-400 truncate max-w-[240px] mt-0.5" title={record.notes}>
                          {record.notes}
                        </p>
                      )}
                    </td>

                    {/* Visit Date */}
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                      {record.visitDate || '-'}
                    </td>

                    {/* Receipt Preview Thumbnail */}
                    <td className="py-3 px-4 text-center">
                      {record.receiptImage ? (
                        <button
                          type="button"
                          onClick={() => onPreviewRecord(record)}
                          className="relative inline-block w-8 h-8 rounded-lg overflow-hidden border border-slate-200 hover:border-teal-500 shadow-2xs group transition"
                          title="Click to inspect receipt scan"
                        >
                          <img
                            src={record.receiptImage}
                            alt="thumbnail"
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-150"
                          />
                          <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                            <Eye className="w-3 h-3 text-white" />
                          </div>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">None</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onPreviewRecord(record)}
                          className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                          title="Inspect OCR details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditRecord(record)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRecord(record.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Sticky Table Footer with Computed Totals */}
            <tfoot>
              <tr className="border-t-2 border-slate-300 bg-slate-100/90 font-bold text-slate-800 text-xs">
                <td colSpan={4} className="py-3.5 px-4 text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="uppercase tracking-wider text-[11px] font-bold text-slate-600">
                      Total Submission Summary:
                    </span>
                    <span className="font-semibold text-slate-500">
                      ({sortedRecords.length} items)
                    </span>
                  </div>
                </td>
                {/* 3. Sub-Total sum */}
                <td className="py-3.5 px-4 text-right font-mono text-slate-900">
                  ${currentSubTotal.toFixed(2)}
                </td>
                {/* 4. GST sum */}
                <td className="py-3.5 px-4 text-right font-mono text-amber-700">
                  ${currentGst.toFixed(2)}
                </td>
                {/* 5. Grand Total sum */}
                <td className="py-3.5 px-4 text-right font-mono text-teal-800 text-[14px]">
                  ${currentGrandTotal.toFixed(2)}
                </td>
                <td colSpan={4} className="py-3.5 px-4 text-slate-400 text-[11px] font-normal italic">
                  * All amounts in SGD ($) claimable as per corporate policy
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* Table Footer info */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          Showing {sortedRecords.length} of {records.length} claim record(s)
          {selectedIds.size > 0 && ` &bull; ${selectedIds.size} selected`}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={records.length === 0}
            className="text-emerald-700 font-semibold hover:underline flex items-center gap-1 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download records as .xlsx</span>
          </button>
        </div>
      </div>
    </div>
  );
};
