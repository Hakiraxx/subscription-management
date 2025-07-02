const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Họ và tên phải có từ 2-100 ký tự'),
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Tên người dùng phải có từ 3-30 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email không hợp lệ'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
];

const loginValidation = [
  body('loginField')
    .trim()
    .notEmpty()
    .withMessage('Vui lòng nhập tên người dùng hoặc email'),
  body('password')
    .notEmpty()
    .withMessage('Vui lòng nhập mật khẩu')
];

// Helper function để tạo JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Đăng ký người dùng mới
// @access  Public
router.post('/register', registerValidation, async (req, res) => {
  try {
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const { fullName, username, email, password } = req.body;

    // Kiểm tra username đã tồn tại
    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(400).json({
        message: 'Tên người dùng đã tồn tại!'
      });
    }

    // Kiểm tra email đã tồn tại
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        message: 'Email đã được sử dụng!'
      });
    }

    // Tạo user mới
    const user = new User({
      fullName,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password
    });

    await user.save();

    // Tạo token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Đăng ký thành công!',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      message: 'Lỗi server khi đăng ký!'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Đăng nhập
// @access  Public
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const { loginField, password } = req.body;

    // Tìm user bằng username hoặc email
    const user = await User.findOne({
      $or: [
        { username: loginField.toLowerCase() },
        { email: loginField.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(400).json({
        message: 'Tên người dùng/email hoặc mật khẩu không đúng!'
      });
    }

    // Kiểm tra account active
    if (!user.isActive) {
      return res.status(400).json({
        message: 'Tài khoản đã bị vô hiệu hóa!'
      });
    }

    // Kiểm tra password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: 'Tên người dùng/email hoặc mật khẩu không đúng!'
      });
    }

    // Cập nhật last login
    user.lastLogin = new Date();
    await user.save();

    // Tạo token
    const token = generateToken(user._id);

    res.json({
      message: 'Đăng nhập thành công!',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Lỗi server khi đăng nhập!'
    });
  }
});

// @route   GET /api/auth/profile
// @desc    Lấy thông tin profile người dùng
// @access  Private
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        username: req.user.username,
        email: req.user.email,
        lastLogin: req.user.lastLogin,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      message: 'Lỗi server khi lấy thông tin profile!'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Cập nhật thông tin profile
// @access  Private
router.put('/profile', authenticateToken, [
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
    const user = req.user;

    // Cập nhật fullName nếu có
    if (fullName) {
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
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Lỗi server khi cập nhật profile!'
    });
  }
});

module.exports = router;
