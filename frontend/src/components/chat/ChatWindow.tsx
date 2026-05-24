'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SendHorizonal, StopCircle, Loader2, Menu } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { chatService } from '@/services/chatService';
import { CHAT_MODES, EXAMPLE_QUESTIONS } from '@/constants';
import { ChatMode, StreamEvent, Message } from '@/types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

export default function ChatWindow() {
  const router = useRouter();
  const params = useParams();
  const chatId = params?.id as string | undefined;

  const {
    activeChat,
    streamingMessage,
    isStreaming,
    pendingCitations,
    chatMode,
    setChatMode,
    setActiveChat,
    addMessage,
    appendToken,
    setStreaming,
    setPendingCitations,
    commitStreamingMessage,
    clearStreaming,
    addChat,
    setSidebarOpen,
  } = useChatStore();

  const [input, setInput] = useState('');
  /** Messages shown before server assigns a chat id (new conversation). */
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (chatId && !isStreaming) {
      chatService.getChatById(chatId).then(setActiveChat).catch(() => router.push('/dashboard'));
    } else if (!chatId) {
      setActiveChat(null);
      if (!isStreaming) setLocalMessages([]);
    }
  }, [chatId, isStreaming, setActiveChat, router]);

  const displayMessages = activeChat?.messages ?? localMessages;
  const showWelcome =
    displayMessages.length === 0 && !isStreaming && localMessages.length === 0;
  const isAnalyzing = isStreaming && !streamingMessage;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages, streamingMessage, isStreaming]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const handleStop = () => {
    abortRef.current?.();
    commitStreamingMessage();
    setStreaming(false);
  };

  const handleSend = async (messageOverride?: string) => {
    const msg = (messageOverride || input).trim();
    if (!msg || isStreaming) return;

    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setStreaming(true);
    clearStreaming();

    const userMsg: Message = {
      role: 'user',
      content: msg,
      createdAt: new Date().toISOString(),
    };

    if (activeChat) {
      addMessage(userMsg);
    } else {
      setLocalMessages((prev) => [...prev, userMsg]);
    }

    const onEvent = (event: StreamEvent) => {
      if (event.type === 'chat_id' && event.chatId) {
        const title = msg.slice(0, 60) + (msg.length > 60 ? '…' : '');
        const now = new Date().toISOString();
        setLocalMessages((prev) => {
          const existing = useChatStore.getState().activeChat?.messages;
          const msgs = existing?.length ? existing : prev.length > 0 ? prev : [userMsg];
          setActiveChat({
            _id: event.chatId!,
            userId: '',
            title,
            messages: msgs,
            createdAt: now,
            updatedAt: now,
          });
          return [];
        });
        router.push(`/chat/${event.chatId}`, { scroll: false });
        addChat({
          _id: event.chatId,
          title,
          createdAt: now,
          updatedAt: now,
        });
      } else if (event.type === 'token' && event.content) {
        appendToken(event.content);
      } else if (event.type === 'citations' && event.citations) {
        setPendingCitations(event.citations);
      }
    };

    const onDone = () => {
      commitStreamingMessage();
      abortRef.current = null;
    };

    const onError = () => {
      appendToken('\n\n**Error:** Unable to complete this request. Please try again.');
      commitStreamingMessage();
      setStreaming(false);
    };

    if (chatId) {
      abortRef.current = chatService.streamContinueChat(chatId, msg, chatMode, onEvent, onDone, onError);
    } else {
      abortRef.current = chatService.streamNewChat(msg, chatMode, onEvent, onDone, onError);
    }
  };

  return (
    <>
      <header className="app-header">
        <div className="content-container app-header-inner">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="btn-ghost btn-icon md:hidden"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <h1 className="text-sm font-medium truncate text-[var(--text-primary)]">
              {activeChat?.title || 'New chat'}
            </h1>
          </div>

          <div className="mode-tabs flex-shrink-0">
            {(Object.entries(CHAT_MODES) as [ChatMode, (typeof CHAT_MODES)[ChatMode]][]).map(
              ([mode, info]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setChatMode(mode)}
                  disabled={isStreaming}
                  className={`mode-tab ${chatMode === mode ? 'active' : ''}`}
                  id={`mode-${mode}`}
                >
                  {info.label}
                </button>
              )
            )}
          </div>
        </div>
      </header>

      <div className="chat-scroll">
        {showWelcome ? (
          <WelcomeScreen onSuggestion={handleSend} disabled={isStreaming} />
        ) : (
          <div className="content-container py-6 space-y-6">
            {displayMessages.map((msg, i) => (
              <MessageBubble key={`${msg.createdAt}-${i}`} message={msg} />
            ))}

            {isStreaming && (
              <>
                {isAnalyzing ? (
                  <TypingIndicator label="Analyzing…" />
                ) : (
                  <MessageBubble
                    message={{
                      role: 'assistant',
                      content: streamingMessage,
                      citations: pendingCitations,
                      createdAt: new Date().toISOString(),
                    }}
                    isStreaming
                  />
                )}
              </>
            )}

            <div ref={messagesEndRef} className="h-1" />
          </div>
        )}
      </div>

      <footer className="chat-composer">
        <div className="content-container">
          <div className="composer-box">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                isStreaming
                  ? isAnalyzing
                    ? 'Analyzing your question…'
                    : 'Receiving answer…'
                  : 'Ask a question about algorithms or data structures…'
              }
              rows={1}
              className="composer-textarea"
              id="chat-input"
              disabled={isStreaming}
            />
            {isStreaming ? (
              <button
                type="button"
                onClick={handleStop}
                className="btn-ghost btn-icon text-red-400"
                id="stop-btn"
                title="Stop"
              >
                <StopCircle size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="btn-primary btn-icon disabled:opacity-40"
                id="send-btn"
                title="Send"
              >
                <SendHorizonal size={18} />
              </button>
            )}
          </div>
          {isStreaming && isAnalyzing && (
            <p className="text-center text-xs text-[var(--brand-400)] mt-2 flex items-center justify-center gap-1.5">
              <Loader2 size={12} className="analyzing-spinner" />
              Analyzing…
            </p>
          )}
          {!isStreaming && (
            <p className="text-center text-[11px] text-[var(--text-muted)] mt-2">
              Shift+Enter for new line · Answers use indexed material when available
            </p>
          )}
        </div>
      </footer>
    </>
  );
}

function WelcomeScreen({
  onSuggestion,
  disabled,
}: {
  onSuggestion: (q: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="content-container flex flex-col justify-center min-h-full py-12">
      <div className="max-w-md mx-auto w-full text-center mb-8">
        <h2 className="text-xl font-semibold mb-2">Start a conversation</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Ask about algorithms, data structures, complexity, or debugging.
        </p>
      </div>
      <div className="max-w-md mx-auto w-full">
        <p className="text-label mb-3">Suggested prompts</p>
        <div className="flex flex-col gap-2">
          {EXAMPLE_QUESTIONS.slice(0, 4).map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSuggestion(q)}
              disabled={disabled}
              className="suggestion-btn disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
