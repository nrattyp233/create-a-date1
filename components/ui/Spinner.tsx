
import React from 'react';

const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  return (
    <div className="flex justify-center items-center p-4">
      <div className={`animate-spin rounded-full border-4 border-gray-600 border-t-pink-500 ${sizeClasses[size]}`}></div>
    </div>
  );
};

export default Spinner;
