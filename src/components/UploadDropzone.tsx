import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileImage, Sparkles, Loader2, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { SAMPLE_RECEIPTS_DATA, generateReceiptImage } from '../utils/sampleReceipts';

interface Props {
  onProcessImage: (file: File, previewUrl: string) => Promise<void>;
  isProcessing: boolean;
  queueCount: number;
}

export const UploadDropzone: React.FC<Props> = ({
  onProcessImage,
  isProcessing,
  queueCount,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [generatingSampleId, setGeneratingSampleId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clipboard paste listener for images
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.items) {
        for (const item of Array.from(e.clipboardData.items)) {
          if (item.type.indexOf('image') !== -1) {
            const blob = item.getAsFile();
            if (blob) {
              const previewUrl = URL.createObjectURL(blob);
              onProcessImage(blob, previewUrl);
            }
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onProcessImage]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        onProcessImage(file, previewUrl);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleTestSample = async (sampleConfig: typeof SAMPLE_RECEIPTS_DATA[0]) => {
    try {
      setGeneratingSampleId(sampleConfig.id);
      const { file, dataUrl } = await generateReceiptImage(sampleConfig);
      await onProcessImage(file, dataUrl);
    } catch (err) {
      console.error('Failed to generate sample receipt image:', err);
    } finally {
      setGeneratingSampleId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all">
      <div className="p-6 md:p-8">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragOver
              ? 'border-teal-500 bg-teal-50/60 scale-[1.005]'
              : 'border-slate-300 hover:border-teal-500/80 bg-slate-50/60 hover:bg-slate-50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFiles(e.target.files)}
            multiple
            accept="image/png,image/jpeg,image/webp,image/jpg"
            className="hidden"
          />

          <div className="max-w-md mx-auto flex flex-col items-center">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
                isDragOver ? 'bg-teal-600 text-white scale-110 shadow-lg shadow-teal-500/20' : 'bg-teal-100 text-teal-700'
              }`}
            >
              {isProcessing ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <UploadCloud className="w-8 h-8" />
              )}
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-1">
              {isProcessing
                ? 'Processing & Extracting with AI OCR...'
                : 'Upload Medical Receipt or Bill'}
            </h3>

            <p className="text-sm text-slate-500 mb-4">
              Drag & drop receipt image here, or{' '}
              <span className="text-teal-600 font-semibold underline underline-offset-2">
                browse files
              </span>
              {' '}&bull; Paste from clipboard (Ctrl+V)
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-200/70 text-slate-600 text-xs font-medium">
              <FileImage className="w-3.5 h-3.5" />
              <span>JPG, PNG, WEBP &bull; Multi-file upload supported</span>
            </div>
          </div>
        </div>

        {/* Instant Sample Receipts Section for Quick Testing */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Don't have a receipt image? Try with realistic sample bills:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {SAMPLE_RECEIPTS_DATA.map((sample) => {
              const isCurrent = generatingSampleId === sample.id;
              return (
                <button
                  key={sample.id}
                  type="button"
                  disabled={isProcessing}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTestSample(sample);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 hover:border-teal-300 transition text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCurrent ? (
                    <Loader2 className="w-3 h-3 animate-spin text-teal-700" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  )}
                  <span>{sample.badge} (${sample.grandTotal.toFixed(2)})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
