'use client';

import { Bot, Loader2 } from 'lucide-react';

interface TypingIndicatorProps {
  label?: string;
}

export default function TypingIndicator({ label = 'Analyzing…' }: TypingIndicatorProps) {
  return (
    <div className="message-row">
      <div className="message-avatar assistant">
        <Bot size={14} />
      </div>
      <div className="message-body">
        <div className="analyzing-status">
          <Loader2 size={14} className="analyzing-spinner" aria-hidden />
          <span>{label}</span>
        </div>
      </div>
    </div>
  );
}
