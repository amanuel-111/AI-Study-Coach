import OpenAI from 'openai';
import { ChatMessage, AIPromptContext } from '../types';
import { FreeAIService } from './freeAiService';

// Initialize OpenAI client only if API key is provided
let openai: OpenAI | null = null;

if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-actual-openai-api-key-here') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export class AIService {
  private static getSystemPrompt(context: AIPromptContext): string {
    return `You are an AI Study Coach specializing in ${context.fieldOfStudy}. 
Your student is at ${context.userLevel} level.

CORE PRINCIPLES:
- Be patient, encouraging, and supportive
- Teach step-by-step with clear explanations
- Use practical examples before diving into theory
- Ask questions to test understanding before giving final answers
- Adapt complexity to the student's level
- Focus on building understanding, not just giving answers

SUBJECTS YOU TEACH:
- Programming (Python, Java, JavaScript, C++)
- Data Structures & Algorithms
- Databases
- Operating Systems
- Computer Networks
- Software Engineering
- Cybersecurity Fundamentals

TEACHING APPROACH:
1. Start with simple explanations
2. Provide concrete examples
3. Ask clarifying questions
4. Build up to more complex concepts
5. Encourage practice and experimentation
6. Provide constructive feedback

Remember: Your goal is to help students truly understand concepts, not just memorize them.`;
  }

  static async generateResponse(
    message: string,
    context: AIPromptContext,
    chatHistory: ChatMessage[] = []
  ): Promise<string> {
    // Try different AI providers in order of preference
    
    // 1. Try OpenAI (if configured)
    if (openai) {
      try {
        const systemPrompt = this.getSystemPrompt(context);
        
        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
          { role: 'system', content: systemPrompt },
          ...chatHistory.slice(-10).map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          })),
          { role: 'user', content: message }
        ];

        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages,
          max_tokens: 1000,
          temperature: 0.7,
        });

        return completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';
      } catch (error) {
        console.error('OpenAI Error, trying alternatives:', error);
      }
    }

    // 2. Try Google Gemini (free tier)
    if (process.env.GEMINI_API_KEY) {
      try {
        return await FreeAIService.generateResponseWithGemini(message, context, chatHistory);
      } catch (error) {
        console.error('Gemini Error, trying alternatives:', error);
      }
    }

    // 3. Try Hugging Face (free)
    if (process.env.HUGGINGFACE_API_KEY) {
      try {
        return await FreeAIService.generateResponseWithHuggingFace(message, context);
      } catch (error) {
        console.error('Hugging Face Error, trying alternatives:', error);
      }
    }

    // 4. Try Ollama (local, completely free)
    try {
      return await FreeAIService.generateResponseWithOllama(message, context);
    } catch (error) {
      console.error('Ollama not available, using enhanced local responses:', error);
    }

    // 5. Fallback to enhanced local responses
    return FreeAIService.getLocalResponse(message, context);
  }

  private static getMockResponse(message: string, context: AIPromptContext): string {
    const lowerMessage = message.toLowerCase();
    
    // Programming-related responses
    if (lowerMessage.includes('python') || lowerMessage.includes('programming')) {
      return `Great question about Python! As a ${context.userLevel.toLowerCase()} student in ${context.fieldOfStudy.replace('_', ' ')}, I'd recommend starting with the basics:

1. **Variables and Data Types**: Learn about strings, integers, lists, and dictionaries
2. **Control Flow**: Master if statements, loops (for/while)
3. **Functions**: Understand how to write reusable code
4. **Practice**: Try coding exercises on platforms like LeetCode or HackerRank

Would you like me to explain any of these concepts in more detail?

*Note: This is a demo response. Add your OpenAI API key for full AI-powered tutoring.*`;
    }
    
    if (lowerMessage.includes('algorithm') || lowerMessage.includes('data structure')) {
      return `Algorithms and data structures are fundamental to computer science! Here's a learning path for ${context.userLevel.toLowerCase()} level:

**Essential Data Structures:**
- Arrays and Lists
- Stacks and Queues
- Hash Tables/Maps
- Trees (Binary, BST)
- Graphs

**Key Algorithms:**
- Sorting (Bubble, Merge, Quick)
- Searching (Linear, Binary)
- Graph traversal (BFS, DFS)

Start with arrays and basic sorting algorithms, then gradually work your way up. Practice is key!

*Note: This is a demo response. Add your OpenAI API key for personalized AI tutoring.*`;
    }

    if (lowerMessage.includes('database') || lowerMessage.includes('sql')) {
      return `Databases are crucial for storing and managing data! Here's what you should focus on:

**SQL Fundamentals:**
- SELECT, INSERT, UPDATE, DELETE operations
- JOINs (INNER, LEFT, RIGHT, FULL)
- Indexes and optimization
- Normalization principles

**Database Design:**
- Entity-Relationship diagrams
- Primary and foreign keys
- ACID properties

For ${context.fieldOfStudy.replace('_', ' ')}, I'd recommend starting with MySQL or PostgreSQL for hands-on practice.

*Note: This is a demo response. Add your OpenAI API key for full AI-powered tutoring.*`;
    }

    // General response
    return `Hello! I'm your AI Study Coach, here to help with your ${context.fieldOfStudy.replace('_', ' ')} studies at the ${context.userLevel.toLowerCase()} level.

I can help you with:
🐍 Programming (Python, Java, JavaScript, C++)
📊 Data Structures & Algorithms  
🗄️ Databases & SQL
🖥️ Operating Systems
🌐 Computer Networks
🔒 Cybersecurity
⚙️ Software Engineering

Ask me anything about these topics, and I'll provide explanations tailored to your learning level!

*Note: This is a demo response. To unlock full AI-powered tutoring with personalized explanations, please add your OpenAI API key to the backend configuration.*`;
  }

  static async generateStudyPlan(
    subject: string,
    level: string,
    duration: number,
    hoursPerDay: number
  ): Promise<any> {
    try {
      if (!openai) {
        return this.getMockStudyPlan(subject, level, duration, hoursPerDay);
      }

      const prompt = `Create a ${duration}-day study plan for ${subject} at ${level} level.
Student can study ${hoursPerDay} hours per day.

Return a JSON object with this structure:
{
  "title": "Study Plan Title",
  "description": "Brief description",
  "totalHours": number,
  "tasks": [
    {
      "day": number,
      "title": "Task title",
      "description": "Detailed description",
      "estimatedMinutes": number,
      "topics": ["topic1", "topic2"]
    }
  ]
}

Focus on practical learning with hands-on exercises.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.3,
      });

      const response = completion.choices[0]?.message?.content;
      return JSON.parse(response || '{}');
    } catch (error) {
      console.error('Study Plan Generation Error:', error);
      return this.getMockStudyPlan(subject, level, duration, hoursPerDay);
    }
  }

  private static getMockStudyPlan(subject: string, level: string, duration: number, hoursPerDay: number): any {
    const totalMinutes = duration * hoursPerDay * 60;
    const tasksPerDay = Math.max(1, Math.floor(hoursPerDay));
    
    const tasks = [];
    for (let day = 1; day <= Math.min(duration, 7); day++) {
      for (let task = 1; task <= tasksPerDay; task++) {
        tasks.push({
          day,
          title: `${subject.replace('_', ' ')} - Day ${day}, Task ${task}`,
          description: `Study session focusing on ${subject.replace('_', ' ')} fundamentals at ${level.toLowerCase()} level. This is a demo task - add OpenAI API key for personalized study plans.`,
          estimatedMinutes: Math.floor((hoursPerDay * 60) / tasksPerDay),
          topics: [subject.replace('_', ' '), 'Practice Exercises', 'Review']
        });
      }
    }

    return {
      title: `${subject.replace('_', ' ')} Study Plan (${level})`,
      description: `A ${duration}-day study plan for ${subject.replace('_', ' ')} at ${level.toLowerCase()} level. This is a demo plan - add your OpenAI API key for AI-generated personalized study plans.`,
      totalHours: duration * hoursPerDay,
      tasks
    };
  }

  static async generateQuiz(
    subject: string,
    level: string,
    questionCount: number = 5
  ): Promise<any> {
    try {
      if (!openai) {
        return this.getMockQuiz(subject, level, questionCount);
      }

      const prompt = `Generate a ${questionCount}-question quiz for ${subject} at ${level} level.

Return a JSON object with this structure:
{
  "title": "Quiz Title",
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Why this is correct"
    }
  ]
}

