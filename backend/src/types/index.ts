import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    fieldOfStudy: string;
    level: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface StudyPlanRequest {
  subject: string;
  difficulty: string;
  duration: number; // in days
  hoursPerDay: number;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
}

export interface CodingTestCase {
  input: string;
  expectedOutput: string;
  description?: string;
}

export interface AIPromptContext {
  userLevel: string;
  fieldOfStudy: string;
  subject?: string;
  chatHistory?: ChatMessage[];
}