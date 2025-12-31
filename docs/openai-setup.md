# OpenAI API Setup Guide

## 🤖 Getting Your OpenAI API Key

### Step 1: Create OpenAI Account
1. Go to https://platform.openai.com/
2. Sign up or log in to your account
3. Navigate to **API Keys** section

### Step 2: Generate API Key
1. Click **"Create new secret key"**
2. Give it a name (e.g., "AI Study Coach")
3. Copy the generated key (starts with `sk-`)
4. **Important**: Save it securely - you won't see it again!

### Step 3: Add to Your Project
1. Open `backend/.env` file
2. Replace the placeholder with your actual key:
   ```env
   OPENAI_API_KEY="sk-your-actual-api-key-here"
   ```
3. Save the file
4. Restart the backend server

### Step 4: Verify Setup
1. Go to http://localhost:3000
2. Login and try the AI Tutor chat
3. You should now get personalized AI responses!

## 💰 Pricing Information

- **Free Tier**: $5 in free credits for new accounts
- **Pay-as-you-go**: ~$0.002 per 1K tokens (very affordable)
- **Typical Usage**: A chat message costs ~$0.01-0.05

## 🔒 Security Best Practices

- **Never commit** your API key to version control
- **Keep your `.env` file** in `.gitignore`
- **Monitor usage** on OpenAI dashboard
- **Set usage limits** to avoid unexpected charges

## 🚫 Demo Mode (Without API Key)

If you don't have an OpenAI API key yet, the application will work in **demo mode**:

- ✅ Chat responses with helpful study guidance
- ✅ Sample study plans and quizzes
- ✅ Code analysis feedback
- ❌ No personalized AI-generated content
- ❌ Limited conversation context

## 🆘 Troubleshooting

**"Invalid API Key" Error:**
- Double-check your API key is correct
- Ensure no extra spaces in the `.env` file
- Verify your OpenAI account has credits

**"Rate Limit" Error:**
- You've exceeded the free tier limits
- Add billing information to your OpenAI account
- Wait for the rate limit to reset

**Still Having Issues?**
- Check the backend console logs
- Verify the `.env` file is in the `backend/` folder
- Restart the backend server after changes