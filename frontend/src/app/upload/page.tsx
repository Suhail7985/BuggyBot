'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle2, XCircle, Loader2, Trash2, Menu } from 'lucide-react';
import Link from 'next/link';
import { useChatStore } from '@/store/chatStore';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress: number;
}

export default function UploadPage() {
  const { setSidebarOpen } = useChatStore();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const id = Math.random().toString(36).slice(2);
      const newFile: UploadedFile = {
        id,
        name: file.name,
        size: file.size,
        status: 'uploading',
        progress: 0,
      };
      setFiles((prev) => [...prev, newFile]);

      const interval = setInterval(() => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id && f.progress < 90 ? { ...f, progress: f.progress + 10 } : f
          )
        );
      }, 200);

      try {
        const formData = new FormData();
        formData.append('pdf', file);

        const res = await fetch('/api/backend/upload/pdf', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        clearInterval(interval);

        if (res.ok) {
          setFiles((prev) =>
            prev.map((f) => (f.id === id ? { ...f, status: 'processing', progress: 100 } : f))
          );
          setTimeout(() => {
            setFiles((prev) =>
              prev.map((f) => (f.id === id ? { ...f, status: 'ready' } : f))
            );
          }, 5000);
        } else {
          setFiles((prev) =>
            prev.map((f) => (f.id === id ? { ...f, status: 'error', progress: 100 } : f))
          );
        }
      } catch {
        clearInterval(interval);
        setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, status: 'error' } : f)));
      }
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 50 * 1024 * 1024,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  const formatSize = (bytes: number) =>
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <>
      <header className="app-header">
        <div className="content-container app-header-inner">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="btn-ghost btn-icon md:hidden"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <h1 className="text-sm font-medium">Upload</h1>
          </div>
        </div>
      </header>

      <div className="chat-scroll">
        <div className="content-container py-8 max-w-lg">
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Upload a PDF textbook to index it for source-grounded answers.
          </p>

          <div className="surface p-4 mb-6 flex gap-3">
            <CheckCircle2 size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Default material</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Grokking Algorithms can be pre-indexed. You may chat immediately from the dashboard.
              </p>
              <Link href="/dashboard" className="text-xs text-[var(--brand-400)] mt-2 inline-block hover:underline">
                Open chat →
              </Link>
            </div>
          </div>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-[var(--brand-500)] bg-[var(--bg-elevated)]'
                : 'border-[var(--border)] hover:border-[#3f3f46]'
            }`}
            id="pdf-dropzone"
          >
            <input {...getInputProps()} id="pdf-file-input" />
            <Upload size={28} className="mx-auto mb-3 text-[var(--text-muted)]" />
            <p className="text-sm font-medium mb-1">
              {isDragging ? 'Drop PDF here' : 'Drag and drop a PDF'}
            </p>
            <p className="text-xs text-[var(--text-muted)]">or click to browse · max 50 MB</p>
          </div>

          {files.length > 0 && (
            <ul className="mt-6 space-y-3">
              {files.map((file) => (
                <li key={file.id} className="surface p-4 flex items-center gap-3">
                  <div className="message-avatar assistant w-10 h-10">
                    {file.status === 'ready' ? (
                      <CheckCircle2 size={18} className="text-green-500" />
                    ) : file.status === 'error' ? (
                      <XCircle size={18} className="text-red-400" />
                    ) : file.status === 'processing' ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <FileText size={18} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {formatSize(file.size)} ·{' '}
                      {file.status === 'ready'
                        ? 'Ready'
                        : file.status === 'error'
                          ? 'Failed'
                          : file.status === 'processing'
                            ? 'Processing'
                            : 'Uploading'}
                    </p>
                    {file.status === 'uploading' && (
                      <div className="mt-2 h-1 bg-[var(--border)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--brand-500)] transition-all"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((f) => f.id !== file.id))}
                    className="btn-ghost btn-icon"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
