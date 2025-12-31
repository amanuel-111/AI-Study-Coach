import React from 'react';
import { useTypingEffect } from '../hooks/useTypingEffect';

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
    startDelay: isLatest ? 400 : 0 // Slight delay for realism
  });

  // For older messages, show full content immediately
  const textToShow = isLatest ? displayedText : content;

  return (
    <div className={`bg-gray-100 text-gray-900 rounded-2xl px-4 py-3 ${isLatest ? 'message-fade-in' : ''}`}>
      <div className="whitespace-pre-wrap text-sm leading-relaxed">
        {textToShow}
        {isLatest && isTyping && (
          <span className="inline-block w-0.5 h-4 bg-gray-600 ml-1 typewriter-cursor" />
        )}
      </div>
      <div className="text-xs mt-2 text-gray-500">
        {new Date(timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default TypewriterMessage;