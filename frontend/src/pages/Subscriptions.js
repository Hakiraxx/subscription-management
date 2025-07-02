import React, { useState, useEffect, useCallback } from 'react';
import { subscriptionAPI } from '../services/api';
import Alert from '../components/Alert';
import Modal from '../components/Modal';
import { DashboardLoading } from '../components/LoadingAnimation';
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  RefreshCw,
  Mail,
  Eye,
  DollarSign,
  Clock
} from 'lucide-react';
import { formatCurrency, formatDate, getDaysUntilPayment } from '../utils/helpers';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        search: searchTerm || undefined,
        isActive: filterStatus === 'all' ? undefined : filterStatus === 'active'
      };
      
      const response = await subscriptionAPI.getAll(params);
      setSubscriptions(response.subscriptions || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Fetch error:', error);
      setAlert({ type: 'error', message: 'Không thể tải dữ liệu!' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterStatus]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubscription) {
        await subscriptionAPI.update(editingSubscription._id, formData);
        setAlert({ type: 'success', message: 'Cập nhật gói đăng ký thành công!' });
      } else {
        await subscriptionAPI.create(formData);
        setAlert({ type: 'success', message: 'Tạo gói đăng ký thành công!' });
      }
      
      setShowModal(false);
      resetForm();
      fetchSubscriptions();
    } catch (error) {
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
        fetchSubscriptions();
      } catch (error) {
        setAlert({ type: 'error', message: 'Không thể xóa gói đăng ký!' });
      }
    }
  };

  const handleRenew = async (id) => {
    try {
      await subscriptionAPI.renew(id);
      setAlert({ type: 'success', message: 'Gia hạn gói đăng ký thành công!' });
      fetchSubscriptions();
    } catch (error) {
      setAlert({ type: 'error', message: 'Không thể gia hạn gói đăng ký!' });
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

  if (loading && subscriptions.length === 0) {
    return <DashboardLoading />;
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý gói đăng ký</h1>
        <p className="text-gray-600 mt-2">Xem chi tiết và quản lý tất cả gói đăng ký của bạn</p>
      </div>

      {/* Alert */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm gói đăng ký..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* Filter */}
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="all">Tất cả</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>
              
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center whitespace-nowrap"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm mới
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions Grid */}
      {subscriptions.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterStatus !== 'all' ? 'Không tìm thấy gói đăng ký nào' : 'Chưa có gói đăng ký nào'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
              : 'Bắt đầu bằng cách thêm gói đăng ký đầu tiên của bạn'
            }
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Thêm gói đăng ký
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {subscriptions.map((subscription) => {
              const daysUntil = getDaysUntilPayment(subscription.nextPaymentDate);
              return (
                <div key={subscription._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {subscription.serviceName}
                        </h3>
                        {subscription.description && (
                          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                            {subscription.description}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={() => handleEdit(subscription)}
                          className="text-gray-400 hover:text-blue-600 p-1"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(subscription._id)}
                          className="text-gray-400 hover:text-red-600 p-1"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          Chi phí:
                        </span>
                        <span className="font-medium text-lg">
                          {formatCurrency(subscription.cost, subscription.currency)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Chu kỳ:
                        </span>
                        <span className="font-medium">
                          {subscription.billingCycle === 'monthly' ? 'Hàng tháng' :
                           subscription.billingCycle === 'yearly' ? 'Hàng năm' :
                           subscription.billingCycle === 'quarterly' ? 'Hàng quý' : 
                           'Hàng tuần'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Thanh toán:
                        </span>
                        <span className="font-medium text-sm">
                          {formatDate(subscription.nextPaymentDate)}
                        </span>
                      </div>

                      <div className={`px-3 py-1 rounded-full text-xs font-medium border text-center ${getStatusColor(daysUntil)}`}>
                        {getStatusText(daysUntil)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRenew(subscription._id)}
                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-xs flex items-center justify-center"
                        title="Gia hạn"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Gia hạn
                      </button>
                      <button
                        className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 text-xs flex items-center justify-center"
                        title="Gửi nhắc nhở"
                      >
                        <Mail className="w-3 h-3 mr-1" />
                        Nhắc nhở
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                
                <span className="px-4 py-2 text-sm text-gray-700">
                  Trang {currentPage} / {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên dịch vụ *
            </label>
            <input
              type="text"
              required
              value={formData.serviceName}
              onChange={(e) => setFormData({...formData, serviceName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="VD: Netflix Premium"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Mô tả về gói dịch vụ..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chi phí *
              </label>
              <input
                type="number"
                required
                min="0"
                step="1000"
                value={formData.cost}
                onChange={(e) => setFormData({...formData, cost: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="149000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiền tệ
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="VND">VND</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chu kỳ thanh toán
            </label>
            <select
              value={formData.billingCycle}
              onChange={(e) => setFormData({...formData, billingCycle: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="weekly">Hàng tuần</option>
              <option value="monthly">Hàng tháng</option>
              <option value="quarterly">Hàng quý</option>
              <option value="yearly">Hàng năm</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày bắt đầu *
            </label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
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
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
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
    </div>
  );
};

export default Subscriptions;
