import { Router } from 'express';
import {
  createChat,
  continueChat,
  getChatHistory,
  getChatById,
  deleteChat,
  renameChat,
} from '../controllers/chatController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.post('/', createChat);
router.post('/:id/message', continueChat);
router.get('/history', getChatHistory);
router.get('/:id', getChatById);
router.delete('/:id', deleteChat);
router.patch('/:id/rename', renameChat);

export default router;
