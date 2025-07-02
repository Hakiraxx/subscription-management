import axios from 'axios';
import toast from 'react-hot-toast';

// Tạo axios instance với base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để thêm token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);

    // Xử lý lỗi 401 (Unauthorized)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
      return Promise.reject(error);
    }

    // Xử lý các lỗi khác
    const message = error.response?.data?.message || 'Có lỗi xảy ra! Vui lòng thử lại.';
    
    // Không hiển thị toast cho một số trường hợp
    const silentErrors = ['/auth/profile'];
    const isSilentError = silentErrors.some(path => error.config?.url?.includes(path));
    
    if (!isSilentError) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (loginData) => {
    const response = await api.post('/auth/login', loginData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },
};

// Subscription API calls
export const subscriptionAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/subscriptions', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/subscriptions/${id}`);
    return response.data;
  },

  create: async (subscriptionData) => {
    const response = await api.post('/subscriptions', subscriptionData);
    return response.data;
  },

  update: async (id, subscriptionData) => {
    const response = await api.put(`/subscriptions/${id}`, subscriptionData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/subscriptions/${id}`);
    return response.data;
  },

  renew: async (id) => {
    const response = await api.post(`/subscriptions/${id}/renew`);
    return response.data;
  },

  // Test email configuration  
  testEmail: async () => {
    const response = await api.post('/subscriptions/test-email-public');
    return response.data;
  },

  // Send payment reminder email
  sendReminder: async (id) => {
    const response = await api.post(`/subscriptions/send-reminder/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/subscriptions/stats/dashboard');
    return response.data;
  },
};

// User API calls
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/users/change-password', passwordData);
    return response.data;
  },

  deleteAccount: async (confirmationData) => {
    const response = await api.delete('/users/account', { data: confirmationData });
    return response.data;
  },

  exportData: async () => {
    const response = await api.get('/users/export-data', {
      responseType: 'blob', // Để download file
    });
    return response.data;
  },
};

// Helper functions
export const apiHelpers = {
  // Download file từ blob response
  downloadFile: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Format lỗi validation
  formatValidationErrors: (errors) => {
    if (Array.isArray(errors)) {
      return errors.map(error => error.msg).join(', ');
    }
    return 'Dữ liệu không hợp lệ';
  },

  // Kiểm tra network error
  isNetworkError: (error) => {
    return !error.response && error.request;
  },

  // Retry API call
  retryCall: async (apiCall, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await apiCall();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        
        // Chỉ retry cho network errors hoặc 5xx errors
        if (apiHelpers.isNetworkError(error) || 
            (error.response?.status >= 500 && error.response?.status <= 599)) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
          continue;
        }
        
        throw error;
      }
    }
  },
};

export default api;
