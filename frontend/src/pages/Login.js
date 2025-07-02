import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFormValidation } from '../hooks';
import { validationUtils } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  // Validation rules
  const validationRules = {
    loginField: [
      (value) => validationUtils.required(value, 'Tên người dùng hoặc email'),
    ],
    password: [
      (value) => validationUtils.required(value, 'Mật khẩu'),
    ],
  };

  const {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
  } = useFormValidation(
    { loginField: '', password: '' },
    validationRules
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isValid) return;

    const result = await login(values);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Đăng nhập
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Vào hệ thống quản lý đăng ký của bạn
          </p>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-100">
          {error && (
            <Alert 
              type="error" 
              message={error} 
              className="mb-6"
              dismissible
              onClose={() => {/* Clear error if needed */}}
            />
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Login Field */}
            <div>
              <label htmlFor="loginField" className="form-label">
                Tên người dùng hoặc Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="loginField"
                  name="loginField"
                  type="text"
                  autoComplete="username"
                  value={values.loginField}
                  onChange={(e) => handleChange('loginField', e.target.value)}
                  onBlur={() => handleBlur('loginField')}
                  className={`
                    input pl-10
                    ${errors.loginField && touched.loginField ? 'border-red-300 focus:ring-red-500' : ''}
                  `}
                  placeholder="Nhập tên người dùng hoặc email"
                />
              </div>
              {errors.loginField && touched.loginField && (
                <p className="form-error">{errors.loginField}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="form-label">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={values.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`
                    input pl-10 pr-10
                    ${errors.password && touched.password ? 'border-red-300 focus:ring-red-500' : ''}
                  `}
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="form-error">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={!isValid || loading}
                className={`
                  w-full flex justify-center py-3 px-4 border border-transparent rounded-lg
                  text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2
                  transition-all duration-200
                  ${!isValid || loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 focus:ring-primary-500'
                  }
                `}
              >
                {loading ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Chưa có tài khoản?{' '}
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Bằng việc đăng nhập, bạn đồng ý với{' '}
            <a href="#" className="text-primary-600 hover:underline">
              Điều khoản sử dụng
            </a>{' '}
            và{' '}
            <a href="#" className="text-primary-600 hover:underline">
              Chính sách bảo mật
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
