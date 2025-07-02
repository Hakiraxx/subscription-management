import React from 'react';

// Animation Loading đẹp mắt với nhiều hiệu ứng
const LoadingAnimation = ({ 
  type = 'spinner', 
  size = 'md', 
  text = '',
  className = '' 
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'w-8 h-8';
      case 'lg': return 'w-16 h-16';
      case 'xl': return 'w-24 h-24';
      default: return 'w-12 h-12';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'text-sm';
      case 'lg': return 'text-lg';
      case 'xl': return 'text-xl';
      default: return 'text-base';
    }
  };

  const renderSpinner = () => (
    <div className={`relative ${getSizeClass()}`}>
      <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
      <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
    </div>
  );

  const renderDots = () => (
    <div className="flex space-x-2">
      <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );

  const renderPulse = () => (
    <div className={`${getSizeClass()} bg-blue-500 rounded-full animate-pulse`}></div>
  );

  const renderWave = () => (
    <div className="flex items-end space-x-1">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-2 bg-blue-500 rounded-full animate-pulse"
          style={{
            height: `${20 + Math.random() * 20}px`,
            animationDelay: `${i * 100}ms`,
            animationDuration: '1s'
          }}
        ></div>
      ))}
    </div>
  );

  const renderGradientSpinner = () => (
    <div className={`relative ${getSizeClass()}`}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-spin">
        <div className="absolute inset-1 rounded-full bg-white"></div>
      </div>
    </div>
  );

  const getAnimation = () => {
    switch (type) {
      case 'dots': return renderDots();
      case 'pulse': return renderPulse();
      case 'wave': return renderWave();
      case 'gradient': return renderGradientSpinner();
      default: return renderSpinner();
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      {getAnimation()}
      {text && (
        <p className={`mt-4 text-gray-600 font-medium ${getTextSize()}`}>
          {text}
        </p>
      )}
    </div>
  );
};

// Component cho full page loading
export const PageLoadingAnimation = ({ 
  text = 'Đang tải dữ liệu...', 
  type = 'gradient' 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <LoadingAnimation type={type} size="xl" text={text} />
      </div>
    </div>
  );
};

// Component cho dashboard loading
export const DashboardLoading = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <LoadingAnimation 
          type="gradient" 
          size="lg" 
          text="Đang tải dashboard..." 
        />
      </div>
    </div>
  );
};

// Component cho card loading
export const CardLoading = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
          <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
        </div>
        <div className="space-y-2">
          <div className="h-8 bg-gray-300 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
