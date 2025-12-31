# MAMP Setup Guide for AI Study Coach

## 🚀 Quick MAMP Setup

### Step 1: Start MAMP
1. Open MAMP application
2. Click "Start Servers" (Apache & MySQL)
3. Verify MySQL is running on port 3306

### Step 2: Create Database
1. Open phpMyAdmin: http://localhost/phpMyAdmin
2. Click "New" to create a database
3. Name it: `ai_study_coach`
4. Click "Create"

### Step 3: Configure Backend
```bash
cd backend
cp .env.example .env
```

Edit the `.env` file:
```env
# MAMP MySQL Configuration
DATABASE_URL="mysql://root:root@localhost:3306/ai_study_coach"

# JWT Secret (change this!)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# OpenAI API Key (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY="your-openai-api-key-here"

# Server Configuration
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

### Step 4: Setup Database Schema
```bash
cd backend
npm run db:generate
npm run db:push
npm run db:seed
```

### Step 5: Start Development Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm start
```

## 🎯 Access Your Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- phpMyAdmin: http://localhost/phpMyAdmin

## 🔧 MAMP Default Settings
- MySQL Port: 3306
- Username: root
- Password: root
- Host: localhost

## ✅ Verification
1. Backend should show: "🚀 Server running on port 3001"
2. Frontend should open in your browser
3. You can register a new account and start using the AI Study Coach!

## 🆘 Troubleshooting
- If MySQL connection fails, check MAMP is running
- If database doesn't exist, create it in phpMyAdmin
- If OpenAI API fails, verify your API key is correct
- Check console logs for detailed error messages