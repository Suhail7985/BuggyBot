import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  errorMessage?: string;
  chunkCount?: number;
  pageCount?: number;
  collectionName: string;
  uploadedAt: Date;
  processedAt?: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    status: {
      type: String,
      enum: ['uploading', 'processing', 'ready', 'error'],
      default: 'uploading',
    },
    errorMessage: { type: String },
    chunkCount: { type: Number },
    pageCount: { type: Number },
    collectionName: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

export const DocumentModel = mongoose.model<IDocument>('Document', DocumentSchema);
