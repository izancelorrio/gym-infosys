@echo off
echo ========================================
echo    Iniciando aplicacion Gym Landing
echo ========================================

echo.
echo [1/4] Instalando dependencias de Node.js...
call npm install
if %errorlevel% neq 0 (
    echo Error: Fallo al instalar dependencias de Node.js
    pause
    exit /b 1
)

echo.
echo [2/4] Esperando 3 segundos...
timeout /t 3 /nobreak >nul

echo.
echo [3/4] Iniciando servidor Next.js en segundo plano...
start "Next.js Server" cmd /k "npm run dev"

echo.
echo [4/4] Esperando 5 segundos antes de iniciar el servidor Python...
timeout /t 5 /nobreak >nul

echo.
echo [4/4] Iniciando servidor Python FastAPI...
echo Servidor disponible en: http://localhost:3000 (Frontend) y http://localhost:8000 (API)
echo.
echo Presiona Ctrl+C para detener los servidores
call python.exe -m uvicorn API.main:app --reload --host 0.0.0.0

echo.
echo Servidores detenidos.
pause