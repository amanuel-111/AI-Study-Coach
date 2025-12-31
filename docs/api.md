# AI Study Coach API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "fieldOfStudy": "COMPUTER_SCIENCE",
  "level": "BEGINNER"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "fieldOfStudy": "COMPUTER_SCIENCE",
    "level": "BEGINNER"
  },
  "token": "jwt_token"
}
```

#### POST /auth/login
Login with existing credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Chat (AI Tutor)

#### POST /chat/message
Send a message to the AI tutor.

**Request Body:**
```json
{
  "message": "Explain how binary search works",
  "sessionId": "optional_session_id"
}
```

**Response:**
```json
{
  "sessionId": "session_id",
  "response": "AI tutor response...",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### GET /chat/sessions
Get all chat sessions for the authenticated user.

#### GET /chat/sessions/:sessionId
Get a specific chat session with all messages.

#### DELETE /chat/sessions/:sessionId
Delete a chat session.

### Study Plans

#### POST /study-plans/generate
Generate a new AI-powered study plan.

**Request Body:**
```json
{
  "subject": "PROGRAMMING_PYTHON",
  "duration": 14,
  "hoursPerDay": 2
}
```

#### GET /study-plans
Get all study plans for the authenticated user.

#### GET /study-plans/:planId
Get a specific study plan with tasks.

#### PATCH /study-plans/tasks/:taskId/complete
Mark a study task as completed.

### Quizzes

#### POST /quiz/generate
Generate a new quiz for a specific subject.

**Request Body:**
```json
{
  "subject": "DATA_STRUCTURES",
  "questionCount": 5
}
```

#### POST /quiz/submit
Submit quiz answers for grading.

**Request Body:**
```json
{
  "quizId": "quiz_id",
  "answers": {
    "q1": 0,
    "q2": "user answer"
  }
}
```

#### GET /quiz/history
Get quiz attempt history for the authenticated user.

### Coding Practice

#### GET /coding/problems
Get available coding problems.

**Query Parameters:**
- `subject` (optional): Filter by subject
- `difficulty` (optional): Filter by difficulty
- `language` (optional): Filter by programming language

#### GET /coding/problems/:problemId
Get a specific coding problem with test cases.

#### POST /coding/submit
Submit code solution for a problem.

**Request Body:**
```json
{
  "problemId": "problem_id",
  "code": "def solution():\n    return 'Hello World'",
  "language": "PYTHON"
}
```

#### GET /coding/submissions
Get code submission history for the authenticated user.

### Progress Tracking

#### GET /progress/dashboard
Get comprehensive progress dashboard data.

**Response includes:**
- Overall progress by subject
- Subject averages
- Study plan progress
- Recent activity (quizzes, code submissions)
- Statistics

#### GET /progress/subject/:subject
Get detailed progress for a specific subject.

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message",
  "details": "Additional details (optional)"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

## Rate Limiting

API requests are limited to 100 requests per 15-minute window per IP address.