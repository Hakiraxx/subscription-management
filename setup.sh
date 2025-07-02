#!/bin/bash

echo "=========================================="
echo "     SUBSCRIPTION MANAGEMENT SYSTEM"
echo "        Setup and Installation"
echo "=========================================="
echo

echo "[1/4] Installing Backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error installing backend dependencies!"
    exit 1
fi
echo "✅ Backend dependencies installed!"
echo

echo "[2/4] Installing Frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error installing frontend dependencies!"
    exit 1
fi
echo "✅ Frontend dependencies installed!"
echo

echo "[3/4] Checking configuration files..."
cd ../backend
if [ ! -f .env ]; then
    echo "⚠️  .env file not found in backend!"
    echo "Please create .env file with the following configuration:"
    echo
    echo "MONGODB_URI=mongodb://localhost:27017/subscription_management"
    echo "JWT_SECRET=your_super_secret_jwt_key_here"
    echo "EMAIL_HOST=smtp.gmail.com"
    echo "EMAIL_PORT=587"
    echo "EMAIL_USER=your_email@gmail.com"
    echo "EMAIL_PASS=your_app_password"
    echo "PORT=5000"
    echo "NODE_ENV=development"
    echo "FRONTEND_URL=http://localhost:3000"
    echo
    exit 1
else
    echo "✅ .env file exists!"
fi
echo

echo "[4/4] Project is ready!"
echo
echo "=========================================="
echo "How to run the project:"
echo
echo "1. Open terminal 1 and run Backend:"
echo "   cd backend"
echo "   npm run dev"
echo
echo "2. Open terminal 2 and run Frontend:"
echo "   cd frontend"
echo "   npm start"
echo
echo "3. Access the application at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo "=========================================="
echo
