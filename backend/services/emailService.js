const nodemailer = require('nodemailer');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

class EmailService {
  constructor() {
    // Tạo transporter cho email
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Verify connection configuration - Tạm thời comment để test
    /*
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email configuration error:', error);
      } else {
        console.log('✅ Email server is ready to take our messages');
      }
    });
    */
    console.log('📧 Email service được khởi tạo (test mode)');
  }

  // Template email nhắc nhở thanh toán
  generateReminderEmailHtml(user, subscription) {
    const daysUntilPayment = subscription.daysUntilPayment;
    const isOverdue = daysUntilPayment < 0;
    const statusText = isOverdue ? 'QUÁ HẠN' : `CÒN ${daysUntilPayment} NGÀY`;
    const statusColor = isOverdue ? '#dc2626' : (daysUntilPayment <= 3 ? '#ea580c' : '#059669');
    
    const formatCurrency = (amount, currency) => {
      switch(currency) {
        case 'VND':
          return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
          }).format(amount);
        case 'USD':
          return new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD' 
          }).format(amount);
        case 'EUR':
          return new Intl.NumberFormat('de-DE', { 
            style: 'currency', 
            currency: 'EUR' 
          }).format(amount);
        default:
          return `${amount} ${currency}`;
      }
    };

    const formatDate = (date) => {
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(new Date(date));
    };

    const getBillingCycleText = (cycle) => {
      switch(cycle) {
        case 'monthly': return 'Hàng tháng';
        case 'quarterly': return 'Hàng quý';
        case 'yearly': return 'Hàng năm';
        default: return cycle;
      }
    };

    return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nhắc nhở thanh toán gói đăng ký</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 30px 20px;
        }
        .alert-box {
            background-color: ${isOverdue ? '#fef2f2' : '#f0f9ff'};
            border-left: 4px solid ${statusColor};
            padding: 20px;
            margin-bottom: 25px;
            border-radius: 0 8px 8px 0;
        }
        .alert-box h2 {
            margin: 0 0 10px 0;
            color: ${statusColor};
            font-size: 20px;
            font-weight: 600;
        }
        .status-badge {
            display: inline-block;
            background-color: ${statusColor};
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
            margin-top: 10px;
        }
        .subscription-details {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-weight: 600;
            color: #374151;
            font-size: 14px;
        }
        .detail-value {
            color: #1f2937;
            font-weight: 500;
            text-align: right;
        }
        .cost-highlight {
            font-size: 24px;
            font-weight: 700;
            color: ${statusColor};
        }
        .action-section {
            text-align: center;
            margin: 30px 0;
        }
        .btn {
            display: inline-block;
            padding: 14px 28px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        .footer {
            background-color: #f1f5f9;
            padding: 25px 20px;
            text-align: center;
            color: #64748b;
            font-size: 14px;
        }
        .footer p {
            margin: 5px 0;
        }
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 8px;
            }
            .content {
                padding: 20px 15px;
            }
            .detail-row {
                flex-direction: column;
                align-items: flex-start;
                gap: 5px;
            }
            .detail-value {
                text-align: left;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 Nhắc nhở thanh toán</h1>
            <p>Quản lý gói đăng ký của bạn</p>
        </div>
        
        <div class="content">
            <div class="alert-box">
                <h2>${isOverdue ? '⚠️ Gói đăng ký đã quá hạn!' : '⏰ Gói đăng ký sắp đến hạn!'}</h2>
                <p>Xin chào <strong>${user.fullName}</strong>,</p>
                <p>${isOverdue ? 
                  'Gói đăng ký của bạn đã quá hạn thanh toán. Vui lòng thanh toán ngay để tiếp tục sử dụng dịch vụ.' :
                  'Chúng tôi xin nhắc nhở bạn về việc gia hạn gói đăng ký sắp đến hạn.'
                }</p>
                <div class="status-badge">${statusText}</div>
            </div>

            <div class="subscription-details">
                <div class="detail-row">
                    <span class="detail-label">📦 Tên dịch vụ:</span>
                    <span class="detail-value"><strong>${subscription.serviceName}</strong></span>
                </div>
                ${subscription.description ? `
                <div class="detail-row">
                    <span class="detail-label">📝 Mô tả:</span>
                    <span class="detail-value">${subscription.description}</span>
                </div>
                ` : ''}
                <div class="detail-row">
                    <span class="detail-label">💰 Chi phí:</span>
                    <span class="detail-value cost-highlight">${formatCurrency(subscription.cost, subscription.currency)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">🔄 Chu kỳ:</span>
                    <span class="detail-value">${getBillingCycleText(subscription.billingCycle)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">📅 Ngày thanh toán:</span>
                    <span class="detail-value"><strong>${formatDate(subscription.nextPaymentDate)}</strong></span>
                </div>
            </div>

            <div class="action-section">
                <p style="margin-bottom: 20px; color: #64748b;">
                    Vui lòng đăng nhập vào hệ thống để cập nhật trạng thái thanh toán:
                </p>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="btn">
                    🚀 Đăng nhập ngay
                </a>
            </div>
        </div>

        <div class="footer">
            <p><strong>Hệ thống Quản lý Đăng ký</strong></p>
            <p>Email này được gửi tự động. Vui lòng không trả lời email này.</p>
            <p>Nếu bạn có thắc mắc, vui lòng liên hệ với chúng tôi.</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  // Gửi email nhắc nhở
  async sendReminderEmail(user, subscription) {
    try {
      const subject = subscription.daysUntilPayment < 0 
        ? `⚠️ [QUÁ HẠN] ${subscription.serviceName} - Cần thanh toán ngay`
        : `🔔 [NHẮC NHỞ] ${subscription.serviceName} - Còn ${subscription.daysUntilPayment} ngày`;

      const mailOptions = {
        from: {
          name: 'Hệ thống Quản lý Đăng ký',
          address: process.env.EMAIL_USER
        },
        to: user.email,
        subject: subject,
        html: this.generateReminderEmailHtml(user, subscription),
        // Text fallback
        text: `
Xin chào ${user.fullName},

${subscription.daysUntilPayment < 0 ? 
  'Gói đăng ký của bạn đã quá hạn thanh toán!' :
  `Gói đăng ký "${subscription.serviceName}" sẽ đến hạn trong ${subscription.daysUntilPayment} ngày.`
}

Chi tiết:
- Tên dịch vụ: ${subscription.serviceName}
- Chi phí: ${subscription.cost} ${subscription.currency}
- Ngày thanh toán: ${new Date(subscription.nextPaymentDate).toLocaleDateString('vi-VN')}

Vui lòng đăng nhập vào hệ thống để cập nhật trạng thái thanh toán.

Trân trọng,
Hệ thống Quản lý Đăng ký
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${user.email}:`, result.messageId);
      
      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error) {
      console.error(`❌ Failed to send email to ${user.email}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Kiểm tra và gửi email nhắc nhở cho tất cả subscriptions cần thiết
  async checkAndSendReminderEmails() {
    try {
      console.log('🔍 Checking for subscriptions that need reminders...');

      // Tìm tất cả subscriptions cần gửi reminder
      const subscriptions = await Subscription.find({ isActive: true })
        .populate('userId', 'fullName email isActive');

      if (!subscriptions.length) {
        console.log('📭 No active subscriptions found');
        return { processed: 0, sent: 0, failed: 0 };
      }

      let processed = 0;
      let sent = 0;
      let failed = 0;

      for (const subscription of subscriptions) {
        processed++;

        // Kiểm tra user còn active không
        if (!subscription.userId || !subscription.userId.isActive) {
          console.log(`⏭️ Skipping inactive user for subscription ${subscription._id}`);
          continue;
        }

        // Kiểm tra có cần gửi reminder không
        if (!subscription.needsReminder()) {
          continue;
        }

        console.log(`📧 Sending reminder for subscription: ${subscription.serviceName} to ${subscription.userId.email}`);

        // Gửi email
        const result = await this.sendReminderEmail(subscription.userId, subscription);

        if (result.success) {
          // Đánh dấu đã gửi reminder
          await subscription.markReminderSent();
          sent++;
          console.log(`✅ Reminder sent successfully for ${subscription.serviceName}`);
        } else {
          failed++;
          console.error(`❌ Failed to send reminder for ${subscription.serviceName}:`, result.error);
        }

        // Delay nhỏ để tránh spam
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const summary = { processed, sent, failed };
      console.log('📊 Email reminder summary:', summary);
      
      return summary;

    } catch (error) {
      console.error('❌ Error in checkAndSendReminderEmails:', error);
      throw error;
    }
  }

  // Test email configuration
  async testEmailConfiguration() {
    try {
      const testMailOptions = {
        from: {
          name: 'Hệ thống Quản lý Đăng ký',
          address: process.env.EMAIL_USER
        },
        to: process.env.EMAIL_USER, // Gửi đến chính mình để test
        subject: '🧪 Test Email Configuration',
        html: `
          <h2>✅ Email Configuration Test</h2>
          <p>Nếu bạn nhận được email này, cấu hình email đã hoạt động chính xác!</p>
          <p><small>Sent at: ${new Date().toISOString()}</small></p>
        `,
        text: 'Email configuration test - Success!'
      };

      const result = await this.transporter.sendMail(testMailOptions);
      console.log('✅ Test email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('❌ Test email failed:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
