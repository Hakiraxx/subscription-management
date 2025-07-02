const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID là bắt buộc']
  },
  serviceName: {
    type: String,
    required: [true, 'Tên dịch vụ là bắt buộc'],
    trim: true,
    maxlength: [100, 'Tên dịch vụ không được quá 100 ký tự']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Mô tả không được quá 500 ký tự']
  },
  cost: {
    type: Number,
    required: [true, 'Chi phí là bắt buộc'],
    min: [0, 'Chi phí không được âm']
  },
  currency: {
    type: String,
    default: 'VND',
    enum: ['VND', 'USD', 'EUR']
  },
  billingCycle: {
    type: String,
    required: [true, 'Chu kỳ thanh toán là bắt buộc'],
    enum: ['monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: [true, 'Ngày bắt đầu là bắt buộc']
  },
  nextPaymentDate: {
    type: Date,
    required: [true, 'Ngày thanh toán tiếp theo là bắt buộc']
  },
  reminderDays: {
    type: Number,
    default: 7,
    min: [1, 'Số ngày nhắc nhở phải ít nhất 1'],
    max: [30, 'Số ngày nhắc nhở không được quá 30']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  lastReminderSent: {
    type: Date
  },
  paymentHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['paid', 'pending', 'failed'],
      default: 'pending'
    },
    notes: String
  }],
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index để tối ưu hóa truy vấn
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ nextPaymentDate: 1 });
subscriptionSchema.index({ isActive: 1 });

// Virtual để tính số ngày còn lại đến ngày thanh toán
subscriptionSchema.virtual('daysUntilPayment').get(function() {
  const today = new Date();
  const timeDiff = this.nextPaymentDate.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

// Method để cập nhật ngày thanh toán tiếp theo
subscriptionSchema.methods.updateNextPaymentDate = function() {
  const currentDate = new Date(this.nextPaymentDate);
  
  switch(this.billingCycle) {
    case 'monthly':
      currentDate.setMonth(currentDate.getMonth() + 1);
      break;
    case 'quarterly':
      currentDate.setMonth(currentDate.getMonth() + 3);
      break;
    case 'yearly':
      currentDate.setFullYear(currentDate.getFullYear() + 1);
      break;
  }
  
  this.nextPaymentDate = currentDate;
  return this.save();
};

// Method để kiểm tra có cần gửi reminder không
subscriptionSchema.methods.needsReminder = function() {
  if (!this.isActive) return false;
  
  const today = new Date();
  const timeDiff = this.nextPaymentDate.getTime() - today.getTime();
  const daysUntilPayment = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  // Kiểm tra nếu cần gửi reminder và chưa gửi hôm nay
  if (daysUntilPayment <= this.reminderDays) {
    const lastReminder = this.lastReminderSent;
    if (!lastReminder) return true;
    
    const lastReminderDate = new Date(lastReminder);
    const todayDate = new Date();
    
    // Chỉ gửi 1 lần mỗi ngày
    return lastReminderDate.toDateString() !== todayDate.toDateString();
  }
  
  return false;
};

// Method để đánh dấu đã gửi reminder
subscriptionSchema.methods.markReminderSent = function() {
  this.lastReminderSent = new Date();
  return this.save();
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
