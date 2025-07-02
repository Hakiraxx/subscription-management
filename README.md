# Subscription Management System

A modern web application for managing service subscriptions with automated email payment reminders.

## 🚀 Key Features

### Subscription Management
- ✅ Add, edit, delete subscriptions
- ✅ Track payment dates
- ✅ Renew subscriptions
- ✅ Search and filter subscriptions
- ✅ Detailed statistics

### User System
- ✅ Account registration (Full name, username, email, password)
- ✅ Login with username or email
- ✅ Personal profile management
- ✅ Password change
- ✅ Personal data export

### Automated Email Reminders
- ✅ Send payment reminders before due dates
- ✅ Daily automated email sending
- ✅ Beautiful and professional email templates
- ✅ Flexible reminder timing configuration

### User Interface
- ✅ Modern design with Tailwind CSS
- ✅ Responsive on all devices
- ✅ Intuitive, easy-to-use interface
- ✅ Dark mode support

## 🛠️ Technology Stack

### Backend
- **Node.js** - JavaScript Runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL Database
- **Mongoose** - MongoDB ODM
- **JWT** - User authentication
- **Nodemailer** - Email sending
- **Node-cron** - Automated scheduling
- **Bcrypt** - Password encryption

### Frontend
- **React 18** - UI Library
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **Date-fns** - Date utilities

## 📦 Installation and Setup

### System Requirements
- Node.js >= 16.0.0
- MongoDB >= 4.4
- npm or yarn

### 1. Clone Project
\`\`\`bash
git clone <repository-url>
cd quanlydangky
\`\`\`

### 2. Backend Setup

\`\`\`bash
cd backend
npm install
\`\`\`

#### Configure environment variables
Create \`.env\` file in \`backend\` directory:

\`\`\`env
# Database
MONGODB_URI=mongodb://localhost:27017/subscription_management

# JWT Secret (change in production)
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000
\`\`\`

#### Run backend
\`\`\`bash
# Development
npm run dev

# Production
npm start
\`\`\`

### 3. Frontend Setup

\`\`\`bash
cd ../frontend
npm install
\`\`\`

#### Configure environment variables (optional)
Create \`.env\` file in \`frontend\` directory:

\`\`\`env
REACT_APP_API_URL=http://localhost:5000/api
\`\`\`

#### Run frontend
\`\`\`bash
npm start
\`\`\`

### 4. Quick Start with batch scripts (Windows)

#### Start production:
```bash
# Run from project root directory
./run.bat
```

#### Start development mode:
```bash
# With nodemon for backend and hot reload for frontend
./run-dev.bat
```

#### Stop all services:
```bash
# Stop all Node.js processes of the project
./stop.bat
```

Scripts will automatically:
- Check Node.js and MongoDB
- Install dependencies (if needed)
- Start Backend on port 5000
- Start Frontend on port 3000  
- Open separate terminals for each service

### 5. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## 📧 Email Configuration

### Using Gmail
1. Enable 2-step verification for Gmail account
2. Create App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Create password for "Mail"
3. Use App Password as \`EMAIL_PASS\`

### Using Other SMTP
Change configuration in \`.env\`:
\`\`\`env
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your_email@domain.com
EMAIL_PASS=your_password
\`\`\`

## 🗂️ Project Structure

\`\`\`
quanlydangky/
├── backend/
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   ├── services/         # Business logic
│   ├── server.js         # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API services
│   │   ├── context/      # React context
│   │   ├── utils/        # Utility functions
│   │   └── App.js
│   └── package.json
└── README.md
\`\`\`

## 🔧 API Endpoints

### Authentication
- \`POST /api/auth/register\` - Register
- \`POST /api/auth/login\` - Login
- \`GET /api/auth/profile\` - Get user info

### Subscriptions
- \`GET /api/subscriptions\` - Get list
- \`POST /api/subscriptions\` - Create new
- \`PUT /api/subscriptions/:id\` - Update
- \`DELETE /api/subscriptions/:id\` - Delete
- \`POST /api/subscriptions/:id/renew\` - Renew

### Users
- \`GET /api/users/profile\` - Detailed info
- \`PUT /api/users/profile\` - Update info
- \`PUT /api/users/change-password\` - Change password

## 🎨 Screenshots

(Add screenshots when completed)

## 🚀 Deployment

### Backend (Railway, Heroku, VPS)
1. Set environment variables
2. Ensure MongoDB connection
3. Deploy code

### Frontend (Vercel, Netlify)
1. Build project: \`npm run build\`
2. Deploy build folder
3. Configure environment variables

## 🤝 Contributing

1. Fork the project
2. Create feature branch: \`git checkout -b feature/AmazingFeature\`
3. Commit changes: \`git commit -m 'Add some AmazingFeature'\`
4. Push to branch: \`git push origin feature/AmazingFeature\`
5. Create Pull Request
## 📞 Contact
- Author: Hakiraxx
## 📝 License
Distributed under the MIT License. See \`LICENSE\` for more information.
# subscription-management
