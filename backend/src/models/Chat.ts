import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  citations?: ICitation[];
  createdAt: Date;
}

export interface ICitation {
  chapter: string;
  page?: number;
  excerpt: string;
  source: string;
}

export interface IChat extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  messages: IMessage[];
  aiModel?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CitationSchema = new Schema<ICitation>(
  {
    chapter: { type: String, required: true },
    page: { type: Number },
    excerpt: { type: String, required: true },
    source: { type: String, required: true },
  },
  { _id: false }
);

const MessageSchema = new Schema<IMessage>(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    citations: [CitationSchema],
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ChatSchema = new Schema<IChat>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'New Chat', trim: true, maxlength: 100 },
    messages: [MessageSchema],
    aiModel: { type: String, default: 'gemini-1.5-flash' },
  },
  { timestamps: true }
);

export const Chat = mongoose.model<IChat>('Chat', ChatSchema);
