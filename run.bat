@echo off
echo =====================================================
echo   QUAN LY DANG KY - SUBSCRIPTION MANAGEMENT SYSTEM
echo =====================================================
echo.
echo Dang khoi dong he thong...
echo.

REM Kiem tra Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js khong duoc cai dat!
    echo Vui long cai dat Node.js tu: https://nodejs.org/
    pause
    exit /b 1
)

REM Kiem tra thu muc backend
if not exist "backend\package.json" (
    echo [ERROR] Khong tim thay thu muc backend!
    echo Vui long chay script nay tu thu muc goc cua du an.
    pause
    exit /b 1
)

REM Kiem tra thu muc frontend
if not exist "frontend\package.json" (
    echo [ERROR] Khong tim thay thu muc frontend!
    echo Vui long chay script nay tu thu muc goc cua du an.
    pause
    exit /b 1
)

echo [INFO] Dang khoi dong Backend (Port 5000)...
cd backend
start "Backend Server" cmd /k "npm start"
cd ..

echo [INFO] Cho 3 giay de backend khoi dong...
timeout /t 3 /nobreak >nul

echo [INFO] Dang khoi dong Frontend (Port 3000)...
cd frontend
start "Frontend App" cmd /k "npm start"
cd ..

echo.
echo =====================================================
echo   HE THONG DANG KHOI DONG
echo =====================================================
echo.
echo Backend Server: http://localhost:5000
echo Frontend App:   http://localhost:3000
echo.
echo Cac cua so terminal da duoc mo rieng biet.
echo Ban co the dong script nay ma khong anh huong den he thong.
echo.
echo De dung he thong, dong cac cua so terminal tuong ung.
echo.
pause
