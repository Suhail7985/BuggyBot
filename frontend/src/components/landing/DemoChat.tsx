'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SendHorizonal, Bot, User } from 'lucide-react';
import { EXAMPLE_QUESTIONS } from '@/constants';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const demoResponses: Record<string, string> = {
  default: `Great question! 🎯 Let me break this down for you.

**Binary Search** is like looking up a word in a dictionary — you don't start from page 1, you open to the middle!

**How it works:**
1. Look at the middle element
2. If it's your target → done! ✅
3. If target is smaller → search left half
4. If target is larger → search right half
5. Repeat until found (or list is empty)

\`\`\`python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid        # Found it!
        elif arr[mid] < target:
            left = mid + 1    # Search right half
        else:
            right = mid - 1   # Search left half
    
    return -1  # Not found
\`\`\`

**⏱️ Complexity:**
- Time: **O(log n)** — halves the search space each step
- Space: **O(1)** — no extra memory needed

**Key insight:** With 1 billion items, binary search takes at most **30 steps**. Linear search? 1 billion. That's the power of O(log n)! 🚀`,
};

interface DemoMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function DemoChat() {
  const [messages, setMessages] = useState<DemoMessage[]>([
    {
      role: 'assistant',
      content: "Hey! I'm BuggyBot 🤖 Your chaotic but genius DSA mentor. Ask me anything about Grokking Algorithms — or click a suggestion below!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const simulateResponse = (question: string) => {
    const response = demoResponses.default;
    setIsTyping(true);
    setMessages((prev) => [...prev, { role: 'user', content: question }]);

    let displayed = '';
    let i = 0;
    const interval = setInterval(() => {
      if (i >= response.length) {
        clearInterval(interval);
        setIsTyping(false);
        return;
      }
      displayed += response[i];
      i += 3;
      setMessages((prev) => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg?.role === 'assistant' && updated.length > 1) {
          updated[updated.length - 1] = { ...lastMsg, content: displayed };
        } else {
          updated.push({ role: 'assistant', content: displayed });
        }
        return updated;
      });
    }, 20);
  };

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    const q = input;
    setInput('');
    simulateResponse(q);
  };

  return (
    <div className="glass-card overflow-hidden" style={{ height: '520px', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-white/[0.01]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-md shadow-blue-500/20 animate-pulse">
          <Bot size={16} className="text-white" />
        </div>
        <div>
          <p className="font-semibold text-sm">BuggyBot</p>
          <p className="text-xs text-[var(--text-muted)]">DSA AI Mentor · Online</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-semibold text-green-400 tracking-wider uppercase">Demo Mode</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-white/[0.005]">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-blue-500 to-violet-600 shadow-md shadow-blue-500/20'
                  : 'bg-[var(--bg-card-hover)] border border-white/10'
              }`}>
                {msg.role === 'user' ? <User size={13} /> : <Bot size={13} />}
              </div>
              <div className={msg.role === 'user' ? 'chat-message-user' : 'chat-message-ai'}>
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                ) : (
                  <div className="prose prose-sm max-w-none text-[var(--text-primary)]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-[var(--bg-card-hover)] border border-white/10 flex items-center justify-center">
              <Bot size={13} />
            </div>
            <div className="chat-message-ai flex items-center gap-1.5 py-3">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {EXAMPLE_QUESTIONS.slice(0, 3).map((q) => (
            <button
              key={q}
              onClick={() => simulateResponse(q)}
              className="text-xs px-3 py-1.5 rounded-full glass border border-white/10 text-[var(--text-secondary)] hover:text-white hover:border-white/20 transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-white/5">
        <div className="flex gap-3 items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask BuggyBot about DSA..."
            className="input-field flex-1"
            id="demo-chat-input"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="btn-primary px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            id="demo-send-btn"
          >
            <SendHorizonal size={16} />
          </button>
        </div>
        <p className="text-center text-xs text-[var(--text-muted)] mt-2">
          This is a demo preview.{' '}
          <a href="/register" className="text-blue-400 hover:underline">Sign up</a> for full AI responses.
        </p>
      </div>
    </div>
  );
}
