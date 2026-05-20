import api from './api';
import { Chat, ChatSummary, StreamEvent, ChatMode } from '@/types';

export const chatService = {
  async getChatHistory(): Promise<ChatSummary[]> {
    const res = await api.get('/chat/history');
    return res.data.chats;
  },

  async getChatById(id: string): Promise<Chat> {
    const res = await api.get(`/chat/${id}`);
    return res.data.chat;
  },

  async deleteChat(id: string): Promise<void> {
    await api.delete(`/chat/${id}`);
  },

  async renameChat(id: string, title: string): Promise<ChatSummary> {
    const res = await api.patch(`/chat/${id}/rename`, { title });
    return res.data.chat;
  },

  streamNewChat(
    message: string,
    mode: ChatMode,
    onEvent: (event: StreamEvent) => void,
    onDone: () => void,
    onError: (err: Error) => void
  ): () => void {
    const controller = new AbortController();

    fetch('/api/backend/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ message, mode }),
      signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok) throw new Error('Chat request failed');
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') { onDone(); continue; }
          try {
            onEvent(JSON.parse(data) as StreamEvent);
          } catch {}
        }
      }
      onDone();
    }).catch((err) => {
      if (err.name !== 'AbortError') onError(err);
    });

    return () => controller.abort();
  },

  streamContinueChat(
    chatId: string,
    message: string,
    mode: ChatMode,
    onEvent: (event: StreamEvent) => void,
    onDone: () => void,
    onError: (err: Error) => void
  ): () => void {
    const controller = new AbortController();

    fetch(`/api/backend/chat/${chatId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ message, mode }),
      signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok) throw new Error('Chat request failed');
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') { onDone(); continue; }
          try {
            onEvent(JSON.parse(data) as StreamEvent);
          } catch {}
        }
      }
      onDone();
    }).catch((err) => {
      if (err.name !== 'AbortError') onError(err);
    });

    return () => controller.abort();
  },
};
