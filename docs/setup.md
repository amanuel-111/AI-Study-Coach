# AI Study Coach Setup Guide

## Prerequisites

- Node.js 18+ 
- MAMP (MySQL + Apache + PHP)
- OpenAI API key

## Backend Setup

1. **Start MAMP:**
   - Open MAMP application
   - Start Apache & MySQL servers
   - Default MySQL port: 3306
   - Default credentials: root/root

2. **Create Database:**
   - Open phpMyAdmin (http://localhost/phpMyAdmin)
   - Create a new database named `ai_study_coach`

3. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Environment setup:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your MAMP configuration:
   ```env
   DATABASE_URL="mysql://root:root@localhost:3306/ai_study_coach"
   JWT_SECRET="your-super-secret-jwt-key-here"
   OPENAI_API_KEY="your-openai-api-key-here"
   PORT=3001
   NODE_ENV="development"
   FRONTEND_URL="http://localhost:3000"
   ```

6. **Database setup:**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed database with sample data
   npm run db:seed
   ```

7. **Start development server:**
   ```bash
   npm run dev
   ```

The backend will be running at `http://localhost:3001`

## Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

The frontend will be running at `http://localhost:3000`

## Production Deployment

### Backend Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Set production environment variables:**
   ```env
   NODE_ENV="production"
   DATABASE_URL="mysql://username:password@localhost:3306/ai_study_coach"
   JWT_SECRET="your-production-jwt-secret"
   OPENAI_API_KEY="your-openai-api-key"
   ```

3. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

4. **Start production server:**
   ```bash
   npm start
   ```

### Frontend Deployment

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Deploy the `build` folder to your hosting service**

## Database Schema

The application uses MySQL with Prisma ORM. Key tables include:

- `users` - User accounts and preferences
- `chat_sessions` & `chat_messages` - AI tutor conversations
- `study_plans` & `study_tasks` - Personalized study plans
- `quizzes` & `quiz_attempts` - Quiz system
- `coding_problems` & `code_submissions` - Coding practice
- `progress` - Learning progress tracking

## API Configuration

The API includes:
- JWT-based authentication
- Rate limiting (100 requests per 15 minutes)
- CORS configuration
- Input validation with Joi
- Error handling middleware

## AI Integration

The application integrates with OpenAI's GPT-4 API for:
- Personalized tutoring responses
- Study plan generation
- Quiz creation
- Code analysis and feedback

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet security headers

## Troubleshooting

### Common Issues

1. **Database connection errors:**
   - Verify MAMP MySQL is running
   - Check DATABASE_URL format: `mysql://root:root@localhost:3306/ai_study_coach`
   - Ensure database `ai_study_coach` exists in phpMyAdmin

2. **OpenAI API errors:**
   - Verify API key is valid
   - Check API quota/billing
   - Ensure proper network connectivity

3. **CORS errors:**
   - Verify FRONTEND_URL in backend .env
   - Check port configurations

4. **Build errors:**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all environment variables are set

### Development Tips

- Use `npm run dev` for hot reloading during development
- Check browser console and server logs for errors
- Use Prisma Studio for database inspection: `npx prisma studio`
- Test API endpoints with tools like Postman or curl