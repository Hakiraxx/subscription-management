const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const subscriptionRoutes = require('./routes/subscriptions');
const userRoutes = require('./routes/users');

// Import services
const emailService = require('./services/emailService');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    message: 'Server is running successfully!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Có lỗi xảy ra trên server!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint không tồn tại!' });
});

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('✅ Kết nối MongoDB thành công!');
})
.catch((error) => {
  console.error('❌ Lỗi kết nối MongoDB:', error);
  // Không exit để có thể test các endpoint khác
  console.log('⚠️ Server tiếp tục chạy mà không có database connection');
});

// Cron job để kiểm tra và gửi email nhắc nhở (chạy mỗi ngày lúc 9:00 AM)
cron.schedule('0 9 * * *', async () => {
  console.log('🔔 Đang kiểm tra các gói đăng ký cần nhắc nhở...');
  try {
    await emailService.checkAndSendReminderEmails();
  } catch (error) {
    console.error('❌ Lỗi khi gửi email nhắc nhở:', error);
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại port ${PORT}`);
  console.log(`📧 Email service đã được kích hoạt`);
  console.log(`⏰ Cron job nhắc nhở đã được thiết lập`);
});
