import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Actions
const AUTH_ACTIONS = {
  AUTH_START: 'AUTH_START',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_FAILURE: 'AUTH_FAILURE',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.AUTH_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case AUTH_ACTIONS.AUTH_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.AUTH_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is logged in on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          // Verify token by getting user profile
          const response = await authAPI.getProfile();
          
          dispatch({
            type: AUTH_ACTIONS.AUTH_SUCCESS,
            payload: {
              user: response.user,
              token: token,
            },
          });
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({
            type: AUTH_ACTIONS.AUTH_FAILURE,
            payload: 'Phiên đăng nhập đã hết hạn',
          });
        }
      } else {
        dispatch({
          type: AUTH_ACTIONS.AUTH_FAILURE,
          payload: null,
        });
      }
    };

    initializeAuth();
  }, []); // Empty dependency array để chỉ chạy một lần khi mount

  // Login function
  const login = async (loginData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.AUTH_START });

      const response = await authAPI.login(loginData);
      
      // Save to localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      dispatch({
        type: AUTH_ACTIONS.AUTH_SUCCESS,
        payload: {
          user: response.user,
          token: response.token,
        },
      });

      toast.success(response.message || 'Đăng nhập thành công!');
      return { success: true, data: response };

    } catch (error) {
      const message = error.response?.data?.message || 'Đăng nhập thất bại';
      
      dispatch({
        type: AUTH_ACTIONS.AUTH_FAILURE,
        payload: message,
      });

      return { success: false, error: message };
    }
  };

  // Register function
  const register = async (registerData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.AUTH_START });

      const response = await authAPI.register(registerData);
      
      // Save to localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      dispatch({
        type: AUTH_ACTIONS.AUTH_SUCCESS,
        payload: {
          user: response.user,
          token: response.token,
        },
      });

      toast.success(response.message || 'Đăng ký thành công!');
      return { success: true, data: response };

    } catch (error) {
      const message = error.response?.data?.message || 'Đăng ký thất bại';
      
      dispatch({
        type: AUTH_ACTIONS.AUTH_FAILURE,
        payload: message,
      });

      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    
    toast.success('Đăng xuất thành công!');
  };

  // Update user profile
  const updateUser = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: response.user,
      });

      toast.success(response.message || 'Cập nhật thông tin thành công!');
      return { success: true, data: response };

    } catch (error) {
      const message = error.response?.data?.message || 'Cập nhật thất bại';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await authAPI.getProfile();
      
      localStorage.setItem('user', JSON.stringify(response.user));
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: response.user,
      });

      return { success: true, data: response };
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    updateUser,
    clearError,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
