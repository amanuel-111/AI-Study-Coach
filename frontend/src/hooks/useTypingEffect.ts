import { useState, useEffect } from 'react';

interface UseTypingEffectOptions {
  text: string;
  speed?: number;
  startDelay?: number;
}

export const useTypingEffect = ({ text, speed = 30, startDelay = 500 }: UseTypingEffectOptions) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;

    setDisplayedText('');
    setIsTyping(false);
    setIsComplete(false);

    const startTimeout = setTimeout(() => {
      setIsTyping(true);
      let currentIndex = 0;

      // Dynamic speed based on content length and type
      const getTypingSpeed = (index: number) => {
        const char = text[index];
        
        // Slower after punctuation for natural pauses
        if (index > 0 && /[.!?]/.test(text[index - 1])) {
          return speed * 3;
        }
        
        // Slower after commas
        if (index > 0 && text[index - 1] === ',') {
          return speed * 1.5;
        }
        
        // Faster for spaces
        if (char === ' ') {
          return speed * 0.5;
        }
        
        // Variable speed for more natural typing
        return speed + Math.random() * 10;
      };

      const typeNextChar = () => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
          
          const nextSpeed = getTypingSpeed(currentIndex);
          setTimeout(typeNextChar, nextSpeed);
        } else {
          setIsTyping(false);
          setIsComplete(true);
        }
      };

      typeNextChar();
    }, startDelay);

    return () => clearTimeout(startTimeout);
  }, [text, speed, startDelay]);

  return { displayedText, isTyping, isComplete };
};