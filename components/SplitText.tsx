import React from 'react';

interface SplitTextProps {
  text?: string;
  className?: string;
  delay?: number;
  duration?: number;
}

const SplitText: React.FC<SplitTextProps> = ({ 
  text = '', 
  className = '', 
  delay = 50, 
  duration = 1000 // ms
}) => {
  const words = text.split(' ').map(word => {
    return word.split('');
  });

  return (
    <div className={`relative inline-block leading-none ${className}`}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block whitespace-nowrap mr-[0.25em]">
          {word.map((char, charIndex) => {
            // Calculate global index for stagger effect
            const flatIndex = words.slice(0, wordIndex).reduce((acc, w) => acc + w.length, 0) + charIndex;
            const animationDelay = flatIndex * delay;
            
            return (
              <span
                key={charIndex}
                className="inline-block opacity-0"
                style={{
                  animationName: 'slide-up',
                  animationDuration: `${duration}ms`,
                  animationDelay: `${animationDelay}ms`,
                  animationFillMode: 'both', // Changed to both to ensure 'from' state is applied before animation starts
                  animationTimingFunction: 'cubic-bezier(0.2, 0.65, 0.3, 0.9)',
                }}
              >
                {char}
              </span>
            );
          })}
        </span>
      ))}
    </div>
  );
};

export default SplitText;
