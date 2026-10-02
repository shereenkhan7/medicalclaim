import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, X, FileImage } from 'lucide-react';
import { UploadQueueItem } from '../types';

interface Props {
  queue: UploadQueueItem[];
  onDismiss: (id: string) => void;
  onClearFinished: () => void;
}

export const UploadQueue: React.FC<Props> = ({ queue, onDismiss, onClearFinished }) => {
  if (queue.length === 0) return null;

  const hasFinished = queue.some((q) => q.status === 'success' || q.status === 'error');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            OCR Extraction Queue ({queue.length})
          </span>
          {queue.some((q) => q.status === 'processing') && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
              <Loader2 className="w-3 h-3 animate-spin" />
              Scanning receipts with Gemini OCR...
            </span>
          )}
        </div>

        {hasFinished && (
          <button
            type="button"
            onClick={onClearFinished}
            className="text-[11px] font-medium text-slate-400 hover:text-slate-600 transition"
          >
            Clear finished
          </button>
        )}
      </div>

      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
        {queue.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-3 rounded-xl border text-xs transition ${
              item.status === 'processing'
                ? 'bg-teal-50/50 border-teal-200'
                : item.status === 'success'
                ? 'bg-emerald-50/50 border-emerald-200'
                : item.status === 'error'
                ? 'bg-rose-50/50 border-rose-200'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                <img
                  src={item.previewUrl}
                  alt={item.file.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="overflow-hidden">
                <p className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-xs">
                  {item.file.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {(item.file.size / 1024).toFixed(1)} KB
                  </span>
                  {item.status === 'processing' && (
                    <span className="text-[10px] font-semibold text-teal-700 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Extracting details...
                    </span>
                  )}
                  {item.status === 'success' && (
                    <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Added to table: ${item.extractedRecord?.grandTotal.toFixed(2)}
                    </span>
                  )}
                  {item.status === 'error' && (
                    <span className="text-[10px] font-semibold text-rose-700 flex items-center gap-1 truncate max-w-[240px]">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {item.error || 'Failed to extract'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onDismiss(item.id)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
