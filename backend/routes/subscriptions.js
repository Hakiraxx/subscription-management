const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Subscription = require('../models/Subscription');
const { authenticateToken } = require('../middleware/auth');
const emailService = require('../services/emailService');

const router = express.Router();

// @route   POST /api/subscriptions/test-email-public  
// @desc    Test email configuration (temporary public endpoint for testing)
// @access  Public
router.post('/test-email-public', async (req, res) => {
  try {
    console.log('🧪 Testing email configuration (public)...');
    
    // Test email configuration
    const testResult = await emailService.testEmailConfiguration();
    
    if (testResult.success) {
      res.json({
        success: true,
        message: 'Email test đã được gửi thành công! Kiểm tra hộp thư của bạn.',
        messageId: testResult.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Không thể gửi email test.',
        error: testResult.error
      });
    }

  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi test email!',
      error: error.message
    });
  }
});

// Tất cả routes đều cần authentication
router.use(authenticateToken);

// Validation rules
const subscriptionValidation = [
  body('serviceName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Tên dịch vụ là bắt buộc và không quá 100 ký tự'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Mô tả không được quá 500 ký tự'),
  body('cost')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Chi phí phải là số và không được âm'),
  body('currency')
    .optional()
    .isIn(['VND', 'USD', 'EUR'])
    .withMessage('Loại tiền tệ không hợp lệ'),
  body('billingCycle')
    .isIn(['monthly', 'quarterly', 'yearly'])
    .withMessage('Chu kỳ thanh toán không hợp lệ'),
  body('startDate')
    .isISO8601()
    .withMessage('Ngày bắt đầu không hợp lệ'),
  body('reminderDays')
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage('Số ngày nhắc nhở phải từ 1-30'),
  body('autoRenew')
    .optional()
    .isBoolean()
    .withMessage('Auto renew phải là true/false')
];

// Helper function để tính ngày thanh toán tiếp theo
const calculateNextPaymentDate = (startDate, billingCycle) => {
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
  }
  
  return date;
};

// @route   GET /api/subscriptions
// @desc    Lấy danh sách tất cả subscriptions của user
// @access  Private
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Trang phải là số nguyên dương'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit phải từ 1-100'),
  query('isActive').optional().isBoolean().withMessage('isActive phải là true/false'),
  query('search').optional().trim()
], async (req, res) => {
  try {
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Tham số không hợp lệ',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { isActive, search } = req.query;

    // Tạo filter query
    const filter = { userId: req.user._id };
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (search) {
      filter.$or = [
        { serviceName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Lấy subscriptions với pagination
    const subscriptions = await Subscription.find(filter)
      .sort({ nextPaymentDate: 1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'fullName email');

    // Đếm tổng số records
    const total = await Subscription.countDocuments(filter);

    // Thêm thông tin virtual fields
    const subscriptionsWithVirtuals = subscriptions.map(sub => {
      const subObj = sub.toObject();
      subObj.daysUntilPayment = sub.daysUntilPayment;
      return subObj;
    });

    res.json({
      message: 'Lấy danh sách thành công!',
      subscriptions: subscriptionsWithVirtuals,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      message: 'Lỗi server khi lấy danh sách subscriptions!'
    });
  }
});

// @route   GET /api/subscriptions/:id
// @desc    Lấy chi tiết một subscription
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('userId', 'fullName email');

    if (!subscription) {
      return res.status(404).json({
        message: 'Không tìm thấy gói đăng ký!'
      });
    }

    const subObj = subscription.toObject();
    subObj.daysUntilPayment = subscription.daysUntilPayment;

    res.json({
      message: 'Lấy thông tin thành công!',
      subscription: subObj
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      message: 'Lỗi server khi lấy thông tin subscription!'
    });
  }
});

// @route   POST /api/subscriptions
// @desc    Tạo subscription mới
// @access  Private
router.post('/', subscriptionValidation, async (req, res) => {
  try {
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const {
      serviceName,
      description,
      cost,
      currency = 'VND',
      billingCycle,
      startDate,
      reminderDays = 7,
      autoRenew = true,
      tags
    } = req.body;

    // Tính ngày thanh toán tiếp theo
    const nextPaymentDate = calculateNextPaymentDate(startDate, billingCycle);

    // Tạo subscription mới
    const subscription = new Subscription({
      userId: req.user._id,
      serviceName,
      description,
      cost,
      currency,
      billingCycle,
      startDate: new Date(startDate),
      nextPaymentDate,
      reminderDays,
      autoRenew,
      tags: tags || []
    });

    await subscription.save();

    // Populate user info và thêm virtual fields
    await subscription.populate('userId', 'fullName email');
    const subObj = subscription.toObject();
    subObj.daysUntilPayment = subscription.daysUntilPayment;

    res.status(201).json({
      message: 'Tạo gói đăng ký thành công!',
      subscription: subObj
    });

  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      message: 'Lỗi server khi tạo subscription!'
    });
  }
});

