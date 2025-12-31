import express from 'express';
import Joi from 'joi';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import prisma from '../config/database';

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        fieldOfStudy: true,
        level: true,
        createdAt: true
      }
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Update user profile
const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  fieldOfStudy: Joi.string().valid(
    'COMPUTER_SCIENCE',
    'SOFTWARE_ENGINEERING', 
    'INFORMATION_TECHNOLOGY',
    'INFORMATION_SYSTEMS',
    'CYBERSECURITY'
  ).optional(),
  level: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED').optional()
});

router.put('/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: value,
      select: {
        id: true,
        name: true,
        email: true,
        fieldOfStudy: true,
        level: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
});

export default router;