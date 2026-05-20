'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SendHorizonal, StopCircle, Bot,
  Sparkles, Menu
} from 'lucide-react';
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
    activeChat, streamingMessage, isStreaming, pendingCitations,
    chatMode, setChatMode, setActiveChat, addMessage, appendToken,
    setStreaming, setPendingCitations, commitStreamingMessage,
    clearStreaming, addChat, setSidebarOpen
  } = useChatStore();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<(() => void) | null>(null);

  // Load chat if navigating to an existing one
  useEffect(() => {
    if (chatId) {
      chatService.getChatById(chatId).then(setActiveChat).catch(() => router.push('/dashboard'));
    } else {
      setActiveChat(null);
    }
  }, [chatId, setActiveChat, router]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, streamingMessage]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  };

  const handleStop = () => {
    abortRef.current?.();
    commitStreamingMessage();
  };

  const handleSend = async (messageOverride?: string) => {
    const msg = (messageOverride || input).trim();
    if (!msg || isStreaming) return;

    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setStreaming(true);
    clearStreaming();

    // Add user message optimistically
    const userMsg: Message = { role: 'user', content: msg, createdAt: new Date().toISOString() };

    if (activeChat) {
      addMessage(userMsg);
    }

    const onEvent = (event: StreamEvent) => {
      if (event.type === 'chat_id' && event.chatId) {
        // New chat was created — update URL without full navigation
        router.push(`/chat/${event.chatId}`, { scroll: false });
        addChat({ _id: event.chatId, title: msg.slice(0, 60), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
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
      appendToken('\n\n*Sorry, I encountered an error. Please try again.*');
      commitStreamingMessage();
      setStreaming(false);
    };

    if (chatId) {
      abortRef.current = chatService.streamContinueChat(chatId, msg, chatMode, onEvent, onDone, onError);
    } else {
      abortRef.current = chatService.streamNewChat(msg, chatMode, onEvent, onDone, onError);
    }
  };

  const messages = activeChat?.messages || [];
  const isNewChat = !chatId && messages.length === 0;

  return     <div className="flex flex-col h-screen flex-1 overflow-hidden bg-[var(--bg-primary)]">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-[#080c18]/45 backdrop-blur-md">
        <button
          onClick={() => setSidebarOpen(true)}
          className="btn-ghost p-2 md:hidden rounded-xl"
        >
          <Menu size={18} />
        </button>

        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-600/20 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
          <Bot size={14} className="text-blue-400" />
        </div>
        <h1 className="font-bold text-sm text-white flex-1 truncate">
          {activeChat?.title || 'New Conversation'}
        </h1>

        {/* Mode switcher */}
        <div className="hidden sm:flex items-center gap-1 bg-white/[0.02] border border-white/5 rounded-xl p-1">
          {Object.entries(CHAT_MODES).map(([mode, info]) => (
            <button
              key={mode}
              onClick={() => setChatMode(mode as ChatMode)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                chatMode === mode
                  ? 'bg-gradient-to-r from-blue-500/15 to-violet-600/15 text-blue-300 border border-blue-500/20 shadow-inner'
                  : 'border border-transparent text-[var(--text-muted)] hover:text-white hover:bg-white/5'
              }`}
              id={`mode-${mode}`}
            >
              <span className="scale-110">{info.icon}</span> {info.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto flex flex-col bg-white/[0.002]">
        {isNewChat ? (
          <WelcomeScreen onSuggestion={handleSend} />
        ) : (
          <div className="max-w-3xl w-full mx-auto px-4 py-8 space-y-7 flex-1">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
            </AnimatePresence>

            {/* Streaming message */}
            {isStreaming && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {streamingMessage ? (
                  <MessageBubble
                    message={{
                      role: 'assistant',
                      content: streamingMessage,
                      citations: pendingCitations,
                      createdAt: new Date().toISOString(),
                    }}
                    isStreaming
                  />
                ) : (
                  <TypingIndicator />
                )}
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-white/5 p-5 bg-gradient-to-t from-[#080c18] to-transparent">
        <div className="max-w-3xl mx-auto">
          <div className={`relative bg-[#0d1527]/50 backdrop-blur-md rounded-2xl border transition-all duration-300 ${
            isStreaming 
              ? 'border-blue-500/35 shadow-lg shadow-blue-500/5' 
              : 'border-white/8 focus-within:border-blue-500/45 focus-within:shadow-lg focus-within:shadow-blue-500/5'
          }`}>
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
              placeholder={`Ask BuggyBot about ${CHAT_MODES[chatMode].description}...`}
              rows={1}
              className="w-full bg-transparent px-5 py-4 pr-14 text-sm resize-none outline-none placeholder-[var(--text-muted)] leading-relaxed max-h-48"
              id="chat-input"
              disabled={isStreaming}
            />

            <div className="absolute right-3.5 bottom-3.5 flex items-center gap-2">
              {isStreaming ? (
                <button
                  onClick={handleStop}
                  className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-all duration-200"
                  id="stop-btn"
                >
                  <StopCircle size={16} />
                </button>
              ) : (
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-600 shadow-md hover:shadow-blue-500/20 transition-all duration-200"
                  id="send-btn"
                >
                  <SendHorizonal size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Mobile mode switcher */}
          <div className="sm:hidden flex items-center gap-2 mt-3 overflow-x-auto pb-1">
            {Object.entries(CHAT_MODES).map(([mode, info]) => (
              <button
                key={mode}
                onClick={() => setChatMode(mode as ChatMode)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all border ${
                  chatMode === mode
                    ? 'bg-blue-500/15 text-blue-300 border-blue-500/25'
                    : 'text-[var(--text-muted)] border-white/5 bg-white/[0.01]'
                }`}
              >
                {info.icon} {info.label}
              </button>
            ))}
          </div>

          <p className="text-center text-[10px] text-[var(--text-muted)] font-medium tracking-wide mt-3 uppercase opacity-80">
            Answers are grounded in Grokking Algorithms · Press Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen({ onSuggestion }: { onSuggestion: (q: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 text-center max-w-2xl mx-auto w-full">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/15 to-violet-600/15 border border-blue-500/25 flex items-center justify-center mb-7 relative shadow-lg shadow-blue-500/5"
      >
        <div className="absolute inset-0 rounded-3xl bg-blue-500/10 blur-xl -z-10 animate-pulse-glow" />
        <Bot size={38} className="text-blue-400" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, ease: 'easeOut' }}
        className="text-3xl font-black mb-3 tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent"
      >
        Hey! I&apos;m BuggyBot 🤖
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-[var(--text-secondary)] text-sm max-w-sm mb-10 leading-relaxed font-medium"
      >
        Your chaotic but genius DSA mentor. Ask me anything from Grokking Algorithms!
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 w-full"
      >
        {EXAMPLE_QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => onSuggestion(q)}
            className="glass-card p-5 text-left text-sm text-[var(--text-secondary)] hover:text-white transition-all duration-300 group border border-white/5 hover:border-blue-500/20 hover:bg-blue-500/[0.02] hover:-translate-y-0.5 rounded-2xl flex flex-col justify-between"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-white/5 flex items-center justify-center mb-3 group-hover:bg-blue-500/15 group-hover:border-blue-500/30 transition-colors">
              <Sparkles size={13} className="text-blue-400 group-hover:text-blue-300 transition-colors" />
            </div>
            <span className="font-medium text-slate-300 group-hover:text-white transition-colors">{q}</span>
          </button>
        ))}
      </motion.div>
    </div>
  );
}  );
}
