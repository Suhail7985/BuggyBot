import { Router } from 'express';
import {
  uploadPDF,
  getDocuments,
  getDocumentStatus,
  deleteDocument,
  upload,
} from '../controllers/uploadController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.post('/pdf', upload.single('pdf'), uploadPDF);
router.get('/', getDocuments);
router.get('/:id/status', getDocumentStatus);
router.delete('/:id', deleteDocument);

export default router;
