'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { SendHorizonal, Bot, User, StopCircle, BookOpen, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DemoMessage {
  role: 'user' | 'assistant';
  content: string;
  citations?: { chapter: string; page?: number; excerpt: string }[];
}

const SUGGESTIONS = [
  'Explain binary search and its time complexity.',
  'Compare BFS and DFS on graphs.',
  'What is Big O notation?',
];

export default function DemoChat() {
  const [messages, setMessages] = useState<DemoMessage[]>([
    {
      role: 'assistant',
      content:
        'Welcome. I can help with data structures, algorithms, and debugging. Ask a question to begin.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (override?: string) => {
    const msg = (override ?? input).trim();
    if (!msg || isStreaming) return;

    setInput('');
    setIsStreaming(true);
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);

    let accumulated = '';
    let pendingCitations: DemoMessage['citations'] = [];
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/ai/rag/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: msg,
          chatHistory: history,
          mode: 'chat',
          collectionName: 'grokking_algorithms',
        }),
      });

      if (!res.ok || !res.body) throw new Error('unreachable');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const raw = line.slice(5).trim();
          if (raw === '[DONE]') return;

          try {
            const evt = JSON.parse(raw);
            if (evt.type === 'token' && evt.content) {
              accumulated += evt.content;
              const snap = accumulated;
              const cits = pendingCitations;
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = { role: 'assistant', content: snap, citations: cits };
                return next;
              });
            } else if (evt.type === 'citations') {
              pendingCitations = evt.citations;
            }
          } catch {
            /* skip */
          }
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: 'assistant',
            content: '**Service unavailable.** Ensure the AI service is running on port 8000.',
          };
          return next;
        });
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  return (
    <div className="surface flex flex-col overflow-hidden" style={{ height: '480px' }}>
      <div className="flex items-center justify-between px-4 h-12 border-b border-[var(--border)] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="message-avatar assistant w-7 h-7">
            <Bot size={14} />
          </div>
          <span className="text-sm font-medium">Demo chat</span>
        </div>
        <span className="text-[11px] text-[var(--text-muted)] px-2 py-0.5 rounded-full border border-[var(--border)]">
          Preview
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`message-row ${msg.role === 'user' ? 'user' : ''}`}>
            <div className={`message-avatar ${msg.role === 'user' ? 'user' : 'assistant'}`}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className={`message-body ${msg.role === 'user' ? 'user' : ''}`}>
              {msg.role === 'user' ? (
                <div className="chat-message-user">
                  <p className="text-sm">{msg.content}</p>
                </div>
              ) : msg.content === '' ? (
                <div className="analyzing-status">
                  <Loader2 size={14} className="analyzing-spinner" aria-hidden />
                  <span>Analyzing…</span>
                </div>
              ) : (
                <div className="chat-message-ai prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 not-prose">
                      {msg.citations.slice(0, 3).map((c, ci) => (
                        <span
                          key={ci}
                          className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md border border-[var(--border)] text-[var(--text-muted)]"
                        >
                          <BookOpen size={10} />
                          {c.chapter}
                          {c.page != null ? ` · p.${c.page}` : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2 flex-shrink-0">
          {SUGGESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleSend(q)}
              disabled={isStreaming}
              className="text-xs px-3 py-1.5 rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[#3f3f46] disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="p-3 border-t border-[var(--border)] flex-shrink-0">
        <div className="composer-box">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={isStreaming ? 'Analyzing your question…' : 'Ask a question…'}
            className="composer-textarea"
            disabled={isStreaming}
            id="demo-chat-input"
          />
          {isStreaming ? (
            <button
              type="button"
              onClick={() => abortRef.current?.abort()}
              className="btn-ghost btn-icon text-red-400"
            >
              <StopCircle size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="btn-primary btn-icon disabled:opacity-40"
            >
              <SendHorizonal size={18} />
            </button>
          )}
        </div>
        {isStreaming ? (
          <p className="text-[11px] text-center text-[var(--brand-400)] mt-2 flex items-center justify-center gap-1.5">
            <Loader2 size={12} className="analyzing-spinner" />
            Analyzing…
          </p>
        ) : (
          <p className="text-[11px] text-center text-[var(--text-muted)] mt-2">
            <Link href="/register" className="text-[var(--brand-400)] hover:underline">
              Sign up
            </Link>{' '}
            to save conversations
          </p>
        )}
      </div>
    </div>
  );
}
