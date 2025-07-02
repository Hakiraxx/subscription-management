import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFormValidation } from '../hooks';
import { validationUtils } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { Eye, EyeOff, User, Mail, Lock, UserCheck } from 'lucide-react';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  // Validation rules
  const validationRules = {
    fullName: [
      (value) => validationUtils.required(value, 'Họ và tên'),
      (value) => validationUtils.minLength(value, 2, 'Họ và tên'),
      (value) => validationUtils.maxLength(value, 100, 'Họ và tên'),
    ],
    username: [
      (value) => validationUtils.required(value, 'Tên người dùng'),
      (value) => validationUtils.minLength(value, 3, 'Tên người dùng'),
      (value) => validationUtils.maxLength(value, 30, 'Tên người dùng'),
      (value) => {
        if (value && !validationUtils.isValidUsername(value)) {
          return 'Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới';
        }
        return null;
      },
    ],
    email: [
      (value) => validationUtils.required(value, 'Email'),
      (value) => {
        if (value && !validationUtils.isValidEmail(value)) {
          return 'Email không hợp lệ';
        }
        return null;
      },
    ],
    password: [
      (value) => validationUtils.required(value, 'Mật khẩu'),
      (value) => validationUtils.minLength(value, 6, 'Mật khẩu'),
    ],
    confirmPassword: [
      (value) => validationUtils.required(value, 'Xác nhận mật khẩu'),
      (value, allValues) => {
        if (value && value !== allValues.password) {
          return 'Mật khẩu xác nhận không khớp';
        }
        return null;
      },
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
    { 
      fullName: '', 
      username: '', 
      email: '', 
      password: '',
      confirmPassword: ''
    },
    validationRules
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submission - isValid:', isValid, 'values:', values, 'errors:', errors);
    
    if (!isValid) {
      console.log('Form không hợp lệ, không submit');
      return;
    }

    console.log('Submitting form with values:', values);
    const { confirmPassword, ...registerData } = values;
    
    try {
      const result = await register(registerData);
      
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Register error:', err);
    }
  };

  const passwordStrength = validationUtils.getPasswordStrength(values.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center mb-6">
            <UserCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Đăng ký tài khoản
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Tạo tài khoản mới để bắt đầu quản lý đăng ký
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
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="form-label">
                Họ và tên
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={values.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  className={`
                    input pl-10
                    ${errors.fullName && touched.fullName ? 'border-red-300 focus:ring-red-500' : ''}
                  `}
                  placeholder="Nhập họ và tên"
                />
              </div>
              {errors.fullName && touched.fullName && (
                <p className="form-error">{errors.fullName}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="form-label">
                Tên người dùng
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCheck className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={values.username}
                  onChange={(e) => handleChange('username', e.target.value.toLowerCase())}
                  onBlur={() => handleBlur('username')}
                  className={`
                    input pl-10
                    ${errors.username && touched.username ? 'border-red-300 focus:ring-red-500' : ''}
                  `}
                  placeholder="Nhập tên người dùng"
                />
              </div>
              {errors.username && touched.username && (
                <p className="form-error">{errors.username}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Chỉ được chứa chữ cái, số và dấu gạch dưới
              </p>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={(e) => handleChange('email', e.target.value.toLowerCase())}
                  onBlur={() => handleBlur('email')}
                  className={`
                    input pl-10
                    ${errors.email && touched.email ? 'border-red-300 focus:ring-red-500' : ''}
                  `}
                  placeholder="Nhập email"
                />
              </div>
              {errors.email && touched.email && (
                <p className="form-error">{errors.email}</p>
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
                  autoComplete="new-password"
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
              
              {/* Password Strength Indicator */}
              {values.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`
                          h-2 rounded-full transition-all duration-300
                          ${passwordStrength.color === 'red' ? 'bg-red-500' : ''}
                          ${passwordStrength.color === 'yellow' ? 'bg-yellow-500' : ''}
                          ${passwordStrength.color === 'green' ? 'bg-green-500' : ''}
                        `}
                        style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                      />
                    </div>
                    <span className={`
                      text-xs font-medium
                      ${passwordStrength.color === 'red' ? 'text-red-600' : ''}
                      ${passwordStrength.color === 'yellow' ? 'text-yellow-600' : ''}
                      ${passwordStrength.color === 'green' ? 'text-green-600' : ''}
                    `}>
                      {passwordStrength.text}
                    </span>
                  </div>
                </div>
              )}
              
              {errors.password && touched.password && (
                <p className="form-error">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={values.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  className={`
                    input pl-10 pr-10
                    ${errors.confirmPassword && touched.confirmPassword ? 'border-red-300 focus:ring-red-500' : ''}
                  `}
                  placeholder="Nhập lại mật khẩu"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && touched.confirmPassword && (
                <p className="form-error">{errors.confirmPassword}</p>
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
                  'Đăng ký'
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Đã có tài khoản?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Bằng việc đăng ký, bạn đồng ý với{' '}
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

export default Register;
