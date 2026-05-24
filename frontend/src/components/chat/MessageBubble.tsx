'use client';

import { useState } from 'react';
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
    <div className={`message-row ${isAI ? '' : 'user'}`}>
      <div className={`message-avatar ${isAI ? 'assistant' : 'user'}`}>
        {isAI ? <Bot size={14} /> : <User size={14} />}
      </div>

      <div className={`message-body ${isAI ? '' : 'user'}`}>
        {isAI ? (
          <div className="group chat-message-ai">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code: ({ className, children, ...props }: { className?: string; children?: React.ReactNode }) => {
                    const isInline = !className;
                    if (isInline) {
                      return <code {...props}>{children}</code>;
                    }
                    return (
                      <pre className="!my-3">
                        <code className={className}>{children}</code>
                      </pre>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>

            {isStreaming && (
              <span className="inline-block w-0.5 h-4 bg-[var(--brand-400)] animate-pulse ml-0.5 align-middle" />
            )}

            {!isStreaming && (
              <div className="flex items-center gap-3 mt-3 pt-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                </button>
                {message.citations && message.citations.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCitationsOpen(!citationsOpen)}
                    className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--brand-400)]"
                  >
                    <BookOpen size={12} />
                    {message.citations.length} source{message.citations.length > 1 ? 's' : ''}
                  </button>
                )}
              </div>
            )}

            {citationsOpen && message.citations && message.citations.length > 0 && (
              <div className="mt-3 space-y-2">
                {message.citations.map((citation, i) => (
                  <div key={i} className="surface p-3 text-xs">
                    <div className="flex items-center gap-2 mb-1 text-[var(--brand-400)] font-medium">
                      <BookOpen size={12} />
                      {citation.chapter}
                      {citation.page != null && (
                        <span className="text-[var(--text-muted)] font-normal">· p. {citation.page}</span>
                      )}
                    </div>
                    <p className="text-[var(--text-secondary)] leading-relaxed">{citation.excerpt}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="chat-message-user">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        )}
      </div>
    </div>
  );
}
