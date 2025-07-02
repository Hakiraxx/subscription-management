@echo off
echo ==========================================
echo     SUBSCRIPTION MANAGEMENT SYSTEM
echo        Cai dat va chay du an
echo ==========================================
echo.

echo [1/4] Cai dat dependencies cho Backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Loi khi cai dat backend dependencies!
    pause
    exit /b 1
)
echo ✅ Backend dependencies da duoc cai dat!
echo.

echo [2/4] Cai dat dependencies cho Frontend...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Loi khi cai dat frontend dependencies!
    pause
    exit /b 1
)
echo ✅ Frontend dependencies da duoc cai dat!
echo.

echo [3/4] Kiem tra file cau hinh...
cd ..\backend
if not exist .env (
    echo ⚠️  File .env khong ton tai trong backend!
    echo Vui long tao file .env voi cau hinh sau:
    echo.
    echo MONGODB_URI=mongodb://localhost:27017/subscription_management
    echo JWT_SECRET=your_super_secret_jwt_key_here
    echo EMAIL_HOST=smtp.gmail.com
    echo EMAIL_PORT=587
    echo EMAIL_USER=your_email@gmail.com
    echo EMAIL_PASS=your_app_password
    echo PORT=5000
    echo NODE_ENV=development
    echo FRONTEND_URL=http://localhost:3000
    echo.
    pause
    exit /b 1
) else (
    echo ✅ File .env da ton tai!
)
echo.

echo [4/4] Du an da san sang!
echo.
echo ==========================================
echo Huong dan chay du an:
echo.
echo 1. Mo terminal 1 va chay Backend:
echo    cd backend
echo    npm run dev
echo.
echo 2. Mo terminal 2 va chay Frontend:
echo    cd frontend  
echo    npm start
echo.
echo 3. Truy cap ung dung tai:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5000
echo ==========================================
echo.
pause
