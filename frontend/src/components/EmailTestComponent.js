import React, { useState } from 'react';
import { Mail, CheckCircle, AlertTriangle, Info, ExternalLink } from 'lucide-react';
import { subscriptionAPI } from '../services/api';

const EmailTestComponent = ({ onClose }) => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  const handleTestEmail = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      const response = await subscriptionAPI.testEmail();
      console.log('Email test response:', response); // Debug log
      
      // Check if response indicates success
      if (response.success) {
        setResult({
          type: 'success',
          message: response.message || 'Email test đã được gửi thành công!',
          messageId: response.messageId
        });
      } else {
        setResult({
          type: 'error',
          message: response.message || 'Email test thất bại!',
          error: response.error
        });
      }
    } catch (error) {
      console.error('Email test error:', error); // Debug log
      setResult({
        type: 'error',
        message: error.response?.data?.message || 'Không thể gửi email test!',
        error: error.response?.data?.error
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Mail className="w-5 h-5 mr-2 text-blue-600" />
          Test Email Configuration
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ×
          </button>
        )}
      </div>

      {/* Email Configuration Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Cấu hình Email hiện tại
            </h4>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <p><strong>Host:</strong> smtp.gmail.com</p>
              <p><strong>Port:</strong> 587</p>
              <p><strong>Email:</strong> hakiranguyen94@gmail.com</p>
              <p><strong>Secure:</strong> STARTTLS</p>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
              Hướng dẫn cấu hình Gmail
            </h4>
            <div className="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
              <p>Để sử dụng Gmail SMTP, bạn cần:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Bật 2-Factor Authentication cho Gmail</li>
                <li>Tạo App Password thay vì dùng mật khẩu thường</li>
                <li>Cập nhật EMAIL_PASS trong file .env với App Password</li>
              </ol>
              <a 
                href="https://support.google.com/accounts/answer/185833" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100 mt-2"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Hướng dẫn tạo App Password
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Test Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleTestEmail}
          disabled={testing}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <Mail className="w-5 h-5 mr-2" />
          {testing ? 'Đang gửi email test...' : 'Gửi Email Test'}
        </button>
      </div>

      {/* Test Result */}
      {result && (
        <div className={`border rounded-lg p-4 ${
          result.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-start">
            {result.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            )}
            <div>
              <h4 className={`font-medium mb-2 ${
                result.type === 'success' 
                  ? 'text-green-900 dark:text-green-100' 
                  : 'text-red-900 dark:text-red-100'
              }`}>
                {result.type === 'success' ? '✅ Thành công!' : '❌ Thất bại!'}
              </h4>
              <p className={`text-sm ${
                result.type === 'success' 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {result.message}
              </p>
              {result.messageId && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Message ID: {result.messageId}
                </p>
              )}
              {result.error && (
                <details className="mt-2">
                  <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer">
                    Chi tiết lỗi
                  </summary>
                  <pre className="text-xs text-red-700 dark:text-red-300 mt-1 whitespace-pre-wrap">
                    {result.error}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Additional Tips */}
      <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
        <h4 className="font-medium mb-2">💡 Lưu ý:</h4>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Email test sẽ được gửi đến chính email cấu hình trong .env</li>
          <li>Kiểm tra cả hộp thư spam nếu không thấy email</li>
          <li>Nếu thất bại, kiểm tra lại cấu hình trong backend/.env</li>
          <li>Đảm bảo server backend đang chạy</li>
        </ul>
      </div>
    </div>
  );
};

export default EmailTestComponent;
