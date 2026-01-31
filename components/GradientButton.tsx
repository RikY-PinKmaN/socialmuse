import React from 'react';

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const GradientButton: React.FC<GradientButtonProps> = ({ children, className = '', variant = 'primary', ...props }) => {
  const baseClasses = "relative inline-flex items-center justify-center overflow-hidden rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group";
  
  const primaryClasses = "bg-neutral-950 text-white shadow-2xl hover:shadow-fuchsia-500/25 border border-neutral-800";
  const secondaryClasses = "bg-transparent text-neutral-300 hover:text-white border border-neutral-800 hover:bg-neutral-800";

  const activeClass = variant === 'primary' ? primaryClasses : secondaryClasses;

  return (
    <button className={`${baseClasses} ${activeClass} ${className}`} {...props}>
      {variant === 'primary' && (
        <span className="absolute inset-0 w-full h-full -mt-10 transition-all duration-700 opacity-0 bg-gradient-to-r from-transparent via-fuchsia-500/10 to-transparent group-hover:opacity-100 animate-shine-slide"></span>
      )}
      <span className="relative flex items-center gap-2">{children}</span>
    </button>
  );
};

export default GradientButton;