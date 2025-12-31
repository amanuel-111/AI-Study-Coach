import { ChatMessage, AIPromptContext } from '../types';

export class FreeAIService {
  
  // Google Gemini Free API Integration
  static async generateResponseWithGemini(
    message: string,
    context: AIPromptContext,
    chatHistory: ChatMessage[] = []
  ): Promise<string> {
    try {
      // Google Gemini has a generous free tier
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
      
      if (!GEMINI_API_KEY) {
        return this.getLocalResponse(message, context);
      }

      const systemPrompt = this.getSystemPrompt(context);
      const conversationHistory = chatHistory.slice(-5).map(msg => 
        `${msg.role}: ${msg.content}`
      ).join('\n');

      const prompt = `${systemPrompt}\n\nConversation History:\n${conversationHistory}\n\nUser: ${message}\nAssistant:`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      const data = await response.json() as any;
      return data.candidates?.[0]?.content?.parts?.[0]?.text || this.getLocalResponse(message, context);
    } catch (error) {
      console.error('Gemini API Error:', error);
      return this.getLocalResponse(message, context);
    }
  }

  // Hugging Face Free API Integration
  static async generateResponseWithHuggingFace(
    message: string,
    context: AIPromptContext
  ): Promise<string> {
    try {
      // Hugging Face has free inference API
      const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
      
      if (!HF_API_KEY) {
        return this.getLocalResponse(message, context);
      }

      const systemPrompt = this.getSystemPrompt(context);
      const prompt = `${systemPrompt}\n\nStudent Question: ${message}\n\nTutor Response:`;

      const response = await fetch(
        "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large",
        {
          headers: {
            Authorization: `Bearer ${HF_API_KEY}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_length: 500,
              temperature: 0.7,
              do_sample: true
            }
          }),
        }
      );

      const result = await response.json() as any;
      return result[0]?.generated_text || this.getLocalResponse(message, context);
    } catch (error) {
      console.error('Hugging Face API Error:', error);
      return this.getLocalResponse(message, context);
    }
  }

  // Ollama Local AI Integration (Completely Free & Private)
  static async generateResponseWithOllama(
    message: string,
    context: AIPromptContext
  ): Promise<string> {
    try {
      // Ollama runs locally - completely free
      const systemPrompt = this.getSystemPrompt(context);
      
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama2', // or 'codellama' for coding questions
          prompt: `${systemPrompt}\n\nStudent: ${message}\nTutor:`,
          stream: false
        })
      });

      const data = await response.json() as any;
      return data.response || this.getLocalResponse(message, context);
    } catch (error) {
      console.error('Ollama Error (make sure Ollama is running):', error);
      return this.getLocalResponse(message, context);
    }
  }

  // Enhanced Local Responses (No API needed)
  static getLocalResponse(message: string, context: AIPromptContext): string {
    const lowerMessage = message.toLowerCase();
    const level = context.userLevel.toLowerCase();
    const field = context.fieldOfStudy.replace('_', ' ');

    // Programming responses
    if (lowerMessage.includes('python')) {
      return this.getPythonResponse(lowerMessage, level);
    }
    
    if (lowerMessage.includes('java')) {
      return this.getJavaResponse(lowerMessage, level);
    }
    
    if (lowerMessage.includes('javascript') || lowerMessage.includes('js')) {
      return this.getJavaScriptResponse(lowerMessage, level);
    }
    
    if (lowerMessage.includes('algorithm') || lowerMessage.includes('data structure')) {
      return this.getAlgorithmResponse(lowerMessage, level);
    }
    
    if (lowerMessage.includes('database') || lowerMessage.includes('sql')) {
      return this.getDatabaseResponse(lowerMessage, level);
    }

    if (lowerMessage.includes('network') || lowerMessage.includes('tcp') || lowerMessage.includes('http')) {
      return this.getNetworkResponse(lowerMessage, level);
    }

    if (lowerMessage.includes('security') || lowerMessage.includes('cyber')) {
      return this.getSecurityResponse(lowerMessage, level);
    }

    // General response
    return `Hello! I'm your AI Study Coach for ${field} at the ${level} level.

I can help you with:
🐍 **Programming**: Python, Java, JavaScript, C++
📊 **Data Structures & Algorithms**
🗄️ **Databases & SQL**
🖥️ **Operating Systems**
🌐 **Computer Networks**
🔒 **Cybersecurity**
⚙️ **Software Engineering**

Ask me specific questions about any of these topics, and I'll provide detailed explanations tailored to your ${level} level!

**💡 Tip**: Try asking things like:
- "Explain Python loops for beginners"
- "What are binary trees?"
- "How does HTTP work?"
- "What is SQL injection?"`;
  }

  private static getPythonResponse(message: string, level: string): string {
    if (message.includes('loop') || message.includes('for') || message.includes('while')) {
      return level === 'beginner' ? 
        `# Python Loops for Beginners

**For Loops** - repeat code a specific number of times:
\`\`\`python
# Loop through numbers
for i in range(5):
    print(f"Number: {i}")

# Loop through a list
fruits = ["apple", "banana", "orange"]
for fruit in fruits:
    print(fruit)
\`\`\`

**While Loops** - repeat while condition is true:
\`\`\`python
count = 0
while count < 5:
    print(f"Count: {count}")
    count += 1
\`\`\`

**Practice**: Try creating a loop that prints even numbers from 2 to 10!` :
        
        `# Advanced Python Loops

**List Comprehensions**:
\`\`\`python
# Instead of:
squares = []
for x in range(10):
    squares.append(x**2)

# Use:
squares = [x**2 for x in range(10)]
\`\`\`

**Enumerate for index + value**:
\`\`\`python
items = ['a', 'b', 'c']
for index, value in enumerate(items):
    print(f"{index}: {value}")
\`\`\`

**Zip for parallel iteration**:
\`\`\`python
names = ['Alice', 'Bob']
ages = [25, 30]
for name, age in zip(names, ages):
    print(f"{name} is {age} years old")
\`\`\``;
    }

    return `# Python Programming Help

Python is a great language for ${level} programmers! Here are key concepts:

**Variables & Data Types**:
\`\`\`python
name = "Alice"        # String
age = 25             # Integer
height = 5.6         # Float
is_student = True    # Boolean
\`\`\`

**Functions**:
\`\`\`python
def greet(name):
    return f"Hello, {name}!"

result = greet("World")
print(result)  # Hello, World!
\`\`\`

What specific Python topic would you like to explore?`;
  }

  private static getJavaResponse(message: string, level: string): string {
    return `# Java Programming Help

Java is perfect for ${level} developers! Key concepts:

**Classes and Objects**:
\`\`\`java
public class Student {
    private String name;
    private int age;
    
    public Student(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    public void study() {
        System.out.println(name + " is studying!");
    }
}
\`\`\`

**Main Method**:
\`\`\`java
public static void main(String[] args) {
    Student student = new Student("Alice", 20);
    student.study();
}
\`\`\`

What Java concept would you like to learn more about?`;
  }

  private static getJavaScriptResponse(message: string, level: string): string {
    return `# JavaScript Programming Help

JavaScript is essential for web development! Here's what ${level} developers should know:

**Variables & Functions**:
\`\`\`javascript
// Modern variable declarations
const name = "Alice";
let age = 25;

// Arrow functions
const greet = (name) => {
    return \`Hello, \${name}!\`;
};

console.log(greet("World"));
\`\`\`

**DOM Manipulation**:
\`\`\`javascript
// Select elements
const button = document.getElementById('myButton');

// Add event listener
button.addEventListener('click', () => {
    alert('Button clicked!');
});
\`\`\`

What JavaScript topic interests you most?`;
  }

  private static getAlgorithmResponse(message: string, level: string): string {
    return `# Algorithms & Data Structures

Essential for ${level} computer science students!

**Big O Notation**:
- O(1) - Constant time
- O(log n) - Logarithmic time
- O(n) - Linear time
- O(n²) - Quadratic time

**Common Data Structures**:
1. **Arrays** - Fixed size, indexed access
2. **Linked Lists** - Dynamic size, sequential access
3. **Stacks** - LIFO (Last In, First Out)
4. **Queues** - FIFO (First In, First Out)
5. **Trees** - Hierarchical structure
6. **Hash Tables** - Key-value pairs

**Sorting Algorithms**:
- Bubble Sort: O(n²)
- Merge Sort: O(n log n)
- Quick Sort: O(n log n) average

Which data structure or algorithm would you like to explore?`;
  }

  private static getDatabaseResponse(message: string, level: string): string {
    return `# Database & SQL Help

Databases are crucial for ${level} developers!

**Basic SQL Commands**:
\`\`\`sql
-- Create table
CREATE TABLE students (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    age INT,
    major VARCHAR(50)
);

-- Insert data
INSERT INTO students (id, name, age, major) 
VALUES (1, 'Alice', 20, 'Computer Science');

-- Query data
SELECT name, major FROM students WHERE age > 18;

-- Update data
UPDATE students SET age = 21 WHERE id = 1;
\`\`\`

**Database Concepts**:
- **Primary Key**: Unique identifier
- **Foreign Key**: Links tables together
- **Normalization**: Organizing data efficiently
- **Indexes**: Speed up queries

What database topic would you like to learn about?`;
  }

  private static getNetworkResponse(message: string, level: string): string {
    return `# Computer Networks

Networks are fundamental for ${level} IT professionals!

**OSI Model (7 Layers)**:
1. **Physical** - Cables, signals
2. **Data Link** - Ethernet, WiFi
3. **Network** - IP addresses, routing
4. **Transport** - TCP, UDP
5. **Session** - Connections
6. **Presentation** - Encryption, compression
7. **Application** - HTTP, FTP, email

**Key Protocols**:
- **HTTP/HTTPS** - Web communication
- **TCP** - Reliable data transfer
- **UDP** - Fast, unreliable transfer
- **DNS** - Domain name resolution
- **DHCP** - IP address assignment

**IP Addressing**:
- IPv4: 192.168.1.1 (32-bit)
- IPv6: 2001:db8::1 (128-bit)

What networking concept interests you?`;
  }

  private static getSecurityResponse(message: string, level: string): string {
    return `# Cybersecurity Fundamentals

Security is critical for ${level} professionals!

**CIA Triad**:
- **Confidentiality** - Data privacy
- **Integrity** - Data accuracy
- **Availability** - System accessibility

**Common Threats**:
1. **Malware** - Viruses, trojans, ransomware
2. **Phishing** - Fake emails/websites
3. **SQL Injection** - Database attacks
4. **XSS** - Cross-site scripting
5. **DDoS** - Denial of service attacks

**Security Measures**:
- **Encryption** - Protect data in transit/rest
- **Firewalls** - Network traffic filtering
- **Authentication** - Verify user identity
- **Authorization** - Control access rights
- **Regular Updates** - Patch vulnerabilities

**Best Practices**:
- Strong, unique passwords
- Two-factor authentication
- Regular backups
- Security awareness training

What security topic would you like to explore?`;
  }

  private static getSystemPrompt(context: AIPromptContext): string {
    return `You are an AI Study Coach specializing in ${context.fieldOfStudy.replace('_', ' ')}. 
Your student is at ${context.userLevel.toLowerCase()} level.

TEACHING PRINCIPLES:
- Be patient, encouraging, and supportive
- Explain concepts step-by-step
- Use practical examples and code snippets
- Ask questions to check understanding
- Adapt explanations to the student's level
- Provide actionable learning advice

Focus on helping students truly understand concepts through clear explanations and practical examples.`;
  }
}