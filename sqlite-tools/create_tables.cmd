@echo off
echo ================================
echo   CREANDO TABLAS DEL GIMNASIO
echo ================================
echo.

:: Cambiar al directorio donde está la base de datos
cd /d "%~dp0\.."

:: Verificar que existe users.db
if not exist "users.db" (
    echo ERROR: No se encuentra el archivo users.db
    echo Asegurate de que la base de datos existe en la carpeta principal del proyecto
    pause
    exit /b 1
)

echo Ejecutando scripts SQL...
echo.

:: Ejecutar cada script SQL en orden
echo [1/11] Creando tabla trainers...
sqlite3 users.db < sqlite-tools\02_create_trainers.sql
if %errorlevel% neq 0 (
    echo ERROR al ejecutar 02_create_trainers.sql
    pause
    exit /b 1
)

echo [2/11] Creando tabla clients...
sqlite3 users.db < sqlite-tools\03_create_clients.sql
if %errorlevel% neq 0 (
    echo ERROR al ejecutar 03_create_clients.sql
    pause
    exit /b 1
)

echo [3/11] Creando tabla trainer_client_assignments...
sqlite3 users.db < sqlite-tools\04_create_trainer_client_assignments.sql
if %errorlevel% neq 0 (
    echo ERROR al ejecutar 04_create_trainer_client_assignments.sql
    pause
    exit /b 1
)

echo [4/11] Creando tabla exercises...
sqlite3 users.db < sqlite-tools\05_create_exercises.sql
if %errorlevel% neq 0 (
    echo ERROR al ejecutar 05_create_exercises.sql
    pause
    exit /b 1
)

echo [5/11] Creando tabla workouts...
sqlite3 users.db < sqlite-tools\06_create_workouts.sql
if %errorlevel% neq 0 (
    echo ERROR al ejecutar 06_create_workouts.sql
    pause
    exit /b 1
)

echo [6/11] Creando tabla workout_exercises...
sqlite3 users.db < sqlite-tools\07_create_workout_exercises.sql
if %errorlevel% neq 0 (
    echo ERROR al ejecutar 07_create_workout_exercises.sql
    pause
    exit /b 1
)

echo [7/11] Creando tabla workout_sessions...
sqlite3 users.db < sqlite-tools\08_create_workout_sessions.sql
if %errorlevel% neq 0 (
    echo ERROR al ejecutar 08_create_workout_sessions.sql
    pause
    exit /b 1
)

echo [8/11] Creando tabla client_statistics...
sqlite3 users.db < sqlite-tools\09_create_client_statistics.sql
if %errorlevel% neq 0 (
    echo ERROR al ejecutar 09_create_client_statistics.sql
    pause
    exit /b 1
)

echo [9/11] Creando tabla gym_classes...
sqlite3 users.db < sqlite-tools\10_create_gym_classes.sql
if %errorlevel% neq 0 (
    echo ERROR al ejecutar 10_create_gym_classes.sql
    pause
    exit /b 1
)

echo [10/11] Creando tabla class_bookings...
sqlite3 users.db < sqlite-tools\11_create_class_bookings.sql
if %errorlevel% neq 0 (
    echo ERROR al ejecutar 11_create_class_bookings.sql
    pause
    exit /b 1
)

echo [11/11] Creando tabla user_memberships...
sqlite3 users.db < sqlite-tools\12_create_user_memberships.sql
if %errorlevel% neq 0 (
    echo ERROR al ejecutar 12_create_user_memberships.sql
    pause
    exit /b 1
)

echo.
echo ================================
echo   TABLAS CREADAS EXITOSAMENTE
echo ================================
echo.
echo Se han creado las siguientes tablas:
echo - trainers
echo - clients  
echo - trainer_client_assignments
echo - exercises
echo - workouts
echo - workout_exercises
echo - workout_sessions
echo - client_statistics
echo - gym_classes
echo - class_bookings
echo - user_memberships
echo.
echo Para verificar las tablas creadas, puedes ejecutar:
echo sqlite3 users.db ".tables"
echo.
pause