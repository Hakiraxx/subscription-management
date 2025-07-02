import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { subscriptionAPI } from '../services/api';
import { debounce } from '../utils/helpers';

// Hook for managing subscriptions with search, filter, and pagination
export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [filters, setFilters] = useState({
    search: '',
    isActive: undefined,
    page: 1,
    limit: 10,
  });

  // Debounced search function
  const debouncedSearch = useRef(
    debounce((searchTerm) => {
      setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
    }, 300)
  ).current;

  // Fetch subscriptions
  const fetchSubscriptions = useCallback(async (filterParams = filters) => {
    try {
      setLoading(true);
      setError(null);

      // Clean filters (remove undefined values)
      const cleanFilters = Object.entries(filterParams).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});

      const response = await subscriptionAPI.getAll(cleanFilters);
      
      setSubscriptions(response.subscriptions || []);
      setPagination(response.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
      });

    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách gói đăng ký');
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to fetch subscriptions when filters change
  useEffect(() => {
    fetchSubscriptions(filters);
  }, [filters, fetchSubscriptions]);

  // Actions
  const searchSubscriptions = (searchTerm) => {
    debouncedSearch(searchTerm);
  };

  const filterByStatus = (isActive) => {
    setFilters(prev => ({ ...prev, isActive, page: 1 }));
  };

  const changePage = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const changeLimit = (limit) => {
    setFilters(prev => ({ ...prev, limit, page: 1 }));
  };

  const refreshSubscriptions = () => {
    fetchSubscriptions(filters);
  };

  const addSubscription = (newSubscription) => {
    setSubscriptions(prev => [newSubscription, ...prev]);
  };

  const updateSubscription = (updatedSubscription) => {
    setSubscriptions(prev => 
      prev.map(sub => 
        sub._id === updatedSubscription._id ? updatedSubscription : sub
      )
    );
  };

  const removeSubscription = (subscriptionId) => {
    setSubscriptions(prev => prev.filter(sub => sub._id !== subscriptionId));
  };

  return {
    subscriptions,
    loading,
    error,
    pagination,
    filters,
    searchSubscriptions,
    filterByStatus,
    changePage,
    changeLimit,
    refreshSubscriptions,
    addSubscription,
    updateSubscription,
    removeSubscription,
  };
};

// Hook for managing a single subscription
export const useSubscription = (subscriptionId) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!subscriptionId) {
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await subscriptionAPI.getById(subscriptionId);
        setSubscription(response.subscription);
        
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError(err.response?.data?.message || 'Không thể tải thông tin gói đăng ký');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [subscriptionId]);

  const updateSubscription = (updates) => {
    setSubscription(prev => ({ ...prev, ...updates }));
  };

  return {
    subscription,
    loading,
    error,
    updateSubscription,
  };
};

// Hook for dashboard stats
export const useDashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await subscriptionAPI.getStats();
      setStats(response.stats);
      
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.response?.data?.message || 'Không thể tải thống kê');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refreshStats: fetchStats,
  };
};

// Hook for form validation
export const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validate single field
  const validateField = useCallback((name, value, allValues) => {
    const rules = validationRules[name];
    if (!rules) return null;

    for (const rule of rules) {
      const error = rule(value, allValues);
      if (error) return error;
    }
    return null;
  }, [validationRules]);

  // Validate all fields and return validity
  const validateForm = useCallback(() => {
    const newErrors = {};
    let formIsValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName], values);
      if (error) {
        newErrors[fieldName] = error;
        formIsValid = false;
      }
    });

    setErrors(newErrors);
    return formIsValid;
  }, [values, validationRules, validateField]);

  // Calculate isValid based on current errors
  const isValid = useMemo(() => {
    return Object.keys(validationRules).every(fieldName => {
      const error = validateField(fieldName, values[fieldName], values);
      return !error;
    });
  }, [values, validationRules, validateField]);

  // Handle input change
  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle input blur
  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, values[name], values);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Reset form
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  // Set form values
  const setFormValues = (newValues) => {
    setValues(newValues);
  };

  return {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    setFormValues,
  };
};

// Hook for local storage
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading localStorage:', error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  };

  return [storedValue, setValue];
};

// Hook for async operations
export const useAsync = (asyncFunction, immediate = true) => {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setStatus('pending');
    setData(null);
    setError(null);

    try {
      const response = await asyncFunction(...args);
      setData(response);
      setStatus('success');
      return response;
    } catch (error) {
      setError(error);
      setStatus('error');
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    execute,
    status,
    data,
    error,
    isIdle: status === 'idle',
    isPending: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error',
  };
};

// Hook for previous value
export const usePrevious = (value) => {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
};

// Hook for click outside
export const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};
