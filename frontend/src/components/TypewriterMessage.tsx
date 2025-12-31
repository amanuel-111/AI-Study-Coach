import React from 'react';
import { useTypingEffect } from '../hooks/useTypingEffect';
import MarkdownMessage from './MarkdownMessage';

interface TypewriterMessageProps {
  content: string;
  timestamp: string;
  isLatest?: boolean;
}

const TypewriterMessage: React.FC<TypewriterMessageProps> = ({ 
  content, 
  timestamp, 
  isLatest = false 
}) => {
  const { displayedText, isTyping } = useTypingEffect({
    text: content,
    speed: 25, // Optimal typing speed
    startDelay: isLatest ? 400 : 0, // Only delay for latest messages
    enabled: isLatest // Only enable typing effect for latest messages
  });

  // For historical messages, show full content immediately
  const textToShow = isLatest ? displayedText : content;

  return (
    <div className={`bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm ${isLatest ? 'message-fade-in' : ''}`}>
      <div className="relative">
        <MarkdownMessage 
          content={textToShow}
          className="text-gray-800"
        />
        {isLatest && isTyping && (
          <span className="inline-block w-0.5 h-4 bg-gray-600 ml-1 typewriter-cursor" />
        )}
      </div>
      <div className="text-xs mt-3 pt-2 text-gray-500 border-t border-gray-100">
        {new Date(timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default TypewriterMessage;