import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { subscriptionAPI } from '../services/api';
import { DashboardLoading } from '../components/LoadingAnimation';
import Alert from '../components/Alert';
import Modal from '../components/Modal';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Mail,
  RefreshCw,
  FileText
} from 'lucide-react';
import { formatCurrency, formatDate, getDaysUntilPayment } from '../utils/helpers';
import ExportDropdown from '../components/ExportDropdown';
import EmailTestComponent from '../components/EmailTestComponent';
import { testPDFExport } from '../utils/testPDF';

const Dashboard = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    totalAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEmailTest, setShowEmailTest] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [alert, setAlert] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    serviceName: '',
    description: '',
    cost: '',
    currency: 'VND',
    billingCycle: 'monthly',
    startDate: '',
    isActive: true
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [subscriptionsRes, statsRes] = await Promise.all([
        subscriptionAPI.getAll(),
        subscriptionAPI.getStats()
      ]);
      
      setSubscriptions(subscriptionsRes.subscriptions || []);
      
      // Check for upcoming payments and create notifications
      const upcomingPayments = (subscriptionsRes.subscriptions || []).filter(sub => {
        const daysUntil = getDaysUntilPayment(sub.nextPaymentDate);
        return daysUntil <= 3 && daysUntil >= 0 && sub.isActive;
      });

      upcomingPayments.forEach(sub => {
        const daysUntil = getDaysUntilPayment(sub.nextPaymentDate);
        if (daysUntil === 0) {
          addNotification({
            type: 'payment',
            title: 'Payment Due Today',
            message: `${sub.serviceName} payment is due today (${formatCurrency(sub.cost, sub.currency)})`
          });
        } else if (daysUntil <= 3) {
          addNotification({
            type: 'payment',
            title: 'Payment Reminder',
            message: `${sub.serviceName} payment due in ${daysUntil} days (${formatCurrency(sub.cost, sub.currency)})`
          });
        }
      });
      
      // Map backend stats format to frontend format
      const backendStats = statsRes.stats;
      setStats({
        total: (backendStats.totalActive || 0) + (backendStats.totalInactive || 0),
        active: backendStats.totalActive || 0,
        expired: backendStats.totalInactive || 0,
        totalAmount: backendStats.monthlyTotal || 0
      });
    } catch (error) {
      console.error('API Error:', error);
      setAlert({ type: 'error', message: 'Không thể tải dữ liệu! Vui lòng kiểm tra kết nối.' });
    } finally {
      setLoading(false);
    }
  }, [addNotification]); // Thêm addNotification vào dependency array

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Sending data to backend:', formData);
      
      if (editingSubscription) {
        await subscriptionAPI.update(editingSubscription._id, formData);
        addNotification({
          type: 'success',
          title: 'Subscription Updated',
          message: `Successfully updated ${formData.serviceName}`
        });
        setAlert({ type: 'success', message: 'Cập nhật gói đăng ký thành công!' });
      } else {
        await subscriptionAPI.create(formData);
        addNotification({
          type: 'success',
          title: 'New Subscription Added',
          message: `Successfully added ${formData.serviceName} subscription`
        });
        setAlert({ type: 'success', message: 'Tạo gói đăng ký thành công!' });
      }
      
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error details:', error.response?.data);
      addNotification({
        type: 'warning',
        title: 'Operation Failed',
        message: 'Failed to save subscription. Please try again.'
      });
      setAlert({ type: 'error', message: error.response?.data?.message || 'Có lỗi xảy ra!' });
    }
  };

  const handleEdit = (subscription) => {
    setEditingSubscription(subscription);
    setFormData({
      serviceName: subscription.serviceName,
      description: subscription.description,
      cost: subscription.cost,
      currency: subscription.currency,
      billingCycle: subscription.billingCycle,
      startDate: subscription.startDate.split('T')[0],
      isActive: subscription.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa gói đăng ký này?')) {
      try {
        await subscriptionAPI.delete(id);
        setAlert({ type: 'success', message: 'Xóa gói đăng ký thành công!' });
        fetchData();
      } catch (error) {
        setAlert({ type: 'error', message: 'Không thể xóa gói đăng ký!' });
      }
    }
  };

  const handleRenew = async (id) => {
    try {
      await subscriptionAPI.renew(id);
      const subscription = subscriptions.find(sub => sub._id === id);
      addNotification({
        type: 'renewal',
        title: 'Subscription Renewed',
        message: `${subscription?.serviceName || 'Subscription'} has been renewed successfully`
      });
      setAlert({ type: 'success', message: 'Gia hạn gói đăng ký thành công!' });
      fetchData();
    } catch (error) {
      addNotification({
        type: 'warning',
        title: 'Renewal Failed',
        message: 'Failed to renew subscription. Please try again.'
      });
      setAlert({ type: 'error', message: 'Không thể gia hạn gói đăng ký!' });
    }
  };

  const handleTestEmail = async () => {
    setShowEmailTest(true);
  };

  const handleSendReminder = async (id) => {
    try {
      const subscription = subscriptions.find(sub => sub._id === id);
      const response = await subscriptionAPI.sendReminder(id);
      addNotification({
        type: 'success',
        title: 'Reminder Sent',
        message: `Payment reminder sent for ${subscription?.serviceName}`
      });
      setAlert({ type: 'success', message: response.data.message });
    } catch (error) {
      addNotification({
        type: 'warning',
        title: 'Reminder Failed',
        message: 'Failed to send payment reminder email.'
      });
      setAlert({ type: 'error', message: error.response?.data?.message || 'Không thể gửi email nhắc nhở!' });
    }
  };

  const handleTestPDFExport = async () => {
    try {
      const success = await testPDFExport();
      if (success) {
        addNotification({
          type: 'success',
          title: 'PDF Export Successful',
          message: 'The PDF has been exported successfully!'
        });
        setAlert({ type: 'success', message: 'Xuất PDF thành công!' });
      } else {
        addNotification({
          type: 'error',
          title: 'PDF Export Failed',
          message: 'PDF export test failed!'
        });
        setAlert({ type: 'error', message: 'Xuất PDF thất bại!' });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'PDF Export Failed',
        message: 'Failed to export PDF. Please try again.'
      });
      setAlert({ type: 'error', message: 'Không thể xuất PDF!' });
    }
  };

  const resetForm = () => {
    setFormData({
      serviceName: '',
      description: '',
      cost: '',
      currency: 'VND',
      billingCycle: 'monthly',
      startDate: '',
      isActive: true
    });
    setEditingSubscription(null);
  };

  const getStatusColor = (daysUntil) => {
    if (daysUntil < 0) return 'text-red-600 bg-red-50 border-red-200';
    if (daysUntil <= 3) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (daysUntil <= 7) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getStatusText = (daysUntil) => {
    if (daysUntil < 0) return `Quá hạn ${Math.abs(daysUntil)} ngày`;
    if (daysUntil === 0) return 'Hết hạn hôm nay';
    return `Còn ${daysUntil} ngày`;
  };

  if (loading) {
    return <DashboardLoading />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Xin chào {user?.fullName}, quản lý gói đăng ký của bạn</p>
      </div>

      {/* Alert */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tổng gói</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Đang hoạt động</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hết hạn</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.expired}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tổng chi phí/tháng</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalAmount, 'VND')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Gói đăng ký của bạn</h2>
        <div className="flex space-x-3">
          <button
            onClick={handleTestEmail}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center disabled:opacity-50"
          >
            <Mail className="w-4 h-4 mr-2" />
            Test Email
          </button>
          <ExportDropdown 
            subscriptions={subscriptions} 
            stats={stats}
          />
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm gói mới
          </button>
        </div>
      </div>

      {/* Subscriptions List */}
      {subscriptions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center transition-colors duration-200">
          <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Chưa có gói đăng ký nào</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Bắt đầu bằng cách thêm gói đăng ký đầu tiên của bạn</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Thêm gói đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((subscription) => {
            const daysUntil = getDaysUntilPayment(subscription.nextPaymentDate);
            return (
              <div key={subscription._id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{subscription.serviceName}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{subscription.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(subscription)}
                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(subscription._id)}
                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Chi phí:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(subscription.cost, subscription.currency)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Chu kỳ:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {subscription.billingCycle === 'monthly' ? 'Hàng tháng' :
                         subscription.billingCycle === 'yearly' ? 'Hàng năm' :
                         subscription.billingCycle === 'weekly' ? 'Hàng tuần' : subscription.billingCycle}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Thanh toán tiếp theo:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatDate(subscription.nextPaymentDate)}</span>
                    </div>

                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(daysUntil)}`}>
                      {getStatusText(daysUntil)}
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => handleRenew(subscription._id)}
                      className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm flex items-center justify-center"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Gia hạn
                    </button>
                    <button
                      onClick={() => handleSendReminder(subscription._id)}
                      className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 text-sm flex items-center justify-center"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Nhắc nhở
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Add/Edit Subscription */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingSubscription ? 'Chỉnh sửa gói đăng ký' : 'Thêm gói đăng ký mới'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tên dịch vụ *
            </label>
            <input
              type="text"
              required
              value={formData.serviceName}
              onChange={(e) => setFormData({...formData, serviceName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="VD: Netflix Premium"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows="3"
              placeholder="Mô tả về gói dịch vụ..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Chi phí *
              </label>
              <input
                type="number"
                required
                min="0"
                step="1000"
                value={formData.cost}
                onChange={(e) => setFormData({...formData, cost: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="149000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tiền tệ
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="VND">VND</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Chu kỳ thanh toán
            </label>
            <select
              value={formData.billingCycle}
              onChange={(e) => setFormData({...formData, billingCycle: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="weekly">Hàng tuần</option>
              <option value="monthly">Hàng tháng</option>
              <option value="yearly">Hàng năm</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ngày bắt đầu *
            </label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-white">
              Kích hoạt gói đăng ký
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingSubscription ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal for Email Test */}
      <Modal
        isOpen={showEmailTest}
        onClose={() => setShowEmailTest(false)}
        title="Test Email Configuration"
        size="xl"
      >
        <EmailTestComponent onClose={() => setShowEmailTest(false)} />
      </Modal>
    </div>
  );
};

export default Dashboard;
