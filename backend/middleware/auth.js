const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware để xác thực JWT token
const authenticateToken = async (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: 'Không có token xác thực. Vui lòng đăng nhập!' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Tìm user trong database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Token không hợp lệ. Người dùng không tồn tại!' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Tài khoản đã bị vô hiệu hóa!' 
      });
    }

    // Gắn thông tin user vào request
    req.user = user;
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token không hợp lệ!' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token đã hết hạn. Vui lòng đăng nhập lại!' 
      });
    }
    
    return res.status(500).json({ 
      message: 'Lỗi xác thực token!' 
    });
  }
};

// Middleware để kiểm tra role (có thể mở rộng sau)
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Không có quyền truy cập!' 
      });
    }

    // Hiện tại chưa có role system, có thể mở rộng sau
    // if (!roles.includes(req.user.role)) {
    //   return res.status(403).json({ 
    //     message: 'Không có quyền thực hiện hành động này!' 
    //   });
    // }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole
};
