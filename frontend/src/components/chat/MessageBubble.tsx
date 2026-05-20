'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, Copy, Check, BookOpen } from 'lucide-react';
import { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export default function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [citationsOpen, setCitationsOpen] = useState(false);
  const isAI = message.role === 'assistant';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isAI ? 'flex-row' : 'flex-row-reverse'}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 ${
        isAI
          ? 'bg-[var(--bg-card-hover)] border border-white/10 text-blue-400'
          : 'bg-blue-500 text-white'
      }`}>
        {isAI
          ? <Bot size={15} />
          : <User size={15} />
        }
      </div>

      {/* Bubble */}
      <div className={`flex-1 min-w-0 ${isAI ? '' : 'flex flex-col items-end'}`}>
        {isAI ? (
          <div className="group relative">
            <div className="prose prose-sm max-w-none text-[var(--text-primary)]">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }: { className?: string; children?: React.ReactNode; [key: string]: unknown }) {
                    const isInline = !className;
                    if (isInline) {
                      return <code className="bg-blue-500/10 text-blue-300 px-1.5 py-0.5 rounded font-mono text-xs" {...props}>{children}</code>;
                    }
                    return (
                      <div className="relative my-4">
                        <div className="flex items-center justify-between px-4 py-2 bg-[#0d1117] rounded-t-xl border border-white/5">
                          <span className="text-xs text-[var(--text-muted)] font-mono">
                            {className?.replace('language-', '') || 'code'}
                          </span>
                          <CopyCodeButton code={String(children)} />
                        </div>
                        <pre className="!mt-0 !rounded-t-none bg-[#0d1117] border border-white/5 border-t-0 rounded-b-xl overflow-x-auto p-4">
                          <code className="text-sm font-mono text-gray-300">{children}</code>
                        </pre>
                      </div>
                    );
                  },
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4">
                      <table className="min-w-full border-collapse border border-white/10 rounded-lg overflow-hidden">
                        {children}
                      </table>
                    </div>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>

            {isStreaming && (
              <span className="inline-block w-0.5 h-4 bg-blue-400 animate-pulse ml-1 align-middle" />
            )}

            {/* Action bar */}
            {!isStreaming && (
              <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-white transition-colors"
                  id="copy-message-btn"
                >
                  {copied ? <><Check size={12} className="text-green-400" /> Copied</> : <><Copy size={12} /> Copy</>}
                </button>

                {message.citations && message.citations.length > 0 && (
                  <button
                    onClick={() => setCitationsOpen(!citationsOpen)}
                    className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-blue-400 transition-colors"
                  >
                    <BookOpen size={12} />
                    {message.citations.length} source{message.citations.length > 1 ? 's' : ''}
                  </button>
                )}
              </div>
            )}

            {/* Citations */}
            {citationsOpen && message.citations && message.citations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 space-y-2"
              >
                {message.citations.map((citation, i) => (
                  <div key={i} className="glass rounded-xl p-3 border border-blue-500/10">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen size={12} className="text-blue-400" />
                      <span className="text-xs font-medium text-blue-400">{citation.chapter}</span>
                      {citation.page && (
                        <span className="text-xs text-[var(--text-muted)]">· Page {citation.page}</span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed">
                      &quot;{citation.excerpt}&quot;
                    </p>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        ) : (
          <div className="chat-message-user">
            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-xs text-[var(--text-muted)] hover:text-white transition-colors flex items-center gap-1"
    >
      {copied ? <><Check size={11} className="text-green-400" /> Copied</> : <><Copy size={11} /> Copy</>}
    </button>
  );
}
