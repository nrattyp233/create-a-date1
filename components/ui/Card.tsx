
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  const baseClasses = 'bg-gray-800/70 backdrop-blur-md rounded-xl shadow-lg border border-gray-700 transition-all duration-300';
  const clickableClasses = onClick ? 'cursor-pointer hover:border-pink-500 hover:shadow-pink-500/10' : '';

  return (
    <div className={`${baseClasses} ${clickableClasses} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
