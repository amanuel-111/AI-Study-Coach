# AI Study Coach

A production-ready AI-powered study coach for Computer Science, Software Engineering, IT, IS, and Cybersecurity students.

## Tech Stack

- **Frontend**: React + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **AI**: OpenAI GPT API
- **Authentication**: JWT-based

## Project Structure

```
ai-study-coach/
├── backend/                 # Node.js API server
├── frontend/               # React application
├── shared/                 # Shared types and utilities
└── docs/                   # Documentation
```

## Quick Start

### Prerequisites
- Node.js 18+
- MAMP (MySQL + Apache + PHP)
- OpenAI API key

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your MAMP MySQL database and API keys
# DATABASE_URL="mysql://root:root@localhost:3306/ai_study_coach"
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Core Features

1. **Authentication & User Profile**
2. **AI Study Coach** - Chat-based AI tutor
3. **Personalized Study Plans**
4. **Coding Practice & Feedback**
5. **Quizzes & Interview Prep**
6. **Progress Tracking**

## API Documentation

See `/docs/api.md` for detailed API documentation.