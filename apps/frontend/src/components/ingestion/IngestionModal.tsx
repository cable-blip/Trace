import React, { useState } from 'react';
import { UploadCloud, X, FileText, CheckCircle2, Loader2, Database } from 'lucide-react';
import { uploadDocument, runIngestion } from '../../services/api';

interface IngestionModalProps {
  caseId: string;
  isOpen: boolean;
  onClose: () => void;
  onIngestionComplete: () => void;
}

export const IngestionModal: React.FC<IngestionModalProps> = ({
  caseId,
  isOpen,
  onClose,
  onIngestionComplete,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...droppedFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const handleUploadAndIngest = async () => {
    if (files.length === 0 || uploading) return;
    setUploading(true);
    setStatusMessage('Uploading documents to backend case workspace...');
    try {
      for (const file of files) {
        await uploadDocument(caseId, file);
      }
      setStatusMessage('Executing Hybrid NLP Extractor & Entity Resolver...');
      await runIngestion(caseId);
      setStatusMessage('Ingestion complete! Graph network updated.');
      onIngestionComplete();
      setTimeout(() => {
        setFiles([]);
        setStatusMessage('');
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
      setStatusMessage('Ingestion failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface border border-surface-border w-full max-w-lg rounded-lg p-4 font-sans shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-accent-cyan" />
            <h3 className="text-sm font-semibold tracking-wider text-text-primary uppercase font-mono">
              Ingest Investigation Dataset
            </h3>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary p-1 text-xs">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drag & Drop Dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          onClick={() => {
            const el = document.getElementById('ingest-modal-file-input');
            if (el) el.click();
          }}
          className="border-2 border-dashed border-surface-border hover:border-accent-cyan/50 bg-surface-elevated/50 p-6 rounded-lg flex flex-col items-center justify-center cursor-pointer transition text-center"
        >
          <UploadCloud className="w-10 h-10 text-accent-cyan mb-2 opacity-80 animate-bounce" />
          <span className="text-xs font-semibold text-text-primary">
            Drag & Drop FIR, CDR, Bank Statement or Surveillance Records
          </span>
          <span className="text-[11px] font-mono text-text-muted mt-1">
            Supports .TXT, .CSV, .JSON, .PDF files
          </span>
          <input
            id="ingest-modal-file-input"
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {/* Selected File Queue */}
        {files.length > 0 && (
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            <div className="text-[11px] font-mono text-text-muted uppercase tracking-wider mb-1">
              Queued Documents ({files.length})
            </div>
            {files.map((f, idx) => (
              <div
                key={idx}
                className="bg-surface-elevated p-2 rounded border border-surface-border flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-3.5 h-3.5 text-accent-cyan" />
                  <span className="text-text-primary truncate">{f.name}</span>
                </div>
                <span className="text-text-muted text-[10px]">
                  {(f.size / 1024).toFixed(1)} KB
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Status Message */}
        {statusMessage && (
          <div className="bg-surface-elevated p-2.5 rounded border border-surface-border flex items-center gap-2 text-xs font-mono text-accent-cyan">
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-accent-emerald" />}
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Action Footer */}
        <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-surface border border-surface-border rounded text-xs font-mono text-text-secondary hover:text-text-primary"
          >
            Cancel
          </button>
          <button
            onClick={handleUploadAndIngest}
            disabled={files.length === 0 || uploading}
            className="px-4 py-1.5 bg-accent-cyan hover:bg-accent-cyan/80 text-background rounded text-xs font-semibold font-mono flex items-center gap-1.5 transition disabled:opacity-50"
          >
            {uploading ? 'Processing...' : 'Start Extraction Pipeline'}
          </button>
        </div>
      </div>
    </div>
  );
};
