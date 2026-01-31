import React from 'react';

const GlobalStyles = () => (
  <style>{`
    @keyframes slide-up {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes shine-slide {
      0% { transform: translateX(-100%) skewX(-15deg); }
      100% { transform: translateX(200%) skewX(-15deg); }
    }

    @keyframes shine {
      0% { background-position: -100% 0; }
      100% { background-position: 200% 0; }
    }
    
    .animate-shine {
      animation: shine 3s linear infinite;
    }
    
    .group:hover .animate-shine-slide {
      animation: shine-slide 1s;
    }

    /* Scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #000;
    }
    ::-webkit-scrollbar-thumb {
      background: #333;
      border-radius: 3px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #d946ef;
    }
  `}</style>
);

export default GlobalStyles;