// @route   PUT /api/subscriptions/:id
// @desc    Cập nhật subscription
// @access  Private
router.put('/:id', subscriptionValidation, async (req, res) => {
  try {
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const subscription = await Subscription.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!subscription) {
      return res.status(404).json({
        message: 'Không tìm thấy gói đăng ký!'
      });
    }

    const {
      serviceName,
      description,
      cost,
      currency,
      billingCycle,
      startDate,
      reminderDays,
      autoRenew,
      tags,
      isActive
    } = req.body;

    // Cập nhật thông tin
    subscription.serviceName = serviceName;
    subscription.description = description || '';
    subscription.cost = cost;
    subscription.currency = currency || 'VND';
    subscription.billingCycle = billingCycle;
    subscription.reminderDays = reminderDays || 7;
    subscription.autoRenew = autoRenew !== undefined ? autoRenew : true;
    subscription.tags = tags || [];
    
    if (isActive !== undefined) {
      subscription.isActive = isActive;
    }

    // Nếu startDate hoặc billingCycle thay đổi, tính lại nextPaymentDate
    if (startDate || billingCycle) {
      const newStartDate = startDate ? new Date(startDate) : subscription.startDate;
      subscription.startDate = newStartDate;
      subscription.nextPaymentDate = calculateNextPaymentDate(newStartDate, billingCycle);
    }

    await subscription.save();

    // Populate user info và thêm virtual fields
    await subscription.populate('userId', 'fullName email');
    const subObj = subscription.toObject();
    subObj.daysUntilPayment = subscription.daysUntilPayment;

    res.json({
      message: 'Cập nhật gói đăng ký thành công!',
      subscription: subObj
    });

  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      message: 'Lỗi server khi cập nhật subscription!'
    });
  }
});

// @route   DELETE /api/subscriptions/:id
// @desc    Xóa subscription
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!subscription) {
      return res.status(404).json({
        message: 'Không tìm thấy gói đăng ký!'
      });
    }

    res.json({
      message: 'Xóa gói đăng ký thành công!'
    });

  } catch (error) {
    console.error('Delete subscription error:', error);
    res.status(500).json({
      message: 'Lỗi server khi xóa subscription!'
    });
  }
});

// @route   POST /api/subscriptions/:id/renew
// @desc    Gia hạn subscription (cập nhật ngày thanh toán tiếp theo)
// @access  Private
router.post('/:id/renew', async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!subscription) {
      return res.status(404).json({
        message: 'Không tìm thấy gói đăng ký!'
      });
    }

    // Cập nhật ngày thanh toán tiếp theo
    await subscription.updateNextPaymentDate();

    // Thêm payment history
    subscription.paymentHistory.push({
      date: new Date(),
      amount: subscription.cost,
      status: 'paid',
      notes: 'Gia hạn thủ công'
    });

    await subscription.save();

    // Populate user info và thêm virtual fields
    await subscription.populate('userId', 'fullName email');
    const subObj = subscription.toObject();
    subObj.daysUntilPayment = subscription.daysUntilPayment;

    res.json({
      message: 'Gia hạn gói đăng ký thành công!',
      subscription: subObj
    });

  } catch (error) {
    console.error('Renew subscription error:', error);
    res.status(500).json({
      message: 'Lỗi server khi gia hạn subscription!'
    });
  }
});

// @route   GET /api/subscriptions/stats/dashboard
// @desc    Lấy thống kê cho dashboard
// @access  Private
router.get('/stats/dashboard', async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    // Thống kê tổng quan
    const [
      totalActive,
      totalInactive,
      upcomingPayments,
      monthlyTotal
    ] = await Promise.all([
      Subscription.countDocuments({ userId, isActive: true }),
      Subscription.countDocuments({ userId, isActive: false }),
      Subscription.countDocuments({ 
        userId, 
        isActive: true,
        nextPaymentDate: { $lte: nextWeek }
      }),
      Subscription.aggregate([
        {
          $match: { 
            userId: req.user._id,
            isActive: true 
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$cost' }
          }
        }
      ])
    ]);

    // Lấy danh sách subscription sắp đến hạn
    const upcomingSubscriptions = await Subscription.find({
      userId,
      isActive: true,
      nextPaymentDate: { $lte: nextWeek }
    })
    .sort({ nextPaymentDate: 1 })
    .limit(5)
    .select('serviceName cost nextPaymentDate billingCycle');

    res.json({
      message: 'Lấy thống kê thành công!',
      stats: {
        totalActive,
        totalInactive,
        upcomingPayments,
        monthlyTotal: monthlyTotal[0]?.total || 0,
        upcomingSubscriptions: upcomingSubscriptions.map(sub => ({
          ...sub.toObject(),
          daysUntilPayment: Math.ceil((sub.nextPaymentDate - today) / (1000 * 60 * 60 * 24))
        }))
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      message: 'Lỗi server khi lấy thống kê!'
    });
  }
});

// @route   POST /api/subscriptions/test-email
// @desc    Test email configuration and send test email
// @access  Private
router.post('/test-email', async (req, res) => {
  try {
    console.log('🧪 Testing email configuration...');
    
    // Test email configuration
    const testResult = await emailService.testEmailConfiguration();
    
    if (testResult.success) {
      res.json({
        success: true,
        message: 'Email test đã được gửi thành công! Kiểm tra hộp thư của bạn.',
        messageId: testResult.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Không thể gửi email test.',
        error: testResult.error
      });
    }

  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi test email!',
      error: error.message
    });
  }
});

// @route   POST /api/subscriptions/send-reminder
// @desc    Send payment reminder email for specific subscription
// @access  Private
router.post('/send-reminder/:id', async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('userId', 'fullName email');

    if (!subscription) {
      return res.status(404).json({
        message: 'Không tìm thấy gói đăng ký!'
      });
    }

    // Send reminder email
    const result = await emailService.sendPaymentReminderEmail(
      subscription.userId,
      subscription
    );

    if (result.success) {
      res.json({
        success: true,
        message: `Email nhắc nhở đã được gửi đến ${subscription.userId.email}`,
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Không thể gửi email nhắc nhở.',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Send reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi gửi email nhắc nhở!',
      error: error.message
    });
  }
});

module.exports = router;
