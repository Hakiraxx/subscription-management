import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  className = '',
  text = ''
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-8 h-8';
      case 'xl':
        return 'w-12 h-12';
      case 'md':
      default:
        return 'w-6 h-6';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'white':
        return 'border-white border-t-transparent';
      case 'gray':
        return 'border-gray-300 border-t-gray-600';
      case 'primary':
      default:
        return 'border-gray-200 border-t-primary-600';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`
          animate-spin rounded-full border-2 
          ${getSizeClasses()} 
          ${getColorClasses()}
        `}
      />
      {text && (
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      )}
    </div>
  );
};

// Component cho full page loading
export const PageLoader = ({ text = 'Đang tải...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
};

// Component cho button loading
export const ButtonLoader = ({ className = '' }) => {
  return (
    <LoadingSpinner 
      size="sm" 
      color="white" 
      className={className}
    />
  );
};

// Component cho inline loading
export const InlineLoader = ({ text = 'Đang xử lý...' }) => {
  return (
    <div className="flex items-center justify-center py-4">
      <LoadingSpinner size="sm" className="mr-2" />
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  );
};

export default LoadingSpinner;
