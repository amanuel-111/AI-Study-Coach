import express from 'express';
import Joi from 'joi';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import { AIService } from '../services/aiService';
import prisma from '../config/database';

const router = express.Router();

// Get coding problems
router.get('/problems', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { subject, difficulty, language } = req.query;

    const problems = await prisma.codingProblem.findMany({
      where: {
        ...(difficulty && { difficulty: difficulty as any }),
        ...(language && { language: language as any })
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        language: true,
        createdAt: true
      }
    });

    res.json(problems);
  } catch (error) {
    next(error);
  }
});

// Get specific coding problem
router.get('/problems/:problemId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { problemId } = req.params;

    const problem = await prisma.codingProblem.findUnique({
      where: { id: problemId },
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        language: true,
        testCases: true
      }
    });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    res.json(problem);
  } catch (error) {
    next(error);
  }
});

// Submit code solution
const submitCodeSchema = Joi.object({
  problemId: Joi.string().required(),
  code: Joi.string().min(1).required(),
  language: Joi.string().valid('PYTHON', 'JAVA', 'JAVASCRIPT', 'CPP', 'C', 'CSHARP').required()
});

router.post('/submit', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { error, value } = submitCodeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { problemId, code, language } = value;
    const userId = req.user!.id;

    // Get problem details
    const problem = await prisma.codingProblem.findUnique({
      where: { id: problemId }
    });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Analyze code with AI
    const feedback = await AIService.analyzeCode(
      code,
      language,
      problem.description
    );

    // For now, we'll simulate test execution
    // In production, you'd want to use a code execution service
    const status = 'ACCEPTED'; // Simplified for demo
    const score = 85; // Simplified scoring

    // Save submission
    const submission = await prisma.codeSubmission.create({
      data: {
        userId,
        problemId,
        code,
        language,
        status,
        feedback,
        score
      }
    });

    res.json({
      submissionId: submission.id,
      status,
      score,
      feedback,
      submittedAt: submission.submittedAt
    });
  } catch (error) {
    next(error);
  }
});

// Get user's submissions
router.get('/submissions', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const submissions = await prisma.codeSubmission.findMany({
      where: { userId: req.user!.id },
      orderBy: { submittedAt: 'desc' },
      include: {
        problem: {
          select: {
            title: true,
            difficulty: true
          }
        }
      }
    });

    res.json(submissions);
  } catch (error) {
    next(error);
  }
});

export default router;