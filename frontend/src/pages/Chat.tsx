import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { chatAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import TypewriterMessage from '../components/TypewriterMessage';
import { 
  Send, 
  MessageCircle, 
  Trash2, 
  Plus,
  Sparkles,
  BookOpen,
  Code,
  Database,
  Shield,
  History,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  timestamp: string;
}

const Chat: React.FC = () => {
  const [message, setMessage] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [lastSentMessageId, setLastSentMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Get chat sessions
  const { data: sessionsData } = useQuery('chatSessions', chatAPI.getSessions);
  const sessions = sessionsData?.data || [];

  // Get current session messages
  const { data: sessionData, isLoading: messagesLoading } = useQuery(
    ['chatSession', currentSessionId],
    () => currentSessionId ? chatAPI.getSession(currentSessionId) : null,
    { enabled: !!currentSessionId }
  );
  const messages: Message[] = sessionData?.data?.messages || [];

  // Send message mutation
  const sendMessageMutation = useMutation(chatAPI.sendMessage, {
    onSuccess: (data) => {
      setCurrentSessionId(data.data.sessionId);
      // Track the ID of the AI message we just received to enable typing animation
      if (data.data.aiMessageId) {
        setLastSentMessageId(data.data.aiMessageId);
        
        // Clear the typing animation state after a reasonable time
        // This prevents interference with future messages
        setTimeout(() => {
          setLastSentMessageId(null);
        }, 10000); // 10 seconds should be enough for most messages
      }
      queryClient.invalidateQueries('chatSessions');
      queryClient.invalidateQueries(['chatSession', data.data.sessionId]);
      setMessage('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to send message');
    }
  });

  // Delete session mutation
  const deleteSessionMutation = useMutation(chatAPI.deleteSession, {
    onSuccess: () => {
      queryClient.invalidateQueries('chatSessions');
      if (currentSessionId) {
        setCurrentSessionId(null);
      }
      toast.success('Chat session deleted');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendMessageMutation.mutate({
      message: message.trim(),
      sessionId: currentSessionId || undefined
    });
  };

  const handleDeleteSession = (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this chat session?')) {
      deleteSessionMutation.mutate(sessionId);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clear typing animation state when switching sessions
  useEffect(() => {
    setLastSentMessageId(null);
  }, [currentSessionId]);

  // Reset session loaded flag when starting new chat
  const startNewChat = () => {
    setCurrentSessionId(null);
    setLastSentMessageId(null);
    setShowSidebar(false);
  };
  const quickPrompts = [
    {
      icon: BookOpen,
      title: "Explain Python basics",
      prompt: "Can you explain Python programming basics for a beginner?",
      color: "bg-blue-50 text-blue-600 border-blue-200"
    },
    {
      icon: Code,
      title: "Data structures help",
      prompt: "Help me understand data structures and algorithms",
      color: "bg-green-50 text-green-600 border-green-200"
    },
    {
      icon: Database,
      title: "Database concepts",
      prompt: "Explain database design and SQL fundamentals",
      color: "bg-purple-50 text-purple-600 border-purple-200"
    },
    {
      icon: Shield,
      title: "Cybersecurity basics",
      prompt: "What are the fundamental concepts of cybersecurity?",
      color: "bg-red-50 text-red-600 border-red-200"
    }
  ];

  const handleQuickPrompt = (prompt: string) => {
    setMessage(prompt);
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-gray-50">
      {/* Sidebar - Chat History */}
      <div className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <History className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Chat History</h2>
            </div>
            <button
              onClick={startNewChat}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="New Chat"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          {/* Chat Sessions List */}
          <div className="flex-1 overflow-y-auto p-2">
            {sessions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs text-gray-400">Start chatting to see your history</p>
              </div>
            ) : (
              <div className="space-y-1">
                {sessions.map((session: any) => (
                  <div
                    key={session.id}
                    className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                      currentSessionId === session.id
                        ? 'bg-primary-50 border border-primary-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setCurrentSessionId(session.id);
                      setLastSentMessageId(null); // Clear typing animation for historical messages
                      setShowSidebar(false);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate text-sm">
                          {session.title || 'New Conversation'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(session.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(session.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">AI Study Coach</h1>
                <p className="text-sm text-gray-500">
                  {user?.fieldOfStudy.replace('_', ' ')} • {user?.level} Level
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
              <Zap className="w-3 h-3" />
              <span>Gemini AI</span>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messagesLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">
                  {currentSessionId ? 'Loading conversation...' : 'Loading messages...'}
                </p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome to AI Study Coach
              </h3>
              <p className="text-gray-600 text-center mb-6 max-w-md">
                I'm here to help you learn {user?.fieldOfStudy.replace('_', ' ').toLowerCase()} concepts. 
                Ask me anything or try one of these topics:
              </p>
              
              {/* Quick Start Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
                {quickPrompts.map((prompt, index) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuickPrompt(prompt.prompt)}
                      className={`p-4 rounded-lg border-2 border-dashed transition-all hover:border-solid hover:shadow-md text-left ${prompt.color}`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{prompt.title}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-6 max-w-4xl mx-auto">
              {messages.map((msg, index) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex space-x-3 max-w-4xl w-full ${msg.role === 'USER' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'USER' 
                        ? 'bg-primary-600' 
                        : 'bg-gradient-to-r from-primary-500 to-primary-600'
                    }`}>
                      {msg.role === 'USER' ? (
                        <span className="text-white text-sm font-medium">
                          {user?.name.charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <Sparkles className="w-4 h-4 text-white" />
                      )}
                    </div>
                    
                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      {msg.role === 'USER' ? (
                        <div className="bg-primary-600 text-white rounded-2xl px-4 py-3 message-fade-in max-w-2xl ml-auto">
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {msg.content}
                          </div>
                          <div className="text-xs mt-2 text-primary-100">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      ) : (
                        <TypewriterMessage
                          content={msg.content}
                          timestamp={msg.timestamp}
                          isLatest={msg.id === lastSentMessageId}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {sendMessageMutation.isLoading && (
                <div className="flex justify-start">
                  <div className="flex space-x-3 max-w-4xl w-full">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center ai-thinking">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm message-fade-in">
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-sm text-gray-600 font-medium">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask me anything about your studies..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows={1}
                  disabled={sendMessageMutation.isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!message.trim() || sendMessageMutation.isLoading}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-primary-600 hover:text-primary-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span>Powered by Gemini AI</span>
            </div>
          </form>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
};

export default Chat;