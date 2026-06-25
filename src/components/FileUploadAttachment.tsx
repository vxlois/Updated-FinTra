import React, { useState, useRef } from 'react';
import { Upload, File, FileText, Trash2, Check, AlertCircle } from 'lucide-react';

interface Attachment {
  name: string;
  size: string;
  dateAdded: string;
}

interface FileUploadAttachmentProps {
  attachments: Attachment[];
  onAddAttachment: (name: string, size: string) => void;
  onRemoveAttachment?: (name: string) => void;
  readOnly?: boolean;
}

export const FileUploadAttachment: React.FC<FileUploadAttachmentProps> = ({
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  readOnly = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const sizeStr = parseFloat(sizeInMB) < 0.1 ? `${(file.size / 1024).toFixed(0)} KB` : `${sizeInMB} MB`;
    
    onAddAttachment(file.name, sizeStr);
    setUploadSuccess(`Successfully attached "${file.name}"`);
    setTimeout(() => setUploadSuccess(null), 3000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Box */}
      {!readOnly && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center ${
            dragActive ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileInputChange}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg"
          />
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-full text-slate-500 mb-3 group-hover:bg-slate-100 transition">
            <Upload className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-sm font-semibold text-slate-700">
            Drag & Drop File or <span className="text-indigo-600 font-bold hover:underline">Browse</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Accepts PDF, Office Documents, Images (Up to 10MB)
          </p>
        </div>
      )}

      {/* Success banner */}
      {uploadSuccess && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Attachments List */}
      <div>
        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          Attached compliance documents ({attachments.length})
        </h5>
        
        {attachments.length === 0 ? (
          <div className="text-xs text-slate-400 p-4 border border-dashed border-slate-200 rounded-lg text-center bg-slate-50/20">
            No files attached yet. Legal compliance documents are required for routing.
          </div>
        ) : (
          <div className="space-y-1.5">
            {attachments.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs hover:bg-slate-100/50 transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <File className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-700 truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-400">{file.size} • Uploaded {file.dateAdded}</p>
                  </div>
                </div>

                {!readOnly && onRemoveAttachment && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveAttachment(file.name);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
