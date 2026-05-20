import { Request, Response, NextFunction } from 'express';
import { Chat } from '../models/Chat';
import { AuthRequest } from '../middleware/authMiddleware';
import { z } from 'zod';
import axios from 'axios';
import { config } from '../config/env';

const createChatSchema = z.object({
  message: z.string().min(1).max(10000),
  mode: z.enum(['chat', 'quiz', 'complexity']).optional().default('chat'),
});

const renameChatSchema = z.object({
  title: z.string().min(1).max(100),
});

export const createChat = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = createChatSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.issues });
      return;
    }

    const { message, mode } = parsed.data;
    const userId = req.userId!;

    // Create the chat with the user message
    const chat = await Chat.create({
      userId,
      title: message.slice(0, 60) + (message.length > 60 ? '...' : ''),
      messages: [{ role: 'user', content: message, createdAt: new Date() }],
    });

    // Set up SSE headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Send chat ID first
    res.write(`data: ${JSON.stringify({ type: 'chat_id', chatId: chat._id.toString() })}\n\n`);

    let fullResponse = '';
    let citations: any[] = [];

    try {
      // Call AI service for streaming response
      const aiResponse = await axios.post(
        `${config.aiServiceUrl}/api/rag/chat`,
        { message, chatHistory: [], mode, userId },
        { responseType: 'stream', timeout: 60000 }
      );

      aiResponse.data.on('data', (chunk: Buffer) => {
        const lines = chunk.toString().split('\n\n').filter(Boolean);
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'token') {
                fullResponse += parsed.content;
                res.write(`data: ${JSON.stringify({ type: 'token', content: parsed.content })}\n\n`);
              } else if (parsed.type === 'citations') {
                citations = parsed.citations;
                res.write(`data: ${JSON.stringify({ type: 'citations', citations })}\n\n`);
              }
            } catch {}
          }
        }
      });

      aiResponse.data.on('end', async () => {
        // Save assistant response to DB
        chat.messages.push({
          role: 'assistant',
          content: fullResponse,
          citations,
          createdAt: new Date(),
        });
        await chat.save();

        res.write(`data: ${JSON.stringify({ type: 'done', chatId: chat._id.toString() })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      });

      aiResponse.data.on('error', (err: Error) => {
        res.write(`data: ${JSON.stringify({ type: 'error', message: 'AI service error' })}\n\n`);
        res.end();
      });

    } catch (aiError) {
      // Fallback if AI service is down
      const fallback = "I'm BuggyBot, your DSA mentor! The AI service is currently starting up. Please try again in a moment.";
      chat.messages.push({ role: 'assistant', content: fallback, createdAt: new Date() });
      await chat.save();

      res.write(`data: ${JSON.stringify({ type: 'token', content: fallback })}\n\n`);
      res.write(`data: ${JSON.stringify({ type: 'done', chatId: chat._id.toString() })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }

  } catch (error) {
    next(error);
  }
};

export const continueChat = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const parsed = createChatSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Validation failed' });
      return;
    }

    const { message, mode } = parsed.data;
    const chat = await Chat.findOne({ _id: id, userId: req.userId });

    if (!chat) {
      res.status(404).json({ success: false, message: 'Chat not found' });
      return;
    }

    // Add user message
    chat.messages.push({ role: 'user', content: message, createdAt: new Date() });
    await chat.save();

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const chatHistory = chat.messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content,
    }));

    let fullResponse = '';
    let citations: any[] = [];

    try {
      const aiResponse = await axios.post(
        `${config.aiServiceUrl}/api/rag/chat`,
        { message, chatHistory, mode, userId: req.userId },
        { responseType: 'stream', timeout: 60000 }
      );

      aiResponse.data.on('data', (chunk: Buffer) => {
        const lines = chunk.toString().split('\n\n').filter(Boolean);
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'token') {
                fullResponse += parsed.content;
                res.write(`data: ${JSON.stringify({ type: 'token', content: parsed.content })}\n\n`);
              } else if (parsed.type === 'citations') {
                citations = parsed.citations;
                res.write(`data: ${JSON.stringify({ type: 'citations', citations })}\n\n`);
              }
            } catch {}
          }
        }
      });

      aiResponse.data.on('end', async () => {
        chat.messages.push({ role: 'assistant', content: fullResponse, citations, createdAt: new Date() });
        await chat.save();
        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      });

      aiResponse.data.on('error', () => {
        res.write(`data: ${JSON.stringify({ type: 'error', message: 'AI service error' })}\n\n`);
        res.end();
      });

    } catch {
      const fallback = "I'm having trouble connecting to the AI service. Please try again.";
      chat.messages.push({ role: 'assistant', content: fallback, createdAt: new Date() });
      await chat.save();
      res.write(`data: ${JSON.stringify({ type: 'token', content: fallback })}\n\n`);
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }

  } catch (error) {
    next(error);
  }
};

export const getChatHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const chats = await Chat.find({ userId: req.userId })
      .select('_id title createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(50);

    res.json({ success: true, chats });
  } catch (error) {
    next(error);
  }
};

export const getChatById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.userId });

    if (!chat) {
      res.status(404).json({ success: false, message: 'Chat not found' });
      return;
    }

    res.json({ success: true, chat });
  } catch (error) {
    next(error);
  }
};

export const deleteChat = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!chat) {
      res.status(404).json({ success: false, message: 'Chat not found' });
      return;
    }

    res.json({ success: true, message: 'Chat deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const renameChat = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = renameChatSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Invalid title' });
      return;
    }

    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title: parsed.data.title },
      { new: true }
    ).select('_id title');

    if (!chat) {
      res.status(404).json({ success: false, message: 'Chat not found' });
      return;
    }

    res.json({ success: true, chat });
  } catch (error) {
    next(error);
  }
};
