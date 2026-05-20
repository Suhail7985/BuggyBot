import { create } from 'zustand';
import { Chat, ChatSummary, Message, Citation, ChatMode } from '@/types';

interface ChatState {
  chats: ChatSummary[];
  activeChat: Chat | null;
  activeChatId: string | null;
  streamingMessage: string;
  isStreaming: boolean;
  pendingCitations: Citation[];
  chatMode: ChatMode;
  sidebarOpen: boolean;

  setChats: (chats: ChatSummary[]) => void;
  addChat: (chat: ChatSummary) => void;
  removeChat: (chatId: string) => void;
  renameChat: (chatId: string, title: string) => void;
  setActiveChat: (chat: Chat | null) => void;
  setActiveChatId: (id: string | null) => void;
  addMessage: (message: Message) => void;
  appendToken: (token: string) => void;
  setStreaming: (streaming: boolean) => void;
  setPendingCitations: (citations: Citation[]) => void;
  commitStreamingMessage: (citations?: Citation[]) => void;
  setChatMode: (mode: ChatMode) => void;
  setSidebarOpen: (open: boolean) => void;
  clearStreaming: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  activeChat: null,
  activeChatId: null,
  streamingMessage: '',
  isStreaming: false,
  pendingCitations: [],
  chatMode: 'chat',
  sidebarOpen: true,

  setChats: (chats) => set({ chats }),
  addChat: (chat) => set((state) => ({ chats: [chat, ...state.chats] })),
  removeChat: (chatId) =>
    set((state) => ({ chats: state.chats.filter((c) => c._id !== chatId) })),
  renameChat: (chatId, title) =>
    set((state) => ({
      chats: state.chats.map((c) => (c._id === chatId ? { ...c, title } : c)),
    })),
  setActiveChat: (chat) => set({ activeChat: chat, activeChatId: chat?._id || null }),
  setActiveChatId: (id) => set({ activeChatId: id }),

  addMessage: (message) =>
    set((state) => ({
      activeChat: state.activeChat
        ? { ...state.activeChat, messages: [...state.activeChat.messages, message] }
        : null,
    })),

  appendToken: (token) =>
    set((state) => ({ streamingMessage: state.streamingMessage + token })),

  setStreaming: (isStreaming) => set({ isStreaming }),

  setPendingCitations: (citations) => set({ pendingCitations: citations }),

  commitStreamingMessage: (citations) => {
    const { streamingMessage, activeChat, pendingCitations } = get();
    if (!streamingMessage || !activeChat) return;

    const assistantMessage: Message = {
      role: 'assistant',
      content: streamingMessage,
      citations: citations || pendingCitations,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      activeChat: state.activeChat
        ? { ...state.activeChat, messages: [...state.activeChat.messages, assistantMessage] }
        : null,
      streamingMessage: '',
      isStreaming: false,
      pendingCitations: [],
    }));
  },

  setChatMode: (mode) => set({ chatMode: mode }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  clearStreaming: () => set({ streamingMessage: '', isStreaming: false, pendingCitations: [] }),
}));
