import express from 'express';
import Joi from 'joi';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import { AIService } from '../services/aiService';
import prisma from '../config/database';

const router = express.Router();

// Generate quiz
const generateQuizSchema = Joi.object({
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
  questionCount: Joi.number().min(3).max(20).default(5)
});

router.post('/generate', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { error, value } = generateQuizSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { subject, questionCount } = value;

    // Generate AI quiz
    const aiQuiz = await AIService.generateQuiz(
      subject,
      req.user!.level,
      questionCount
    );

    // Save quiz
    const quiz = await prisma.quiz.create({
      data: {
        title: aiQuiz.title,
        subject,
        difficulty: req.user!.level as any,
        questions: aiQuiz.questions
      }
    });

    // Return quiz without correct answers
    const quizForUser = {
      ...quiz,
      questions: aiQuiz.questions.map((q: any) => ({
        id: q.id,
        type: q.type,
        question: q.question,
        options: q.options
      }))
    };

    res.json(quizForUser);
  } catch (error) {
    next(error);
  }
});

// Submit quiz answers
const submitQuizSchema = Joi.object({
  quizId: Joi.string().required(),
  answers: Joi.object().required()
});

router.post('/submit', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { error, value } = submitQuizSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { quizId, answers } = value;
    const userId = req.user!.id;

    // Get quiz with correct answers
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId }
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Calculate score
    const questions = quiz.questions as any[];
    let correctAnswers = 0;

    const results = questions.map(question => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) correctAnswers++;

      return {
        questionId: question.id,
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      };
    });

    const score = (correctAnswers / questions.length) * 100;

    // Save quiz attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        answers,
        score,
        totalQuestions: questions.length
      }
    });

    res.json({
      attemptId: attempt.id,
      score,
      correctAnswers,
      totalQuestions: questions.length,
      results
    });
  } catch (error) {
    next(error);
  }
});

// Get quiz history
router.get('/history', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId: req.user!.id },
      orderBy: { completedAt: 'desc' },
      include: {
        quiz: {
          select: {
            title: true,
            subject: true,
            difficulty: true
          }
        }
      }
    });

    res.json(attempts);
  } catch (error) {
    next(error);
  }
});

export default router;