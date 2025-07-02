import { format, formatDistanceToNow, parseISO, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';

// Date formatting utilities
export const dateUtils = {
  // Format date to Vietnamese format
  formatDate: (date, formatStr = 'dd/MM/yyyy') => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: vi });
  },

  // Format date with time
  formatDateTime: (date) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: vi });
  },

  // Get relative time (e.g., "2 ngày trước")
  getRelativeTime: (date) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { 
      addSuffix: true, 
      locale: vi 
    });
  },

  // Get days until a date
  getDaysUntil: (date) => {
    if (!date) return 0;
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return differenceInDays(dateObj, new Date());
  },

  // Check if date is overdue
  isOverdue: (date) => {
    return dateUtils.getDaysUntil(date) < 0;
  },

  // Get date input format (YYYY-MM-DD)
  toInputFormat: (date) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'yyyy-MM-dd');
  },
};

// Currency formatting utilities
export const currencyUtils = {
  // Format currency based on type
  format: (amount, currency = 'VND') => {
    if (amount === null || amount === undefined) return '';
    
    const numAmount = Number(amount);
    
    switch(currency) {
      case 'VND':
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(numAmount);
      case 'USD':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(numAmount);
      case 'EUR':
        return new Intl.NumberFormat('de-DE', {
          style: 'currency',
          currency: 'EUR',
        }).format(numAmount);
      default:
        return `${numAmount.toLocaleString()} ${currency}`;
    }
  },

  // Get currency symbol
  getSymbol: (currency) => {
    const symbols = {
      'VND': '₫',
      'USD': '$',
      'EUR': '€',
    };
    return symbols[currency] || currency;
  },
};

// Subscription utilities
export const subscriptionUtils = {
  // Get billing cycle text in Vietnamese
  getBillingCycleText: (cycle) => {
    const cycleTexts = {
      'monthly': 'Hàng tháng',
      'quarterly': 'Hàng quý', 
      'yearly': 'Hàng năm',
    };
    return cycleTexts[cycle] || cycle;
  },

  // Get subscription status
  getStatus: (subscription) => {
    if (!subscription.isActive) {
      return { text: 'Tạm dừng', color: 'gray', type: 'inactive' };
    }

    const daysUntil = dateUtils.getDaysUntil(subscription.nextPaymentDate);
    
    if (daysUntil < 0) {
      return { text: 'Quá hạn', color: 'red', type: 'overdue' };
    }
    
    if (daysUntil <= 7) {
      return { text: 'Sắp đến hạn', color: 'yellow', type: 'due-soon' };
    }
    
    return { text: 'Hoạt động', color: 'green', type: 'active' };
  },

  // Calculate next payment date
  calculateNextPaymentDate: (startDate, billingCycle) => {
    const date = new Date(startDate);
    
    switch(billingCycle) {
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        // Default to monthly if cycle is unknown
        date.setMonth(date.getMonth() + 1);
        break;
    }
    
    return date;
  },

  // Get urgency level for sorting
  getUrgencyLevel: (subscription) => {
    const status = subscriptionUtils.getStatus(subscription);
    
    switch(status.type) {
      case 'overdue': return 1;
      case 'due-soon': return 2;
      case 'active': return 3;
      case 'inactive': return 4;
      default: return 5;
    }
  },
};

// Form validation utilities
export const validationUtils = {
  // Email validation
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Username validation
  isValidUsername: (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    return usernameRegex.test(username);
  },

  // Password strength check
  getPasswordStrength: (password) => {
    if (!password) return { score: 0, text: 'Không có mật khẩu', color: 'gray' };
    
    let score = 0;
    
    // Length
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Complexity
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    
    if (score <= 2) {
      return { score, text: 'Yếu', color: 'red' };
    } else if (score <= 4) {
      return { score, text: 'Trung bình', color: 'yellow' };
    } else {
      return { score, text: 'Mạnh', color: 'green' };
    }
  },

  // Required field validation
  required: (value, fieldName = 'Trường này') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} là bắt buộc`;
    }
    return null;
  },

  // Min length validation
  minLength: (value, min, fieldName = 'Trường này') => {
    if (value && value.length < min) {
      return `${fieldName} phải có ít nhất ${min} ký tự`;
    }
    return null;
  },

  // Max length validation
  maxLength: (value, max, fieldName = 'Trường này') => {
    if (value && value.length > max) {
      return `${fieldName} không được quá ${max} ký tự`;
    }
    return null;
  },
};

// Local storage utilities
export const storageUtils = {
  // Get item from localStorage with fallback
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },

  // Set item to localStorage
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  },

  // Remove item from localStorage
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },

  // Clear all localStorage
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  },
};

// Debounce utility
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
};

// Throttle utility
export const throttle = (func, limit) => {
  let inThrottle;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Truncate text
export const truncate = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (error) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Export individual functions for backward compatibility
export const formatCurrency = currencyUtils.format;
export const formatDate = dateUtils.formatDate;
export const formatDateTime = dateUtils.formatDateTime;
export const getDaysUntilPayment = dateUtils.getDaysUntil;
export const isOverdue = dateUtils.isOverdue;
