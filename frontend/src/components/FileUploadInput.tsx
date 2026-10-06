'use client';

import React, { useState, useRef } from 'react';
import { Upload, CheckCircle2, AlertCircle, FileText, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { api } from '../lib/api';

interface FileUploadInputProps {
  label: string;
  sublabel?: string;
  accept?: string;
  value?: string;
  onChange: (url: string) => void;
  required?: boolean;
  helperText?: string;
  isSelfie?: boolean;
}

export const FileUploadInput: React.FC<FileUploadInputProps> = ({
  label,
  sublabel,
  accept = 'image/*,application/pdf',
  value,
  onChange,
  required = false,
  helperText,
  isSelfie = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      return;
    }

    setError(null);
    setIsUploading(true);
    setFileName(file.name);

    try {
      // Read as base64 data url
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const res = await api.uploadFile(base64Data, file.name);
          if (res?.url) {
            onChange(res.url);
          } else {
            setError('Failed to upload file. Please try again.');
          }
        } catch (uploadErr: any) {
          setError(uploadErr.message || 'Upload failed.');
        } finally {
          setIsUploading(false);
        }
      };
      reader.onerror = () => {
        setError('Could not read selected file.');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || 'Error uploading file.');
      setIsUploading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isImage = value && (value.endsWith('.png') || value.endsWith('.jpg') || value.endsWith('.jpeg') || value.endsWith('.webp') || value.startsWith('data:image'));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {sublabel && <span className="text-[11px] text-gray-500">{sublabel}</span>}
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
          value
            ? 'border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50/70'
            : isUploading
            ? 'border-primary-400 bg-primary-50/30'
            : 'border-gray-300 hover:border-primary-500 hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center py-2 space-y-2">
            <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
            <span className="text-xs text-primary-700 font-medium">Uploading document securely...</span>
          </div>
        ) : value ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-left">
              {isImage ? (
                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-emerald-300 flex-shrink-0">
                  <img src={value} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
              )}
              <div>
                <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Uploaded & Attached
                </div>
                <div className="text-[11px] text-gray-600 truncate max-w-[200px]">
                  {fileName || value.split('/').pop()}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-white transition-colors"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2 space-y-1.5">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              {isSelfie ? <ImageIcon className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
            </div>
            <div className="text-xs font-semibold text-gray-800">
              Click to select or drag & drop {isSelfie ? 'photo' : 'document'}
            </div>
            <div className="text-[10px] text-gray-500">
              JPG, PNG, PDF up to 10MB
            </div>
          </div>
        )}
      </div>

      {helperText && <p className="text-[11px] text-gray-500">{helperText}</p>}
      {error && (
        <div className="flex items-center gap-1.5 text-red-600 text-[11px] mt-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