Mix multiple choice and short answer questions. Focus on understanding, not memorization.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.3,
      });

      const response = completion.choices[0]?.message?.content;
      return JSON.parse(response || '{}');
    } catch (error) {
      console.error('Quiz Generation Error:', error);
      return this.getMockQuiz(subject, level, questionCount);
    }
  }

  private static getMockQuiz(subject: string, level: string, questionCount: number): any {
    const questions = [];
    for (let i = 1; i <= questionCount; i++) {
      questions.push({
        id: `q${i}`,
        type: 'multiple_choice',
        question: `Sample ${subject.replace('_', ' ')} question ${i} for ${level.toLowerCase()} level students. This is a demo question - add OpenAI API key for AI-generated quizzes.`,
        options: [
          'Option A (Demo)',
          'Option B (Demo)', 
          'Option C (Demo)',
          'Option D (Demo)'
        ],
        correctAnswer: 0,
        explanation: 'This is a demo explanation. Add your OpenAI API key to get AI-generated quiz questions with detailed explanations.'
      });
    }

    return {
      title: `${subject.replace('_', ' ')} Quiz (${level}) - Demo`,
      questions
    };
  }

  static async analyzeCode(
    code: string,
    language: string,
    problemDescription?: string
  ): Promise<string> {
    try {
      if (!openai) {
        return this.getMockCodeAnalysis(code, language, problemDescription);
      }

      const prompt = `Analyze this ${language} code${problemDescription ? ` for the problem: ${problemDescription}` : ''}:

\`\`\`${language}
${code}
\`\`\`

Provide feedback on:
1. Correctness and logic
2. Code quality and best practices
3. Performance considerations
4. Suggestions for improvement

Be constructive and educational in your feedback.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.3,
      });

      return completion.choices[0]?.message?.content || 'Unable to analyze code.';
    } catch (error) {
      console.error('Code Analysis Error:', error);
      return this.getMockCodeAnalysis(code, language, problemDescription);
    }
  }

  private static getMockCodeAnalysis(code: string, language: string, problemDescription?: string): string {
    return `## Code Analysis (Demo Mode)

**Language:** ${language}
**Problem:** ${problemDescription || 'General code review'}

### Analysis:
Your code submission has been received and would normally be analyzed by our AI system. Here's what our analysis typically covers:

1. **Correctness & Logic**: Checking if the code solves the intended problem
2. **Code Quality**: Reviewing naming conventions, structure, and readability  
3. **Performance**: Identifying potential optimizations
4. **Best Practices**: Suggesting improvements following ${language} conventions

### Demo Feedback:
- Code structure appears organized
- Consider adding comments for complex logic
- Variable names could be more descriptive
- Look for opportunities to optimize time/space complexity

**Note:** This is a demo analysis. Add your OpenAI API key to get detailed, personalized code feedback powered by AI.

### Next Steps:
- Test your code with edge cases
- Consider alternative approaches
- Practice similar problems to reinforce concepts`;
  }
}