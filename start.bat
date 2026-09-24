@echo off
echo Starting CyberXDelta Backend (FastAPI on Port 8000)...
start "CyberXDelta Backend" cmd /k "cd backend && npm run dev"

echo Starting CyberXDelta Frontend (Vite on Port 5173)...
start "CyberXDelta Frontend" cmd /k "cd frontend && npm run dev"

echo Both servers are launching in separate windows!
echo Backend API: http://127.0.0.1:8000/docs
echo Frontend App: http://localhost:5173
