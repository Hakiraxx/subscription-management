# 📧 Email Configuration Guide

## Tổng quan
Hệ thống hỗ trợ gửi email nhắc nhở thanh toán tự động và email test. Để sử dụng tính năng này, bạn cần cấu hình email SMTP.

## 🚀 Các tính năng Email

### 1. **Test Email** 
- Kiểm tra cấu hình email SMTP
- Gửi email test để xác thực hoạt động
- Truy cập: Dashboard → Nút "Test Email"

### 2. **Email nhắc nhở thanh toán**
- Tự động gửi khi có gói đăng ký sắp hết hạn
- Gửi thủ công: Dashboard → Nút "Nhắc nhở" trên subscription card
- Template email đẹp với thông tin chi tiết

### 3. **Chạy batch email**
- Server tự động kiểm tra và gửi email mỗi ngày
- Có thể gọi endpoint `/api/subscriptions/batch-emails` để chạy thủ công

## ⚙️ Cấu hình Email

### Bước 1: Cập nhật file `.env`
```bash
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Bước 2: Tạo App Password cho Gmail

1. **Bật 2-Factor Authentication:**
   - Vào [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → Enable

2. **Tạo App Password:**
   - Vào [App Passwords](https://myaccount.google.com/apppasswords)
   - Select app: "Mail"
   - Select device: "Other (Custom name)" → "Subscription Manager"
   - Copy password được tạo

3. **Cập nhật .env:**
   ```bash
   EMAIL_PASS=generated-app-password
   ```

### Bước 3: Test cấu hình
1. Restart server backend
2. Vào Dashboard
3. Click nút "Test Email"
4. Kiểm tra email inbox

## 🔧 Cấu hình Email khác

### Outlook/Hotmail
```bash
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

### Yahoo Mail
```bash
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

### Custom SMTP
```bash
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587  # hoặc 465 cho SSL
EMAIL_USER=your-username
EMAIL_PASS=your-password
```

## 🧪 Testing

### API Endpoints cho test
```bash
# Test email configuration
POST /api/subscriptions/test-email
Authorization: Bearer <token>

# Send reminder for specific subscription
POST /api/subscriptions/send-reminder/:id
Authorization: Bearer <token>

# Batch check and send reminders
POST /api/subscriptions/batch-emails
Authorization: Bearer <token>
```

### Test trong Dashboard
1. **Test Email button:** Kiểm tra cấu hình SMTP
2. **Nhắc nhở button:** Gửi email nhắc nhở cho subscription cụ thể
3. **Notifications:** Hiển thị kết quả gửi email

## 🚨 Troubleshooting

### Lỗi thường gặp:

**1. Authentication failed**
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```
**Giải pháp:** Sử dụng App Password thay vì password thường

**2. Connection timeout**
```
Error: Connection timeout
```
**Giải pháp:** Kiểm tra firewall, PORT, và internet connection

**3. Self-signed certificate**
```
Error: self signed certificate in certificate chain
```
**Giải pháp:** Thêm vào cấu hình:
```javascript
// trong emailService.js
secure: false,
tls: {
  rejectUnauthorized: false
}
```

### Debug steps:
1. Kiểm tra .env file có được load không
2. Test với email khác
3. Kiểm tra server logs
4. Sử dụng Test Email button để debug

## 📝 Email Templates

### 1. Test Email
- Subject: "🧪 Test Email Configuration"
- Nội dung: Xác nhận cấu hình email hoạt động

### 2. Payment Reminder
- Subject: "💳 Nhắc nhở thanh toán - [Service Name]"
- Nội dung: Chi tiết subscription, ngày hết hạn, số tiền
- Design: HTML template responsive

### 3. Overdue Payment
- Subject: "⚠️ Thanh toán quá hạn - [Service Name]"
- Màu đỏ, urgent tone

## 🔒 Security

### Best Practices:
1. **Sử dụng App Password:** Không bao giờ dùng password thường
2. **Environment Variables:** Không commit .env file
3. **HTTPS:** Luôn sử dụng SSL/TLS
4. **Rate Limiting:** Giới hạn số email gửi/phút

### .env.example
```bash
# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
```

## 📊 Monitoring

### Logs để theo dõi:
- Email sent successfully: `✅ Email sent to user@email.com`
- Email failed: `❌ Failed to send email: error details`
- Batch run: `📧 Batch email check completed: X emails sent`

### Metrics quan trọng:
- Email delivery rate
- Email open rate (nếu có tracking)
- Failed email attempts
- Response time

---

💡 **Tip:** Bắt đầu với Gmail App Password để test, sau đó chuyển sang SMTP provider chuyên nghiệp như SendGrid, Mailgun cho production.
