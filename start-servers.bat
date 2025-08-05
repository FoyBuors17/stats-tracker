@echo off
echo Starting Stats Management System...
echo.

echo [1/2] Starting Backend Server (Port 3000)...
start "Backend Server" cmd /k "cd backend && npm start"

timeout /t 3 > nul

echo [2/2] Starting Frontend Server (Port 5173)...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Both servers are starting!
echo.
echo 🌐 Frontend: http://localhost:5173
echo 🔧 Backend:  http://localhost:3000
echo 🩺 Health:   http://localhost:3000/health
echo.
echo Press any key to close this window...
pause > nul