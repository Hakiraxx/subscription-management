@echo off
echo =====================================================
echo   DUNG HE THONG QUAN LY DANG KY
echo =====================================================
echo.
echo Dang dung tat ca cac service...
echo.

echo [INFO] Tim va dung cac Node.js process...

REM Dung cac process Node.js chay tren port 3000 va 5000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo Dung Frontend process (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    echo Dung Backend process (PID: %%a)  
    taskkill /PID %%a /F >nul 2>&1
)

REM Dung cac process Node.js lien quan den du an
wmic process where "name='node.exe' and commandline like '%%subscription%%'" delete >nul 2>&1
wmic process where "name='node.exe' and commandline like '%%quanlydangky%%'" delete >nul 2>&1

echo.
echo [SUCCESS] Da dung tat ca cac service!
echo.
echo Cac port da duoc giai phong:
echo - Port 3000 (Frontend)
echo - Port 5000 (Backend)
echo.
pause
