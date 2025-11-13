@echo off
echo ================================
echo   VERIFICADOR DE BASE DE DATOS
echo ================================
echo.

:: Cambiar al directorio donde está la base de datos
cd /d "%~dp0\.."

:: Verificar que existe users.db
if not exist "users.db" (
    echo ERROR: No se encuentra el archivo users.db
    pause
    exit /b 1
)

echo Verificando estructura de la base de datos...
echo.

echo ============ TABLAS EXISTENTES ============
sqlite3 users.db ".tables"
echo.

echo ============ CONTEO DE REGISTROS ============
echo Usuarios: 
sqlite3 users.db "SELECT COUNT(*) FROM users;"
echo Entrenadores:
sqlite3 users.db "SELECT COUNT(*) FROM trainers;" 2>nul || echo "Tabla trainers no existe"
echo Clientes:
sqlite3 users.db "SELECT COUNT(*) FROM clients;" 2>nul || echo "Tabla clients no existe"
echo Ejercicios:
sqlite3 users.db "SELECT COUNT(*) FROM exercises;" 2>nul || echo "Tabla exercises no existe"
echo Entrenamientos:
sqlite3 users.db "SELECT COUNT(*) FROM workouts;" 2>nul || echo "Tabla workouts no existe"
echo Sesiones completadas:
sqlite3 users.db "SELECT COUNT(*) FROM workout_sessions;" 2>nul || echo "Tabla workout_sessions no existe"
echo Clases grupales:
sqlite3 users.db "SELECT COUNT(*) FROM gym_classes;" 2>nul || echo "Tabla gym_classes no existe"
echo Reservas de clases:
sqlite3 users.db "SELECT COUNT(*) FROM class_bookings;" 2>nul || echo "Tabla class_bookings no existe"
echo Membresías activas:
sqlite3 users.db "SELECT COUNT(*) FROM user_memberships WHERE status='activa';" 2>nul || echo "Tabla user_memberships no existe"
echo.

echo ============ DATOS DE EJEMPLO ============
echo Entrenadores disponibles:
sqlite3 users.db "SELECT u.name, t.specialties FROM users u JOIN trainers t ON u.id = t.user_id;" 2>nul || echo "No hay datos de entrenadores"
echo.
echo Clientes con entrenamientos asignados:
sqlite3 users.db "SELECT u.name, c.fitness_goal FROM users u JOIN clients c ON u.id = c.user_id LIMIT 5;" 2>nul || echo "No hay datos de clientes"
echo.

pause