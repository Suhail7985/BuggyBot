import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { AuthRequest } from '../middleware/authMiddleware';
import { DocumentModel } from '../models/Document';
import { config } from '../config/env';
import fs from 'fs';

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

export const uploadPDF = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No PDF file provided' });
      return;
    }

    const userId = req.userId!;
    const collectionName = `user_${userId}_${uuidv4().slice(0, 8)}`;

    // Create document record
    const doc = await DocumentModel.create({
      userId,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      status: 'processing',
      collectionName,
    });

    res.status(202).json({
      success: true,
      message: 'PDF uploaded. Processing started.',
      documentId: doc._id,
      collectionName,
    });

    // Trigger AI service processing asynchronously
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(req.file.path);
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
    formData.append('file', blob, req.file.originalname);
    formData.append('collection_name', collectionName);
    formData.append('document_id', doc._id.toString());

    axios.post(`${config.aiServiceUrl}/api/pdf/process`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000, // 5 minutes for large PDFs
    }).then(async (response) => {
      await DocumentModel.findByIdAndUpdate(doc._id, {
        status: 'ready',
        chunkCount: response.data.chunk_count,
        pageCount: response.data.page_count,
        processedAt: new Date(),
      });
    }).catch(async (error) => {
      await DocumentModel.findByIdAndUpdate(doc._id, {
        status: 'error',
        errorMessage: error.message,
      });
    });

  } catch (error) {
    next(error);
  }
};

export const getDocuments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const docs = await DocumentModel.find({ userId: req.userId }).sort({ uploadedAt: -1 });
    res.json({ success: true, documents: docs });
  } catch (error) {
    next(error);
  }
};

export const getDocumentStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doc = await DocumentModel.findOne({ _id: req.params.id, userId: req.userId });
    if (!doc) {
      res.status(404).json({ success: false, message: 'Document not found' });
      return;
    }
    res.json({ success: true, document: doc });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doc = await DocumentModel.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!doc) {
      res.status(404).json({ success: false, message: 'Document not found' });
      return;
    }

    // Delete from ChromaDB via AI service
    await axios.delete(`${config.aiServiceUrl}/api/pdf/collection/${doc.collectionName}`).catch(() => {});

    // Delete file from disk
    const filePath = path.join(__dirname, '../../uploads', doc.fileName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({ success: true, message: 'Document deleted' });
  } catch (error) {
    next(error);
  }
};
