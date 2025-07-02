@echo off
echo =====================================================
echo   QUAN LY DANG KY - DEVELOPMENT MODE
echo =====================================================
echo.
echo Dang khoi dong he thong o che do phat trien...
echo.

REM Kiem tra Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js khong duoc cai dat!
    echo Vui long cai dat Node.js tu: https://nodejs.org/
    pause
    exit /b 1
)

REM Kiem tra MongoDB
echo [INFO] Kiem tra MongoDB...
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] MongoDB CLI khong duoc tim thay!
    echo Dam bao MongoDB dang chay tren mongodb://localhost:27017
    echo.
)

REM Kiem tra thu muc backend
if not exist "backend\package.json" (
    echo [ERROR] Khong tim thay thu muc backend!
    pause
    exit /b 1
)

REM Kiem tra thu muc frontend  
if not exist "frontend\package.json" (
    echo [ERROR] Khong tim thay thu muc frontend!
    pause
    exit /b 1
)

REM Kiem tra .env backend
if not exist "backend\.env" (
    echo [WARNING] Khong tim thay file backend\.env!
    echo He thong se su dung cau hinh mac dinh.
    echo.
)

echo [INFO] Cai dat dependencies (neu can)...
cd backend
call npm install --silent
cd ..\frontend
call npm install --silent
cd ..

echo [INFO] Dang khoi dong Backend Development Server...
cd backend
start "Backend Dev Server (nodemon)" cmd /k "npm run dev"
cd ..

echo [INFO] Cho 5 giay de backend khoi dong...
timeout /t 5 /nobreak >nul

echo [INFO] Dang khoi dong Frontend Development Server...
cd frontend
start "Frontend Dev Server (React)" cmd /k "npm start"
cd ..

echo.
echo =====================================================
echo   HE THONG DEVELOPMENT DANG CHAY
echo =====================================================
echo.
echo Backend Dev:    http://localhost:5000 (nodemon)
echo Frontend Dev:   http://localhost:3000 (React Hot Reload)
echo Database:       mongodb://localhost:27017/subscription_management
echo.
echo DEVELOPMENT FEATURES:
echo - Auto restart backend khi co thay doi code
echo - Hot reload frontend
echo - Debug mode enabled
echo - Source map enabled
echo.
echo Cac cua so terminal da duoc mo rieng biet.
echo Ban co the dong script nay ma khong anh huong den he thong.
echo.
echo De dung he thong, dong cac cua so terminal tuong ung.
echo.
pause
