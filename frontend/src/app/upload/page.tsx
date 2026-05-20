'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle2, XCircle, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress: number;
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const id = Math.random().toString(36).slice(2);
      const newFile: UploadedFile = {
        id, name: file.name, size: file.size,
        status: 'uploading', progress: 0,
      };
      setFiles((prev) => [...prev, newFile]);

      // Simulate progress then upload
      const interval = setInterval(() => {
        setFiles((prev) =>
          prev.map((f) => f.id === id && f.progress < 90
            ? { ...f, progress: f.progress + 10 }
            : f
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
            prev.map((f) => f.id === id ? { ...f, status: 'processing', progress: 100 } : f)
          );
          // Poll for ready status
          setTimeout(() => {
            setFiles((prev) =>
              prev.map((f) => f.id === id ? { ...f, status: 'ready' } : f)
            );
          }, 5000);
        } else {
          clearInterval(interval);
          setFiles((prev) =>
            prev.map((f) => f.id === id ? { ...f, status: 'error', progress: 100 } : f)
          );
        }
      } catch {
        clearInterval(interval);
        setFiles((prev) =>
          prev.map((f) => f.id === id ? { ...f, status: 'error' } : f)
        );
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

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const formatSize = (bytes: number) =>
    bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold mb-1">Upload PDF Book</h1>
            <p className="text-[var(--text-secondary)] mb-8">
              Upload any DSA book and BuggyBot will learn from it instantly.
            </p>

            {/* Pre-loaded notice */}
            <div className="glass-card p-4 mb-8 flex items-start gap-3 border border-green-500/20">
              <CheckCircle2 size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-400">Grokking Algorithms pre-loaded</p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  BuggyBot already knows the full Grokking Algorithms book. You can start chatting right away!
                </p>
                <Link href="/dashboard" className="text-xs text-blue-400 hover:underline mt-1 inline-block">
                  Start chatting →
                </Link>
              </div>
            </div>

            {/* Drop zone */}
            <div
              {...getRootProps()}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragging
                  ? 'border-blue-500 bg-blue-500/10 scale-[1.02]'
                  : 'border-white/10 hover:border-white/20 hover:bg-white/2'
              }`}
              id="pdf-dropzone"
            >
              <input {...getInputProps()} id="pdf-file-input" />
              <motion.div
                animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                  isDragging
                    ? 'bg-blue-500/15 border border-blue-500/30'
                    : 'bg-[var(--bg-secondary)] border border-white/10'
                }`}>
                  <Upload size={28} className={isDragging ? 'text-blue-400' : 'text-[var(--text-muted)]'} />
                </div>
                <div>
                  <p className="font-semibold mb-1">
                    {isDragging ? 'Drop your PDF here!' : 'Drag & drop your PDF book'}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    or click to browse · PDF only · Max 50MB
                  </p>
                </div>
              </motion.div>
            </div>

            {/* File list */}
            <AnimatePresence>
              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 space-y-3"
                >
                  {files.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="glass-card p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          file.status === 'ready' ? 'bg-green-500/20' :
                          file.status === 'error' ? 'bg-red-500/20' :
                          'bg-blue-500/20'
                        }`}>
                          {file.status === 'ready' ? <CheckCircle2 size={18} className="text-green-400" />
                          : file.status === 'error' ? <XCircle size={18} className="text-red-400" />
                          : file.status === 'processing' ? <Loader2 size={18} className="text-blue-400 animate-spin" />
                          : <FileText size={18} className="text-blue-400" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {formatSize(file.size)} · {
                              file.status === 'ready' ? '✅ Ready to chat!' :
                              file.status === 'error' ? '❌ Upload failed' :
                              file.status === 'processing' ? '⚙️ Processing chunks...' :
                              '📤 Uploading...'
                            }
                          </p>
                          {(file.status === 'uploading' || file.status === 'processing') && (
                            <div className="mt-2 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-blue-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${file.status === 'processing' ? 100 : file.progress}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                          )}
                        </div>

                        <button onClick={() => removeFile(file.id)} className="btn-ghost p-1.5 text-[var(--text-muted)] hover:text-red-400">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
