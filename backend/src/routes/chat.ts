import express from 'express';
import Joi from 'joi';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import { AIService } from '../services/aiService';
import prisma from '../config/database';

const router = express.Router();

// Validation schemas
const chatMessageSchema = Joi.object({
  message: Joi.string().min(1).max(2000).required(),
  sessionId: Joi.string().optional()
});

// Send message to AI tutor
router.post('/message', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { error, value } = chatMessageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { message, sessionId } = value;
    const userId = req.user!.id;

    // Get or create chat session
    let session;
    if (sessionId) {
      session = await prisma.chatSession.findFirst({
        where: { id: sessionId, userId },
        include: { messages: { orderBy: { timestamp: 'asc' } } }
      });
    }

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          userId,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : '')
        },
        include: { messages: true }
      });
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'USER',
        content: message
      }
    });

    // Prepare AI context
    const context = {
      userLevel: req.user!.level,
      fieldOfStudy: req.user!.fieldOfStudy,
      chatHistory: session.messages.map((msg: any) => ({
        role: msg.role.toLowerCase() as 'user' | 'assistant',
        content: msg.content,
        timestamp: msg.timestamp
      }))
    };

    // Generate AI response
    const aiResponse = await AIService.generateResponse(message, context);

    // Save AI response
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'ASSISTANT',
        content: aiResponse
      }
    });

    res.json({
      sessionId: session.id,
      response: aiResponse,
      timestamp: new Date()
    });
  } catch (error) {
    next(error);
  }
});

// Get chat sessions
router.get('/sessions', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const sessions = await prisma.chatSession.findMany({
      where: { userId: req.user!.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    res.json(sessions);
  } catch (error) {
    next(error);
  }
});

// Get specific chat session
router.get('/sessions/:sessionId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId: req.user!.id },
      include: {
        messages: { orderBy: { timestamp: 'asc' } }
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
});

// Delete chat session
router.delete('/sessions/:sessionId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId: req.user!.id }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await prisma.chatSession.delete({
      where: { id: sessionId }
    });

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;