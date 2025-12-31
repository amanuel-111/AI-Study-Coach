import express from 'express';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import prisma from '../config/database';

const router = express.Router();

// Get user progress dashboard
router.get('/dashboard', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    // Get overall progress
    const progress = await prisma.progress.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });

    // Get recent activity
    const recentQuizzes = await prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: 5,
      include: {
        quiz: {
          select: { title: true, subject: true }
        }
      }
    });

    const recentSubmissions = await prisma.codeSubmission.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
      take: 5,
      include: {
        problem: {
          select: { title: true, difficulty: true }
        }
      }
    });

    // Get study plan progress
    const activePlans = await prisma.studyPlan.findMany({
      where: { userId, isActive: true },
      include: {
        tasks: true
      }
    });

    const studyPlanProgress = activePlans.map((plan: any) => {
      const completedTasks = plan.tasks.filter((task: any) => task.isCompleted).length;
      const totalTasks = plan.tasks.length;
      const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      return {
        planId: plan.id,
        title: plan.title,
        subject: plan.subject,
        completedTasks,
        totalTasks,
        progressPercentage
      };
    });

    // Calculate subject-wise scores
    const subjectScores = progress.reduce((acc: Record<string, number[]>, p: any) => {
      if (!acc[p.subject]) {
        acc[p.subject] = [];
      }
      acc[p.subject].push(p.score);
      return acc;
    }, {} as Record<string, number[]>);

    const subjectAverages = Object.entries(subjectScores).map(([subject, scores]) => ({
      subject,
      averageScore: (scores as number[]).reduce((sum: number, score: number) => sum + score, 0) / (scores as number[]).length,
      totalTopics: (scores as number[]).length
    }));

    res.json({
      overallProgress: progress,
      subjectAverages,
      studyPlanProgress,
      recentActivity: {
        quizzes: recentQuizzes,
        codeSubmissions: recentSubmissions
      },
      stats: {
        totalQuizzes: await prisma.quizAttempt.count({ where: { userId } }),
        totalSubmissions: await prisma.codeSubmission.count({ where: { userId } }),
        activePlans: activePlans.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get progress for specific subject
router.get('/subject/:subject', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { subject } = req.params;
    const userId = req.user!.id;

    const progress = await prisma.progress.findMany({
      where: { userId, subject: subject as any },
      orderBy: { updatedAt: 'desc' }
    });

    const quizzes = await prisma.quizAttempt.findMany({
      where: {
        userId,
        quiz: { subject: subject as any }
      },
      orderBy: { completedAt: 'desc' },
      include: {
        quiz: {
          select: { title: true, difficulty: true }
        }
      }
    });

    res.json({
      subject,
      progress,
      quizHistory: quizzes
    });
  } catch (error) {
    next(error);
  }
});

export default router;