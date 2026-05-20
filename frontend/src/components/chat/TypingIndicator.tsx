import { Bot } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-xl bg-[var(--bg-card-hover)] border border-white/10 flex items-center justify-center flex-shrink-0 text-blue-400">
        <Bot size={15} />
      </div>
      <div className="chat-message-ai flex items-center gap-1.5 py-3">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  );
}
