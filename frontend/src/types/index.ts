export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt?: string;
}

export interface Citation {
  chapter: string;
  page?: number;
  excerpt: string;
  source: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  createdAt: string;
}

export interface Chat {
  _id: string;
  userId: string;
  title: string;
  messages: Message[];
  aiModel?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSummary {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  _id: string;
  userId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  errorMessage?: string;
  chunkCount?: number;
  pageCount?: number;
  collectionName: string;
  uploadedAt: string;
  processedAt?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export type ChatMode = 'chat' | 'quiz' | 'complexity';

export interface StreamEvent {
  type: 'chat_id' | 'token' | 'citations' | 'done' | 'error';
  content?: string;
  chatId?: string;
  citations?: Citation[];
  message?: string;
}
