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

  return (
    <div className="flex flex-col h-screen flex-1 overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 glass">
        <button
          onClick={() => setSidebarOpen(true)}
          className="btn-ghost p-2 md:hidden"
        >
          <Menu size={18} />
        </button>

        <Bot size={18} className="text-blue-400" />
        <h1 className="font-semibold text-sm flex-1 truncate">
          {activeChat?.title || 'New Conversation'}
        </h1>

        {/* Mode switcher */}
        <div className="hidden sm:flex items-center gap-1 glass rounded-xl p-1">
          {Object.entries(CHAT_MODES).map(([mode, info]) => (
            <button
              key={mode}
              onClick={() => setChatMode(mode as ChatMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                chatMode === mode
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-[var(--text-muted)] hover:text-white'
              }`}
              id={`mode-${mode}`}
            >
              <span>{info.icon}</span> {info.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {isNewChat ? (
          <WelcomeScreen onSuggestion={handleSend} />
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
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
      <div className="border-t border-white/5 p-4">
        <div className="max-w-3xl mx-auto">
          <div className={`relative glass rounded-2xl border transition-all ${
            isStreaming ? 'border-blue-500/30' : 'border-white/10 focus-within:border-blue-500/40'
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

            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              {isStreaming ? (
                <button
                  onClick={handleStop}
                  className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center hover:bg-red-500/30 transition-all"
                  id="stop-btn"
                >
                  <StopCircle size={16} />
                </button>
              ) : (
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
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
                className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  chatMode === mode
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'text-[var(--text-muted)] border border-white/10'
                }`}
              >
                {info.icon} {info.label}
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-[var(--text-muted)] mt-2">
            Answers are grounded in Grokking Algorithms · Press Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen({ onSuggestion }: { onSuggestion: (q: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-12 text-center">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-white/10 flex items-center justify-center mb-6"
      >
        <Bot size={36} className="text-blue-300" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-2xl font-bold mb-2"
      >
        Hey! I&apos;m BuggyBot 🤖
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-[var(--text-secondary)] max-w-sm mb-10"
      >
        Your chaotic but genius DSA mentor. Ask me anything from Grokking Algorithms!
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full"
      >
        {EXAMPLE_QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => onSuggestion(q)}
            className="glass-card p-4 text-left text-sm text-[var(--text-secondary)] hover:text-white transition-all group"
          >
            <Sparkles size={14} className="mb-2 text-blue-400 group-hover:text-blue-300 transition-colors" />
            {q}
          </button>
        ))}
      </motion.div>
    </div>
  );
}
