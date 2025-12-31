import express from 'express';
import Joi from 'joi';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import { AIService } from '../services/aiService';
import prisma from '../config/database';

const router = express.Router();

// Generate study plan
const generatePlanSchema = Joi.object({
  subject: Joi.string().valid(
    'PROGRAMMING_PYTHON',
    'PROGRAMMING_JAVA',
    'PROGRAMMING_JAVASCRIPT',
    'PROGRAMMING_CPP',
    'DATA_STRUCTURES',
    'ALGORITHMS',
    'DATABASES',
    'OPERATING_SYSTEMS',
    'COMPUTER_NETWORKS',
    'SOFTWARE_ENGINEERING',
    'CYBERSECURITY'
  ).required(),
  duration: Joi.number().min(1).max(90).required(),
  hoursPerDay: Joi.number().min(0.5).max(12).required()
});

router.post('/generate', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { error, value } = generatePlanSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { subject, duration, hoursPerDay } = value;
    const userId = req.user!.id;

    // Generate AI study plan
    const aiPlan = await AIService.generateStudyPlan(
      subject,
      req.user!.level,
      duration,
      hoursPerDay
    );

    // Save study plan
    const studyPlan = await prisma.studyPlan.create({
      data: {
        userId,
        title: aiPlan.title,
        description: aiPlan.description,
        subject,
        difficulty: req.user!.level as any,
        tasks: {
          create: aiPlan.tasks.map((task: any, index: number) => ({
            title: task.title,
            description: task.description,
            subject,
            difficulty: req.user!.level as any,
            estimatedMinutes: task.estimatedMinutes,
            order: index + 1
          }))
        }
      },
      include: {
        tasks: { orderBy: { order: 'asc' } }
      }
    });

    res.json(studyPlan);
  } catch (error) {
    next(error);
  }
});

// Get user's study plans
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const studyPlans = await prisma.studyPlan.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: {
        tasks: { orderBy: { order: 'asc' } }
      }
    });

    res.json(studyPlans);
  } catch (error) {
    next(error);
  }
});

// Get specific study plan
router.get('/:planId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { planId } = req.params;

    const studyPlan = await prisma.studyPlan.findFirst({
      where: { id: planId, userId: req.user!.id },
      include: {
        tasks: { orderBy: { order: 'asc' } }
      }
    });

    if (!studyPlan) {
      return res.status(404).json({ error: 'Study plan not found' });
    }

    res.json(studyPlan);
  } catch (error) {
    next(error);
  }
});

// Mark task as completed
router.patch('/tasks/:taskId/complete', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { taskId } = req.params;

    // Verify task belongs to user
    const task = await prisma.studyTask.findFirst({
      where: {
        id: taskId,
        plan: { userId: req.user!.id }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updatedTask = await prisma.studyTask.update({
      where: { id: taskId },
      data: {
        isCompleted: true,
        completedAt: new Date()
      }
    });

    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
});

export default router;