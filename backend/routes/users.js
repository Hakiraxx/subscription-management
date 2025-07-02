const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(authenticateToken);

// @route   GET /api/users/profile
// @desc    Lấy thông tin profile chi tiết
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    const user = req.user;
    
    // Lấy thống kê subscriptions của user
    const [
      totalSubscriptions,
      activeSubscriptions,
      totalMonthlySpend
    ] = await Promise.all([
      Subscription.countDocuments({ userId: user._id }),
      Subscription.countDocuments({ userId: user._id, isActive: true }),
      Subscription.aggregate([
        {
          $match: { 
            userId: user._id,
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

    res.json({
      message: 'Lấy thông tin profile thành công!',
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        isActive: user.isActive
      },
      stats: {
        totalSubscriptions,
        activeSubscriptions,
        totalMonthlySpend: totalMonthlySpend[0]?.total || 0
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      message: 'Lỗi server khi lấy thông tin profile!'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Cập nhật thông tin profile
// @access  Private
router.put('/profile', [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Họ và tên phải có từ 2-100 ký tự'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Email không hợp lệ')
], async (req, res) => {
  try {
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const { fullName, email } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: 'Không tìm thấy user!'
      });
    }

    // Cập nhật fullName nếu có
    if (fullName && fullName !== user.fullName) {
      user.fullName = fullName;
    }

    // Cập nhật email nếu có và chưa được sử dụng
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: user._id }
      });
      
      if (existingEmail) {
        return res.status(400).json({
          message: 'Email đã được sử dụng bởi tài khoản khác!'
        });
      }
      
      user.email = email.toLowerCase();
    }

    await user.save();

    res.json({
      message: 'Cập nhật profile thành công!',
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      message: 'Lỗi server khi cập nhật profile!'
    });
  }
});

// @route   PUT /api/users/change-password
// @desc    Đổi mật khẩu
// @access  Private
router.put('/change-password', [
  body('currentPassword')
    .notEmpty()
    .withMessage('Vui lòng nhập mật khẩu hiện tại'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Xác nhận mật khẩu không khớp');
      }
      return true;
    })
], async (req, res) => {
  try {
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: 'Không tìm thấy user!'
      });
    }

    // Kiểm tra mật khẩu hiện tại
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        message: 'Mật khẩu hiện tại không đúng!'
      });
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Đổi mật khẩu thành công!'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      message: 'Lỗi server khi đổi mật khẩu!'
    });
  }
});

// @route   DELETE /api/users/account
// @desc    Vô hiệu hóa tài khoản (soft delete)
// @access  Private
router.delete('/account', [
  body('password')
    .notEmpty()
    .withMessage('Vui lòng nhập mật khẩu để xác nhận'),
  body('confirmation')
    .equals('DELETE')
    .withMessage('Vui lòng nhập "DELETE" để xác nhận')
], async (req, res) => {
  try {
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const { password } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: 'Không tìm thấy user!'
      });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: 'Mật khẩu không đúng!'
      });
    }

    // Vô hiệu hóa tài khoản và tất cả subscriptions
    await Promise.all([
      User.findByIdAndUpdate(user._id, { isActive: false }),
      Subscription.updateMany(
        { userId: user._id },
        { isActive: false }
      )
    ]);

    res.json({
      message: 'Tài khoản đã được vô hiệu hóa thành công!'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      message: 'Lỗi server khi vô hiệu hóa tài khoản!'
    });
  }
});

// @route   GET /api/users/export-data
// @desc    Xuất dữ liệu người dùng (JSON)
// @access  Private
router.get('/export-data', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const subscriptions = await Subscription.find({ userId: req.user._id });

    const exportData = {
      user: user.toJSON(),
      subscriptions: subscriptions.map(sub => sub.toJSON()),
      exportDate: new Date().toISOString(),
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: subscriptions.filter(sub => sub.isActive).length
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="user_data_${user.username}_${Date.now()}.json"`);
    
    res.json(exportData);

  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      message: 'Lỗi server khi xuất dữ liệu!'
    });
  }
});

module.exports = router;
