@echo off
REM Script batch para usar SQLite3 fácilmente
REM Uso: sqlite.cmd [database] [query]

setlocal
set SQLITE_EXE=%~dp0sqlite-tools\sqlite3.exe
set DATABASE=%~dp0users.db

if not exist "%SQLITE_EXE%" (
    echo ❌ SQLite3 no encontrado en sqlite-tools/
    exit /b 1
)

if "%~1"=="" (
    echo 🗃️ Abriendo base de datos interactiva: users.db
    echo 💡 Comandos útiles:
    echo   .tables          # Listar tablas
    echo   .schema          # Ver esquema completo  
    echo   .schema users    # Ver esquema de tabla específica
    echo   .quit            # Salir
    echo.
    "%SQLITE_EXE%" "%DATABASE%"
) else if "%~1"=="tables" (
    echo 📋 Tablas en la base de datos:
    "%SQLITE_EXE%" "%DATABASE%" ".tables"
) else if "%~1"=="schema" (
    if not "%~2"=="" (
        echo 📋 Esquema de la tabla %~2:
        "%SQLITE_EXE%" "%DATABASE%" ".schema %~2"
    ) else (
        echo 📋 Esquema completo:
        "%SQLITE_EXE%" "%DATABASE%" ".schema"
    )
) else if "%~1"=="count" (
    echo 🔢 Contando usuarios:
    "%SQLITE_EXE%" "%DATABASE%" "SELECT COUNT(*) as total_users FROM users;"
) else if "%~1"=="users" (
    echo 👥 Últimos 10 usuarios:
    "%SQLITE_EXE%" "%DATABASE%" "SELECT id, name, email, role, email_verified, created_at FROM users ORDER BY id DESC LIMIT 10;"
) else (
    REM Si es una query personalizada
    echo 🔍 Ejecutando: %*
    "%SQLITE_EXE%" "%DATABASE%" "%*"
)

endlocal