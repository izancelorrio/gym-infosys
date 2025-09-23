# Scripts de utilidad para base de datos SQLite
# Usa SQLite3 local en ./sqlite-tools/

# Función para ejecutar sqlite3 con la herramienta local
function Invoke-LocalSqlite {
    param([string]$Database, [string]$Query)
    
    $SqliteExe = Join-Path $PSScriptRoot "sqlite-tools\sqlite3.exe"
    if (Test-Path $SqliteExe) {
        if ($Query) {
            & $SqliteExe $Database $Query
        } else {
            & $SqliteExe $Database
        }
    } else {
        Write-Host "❌ SQLite3 no encontrado en sqlite-tools/" -ForegroundColor Red
        Write-Host "💡 Usando Python como alternativa..." -ForegroundColor Yellow
        Invoke-DbManager @args
    }
}

# Función para ejecutar db_manager.py con el python correcto
function Invoke-DbManager {
    param([string]$Command)
    
    $ApiPath = Join-Path $PSScriptRoot "API"
    $VenvPython = Join-Path $ApiPath "venv\Scripts\python.exe"
    $DbManager = Join-Path $ApiPath "db_manager.py"
    
    if (Test-Path $VenvPython) {
        Push-Location $ApiPath
        & $VenvPython $DbManager @args
        Pop-Location
    } else {
        Write-Host "❌ Entorno virtual no encontrado. Ejecuta .\activate-dev.ps1 primero" -ForegroundColor Red
    }
}

# Función para abrir SQLite3 interactivo
function Open-Database {
    param([string]$DatabasePath = "users.db")
    Write-Host "🗃️ Abriendo base de datos: $DatabasePath" -ForegroundColor Cyan
    Write-Host "💡 Comandos útiles:" -ForegroundColor Yellow
    Write-Host "  .tables          # Listar tablas"
    Write-Host "  .schema          # Ver esquema completo"  
    Write-Host "  .schema users    # Ver esquema de tabla específica"
    Write-Host "  .quit            # Salir"
    Write-Host ""
    
    Invoke-LocalSqlite $DatabasePath
}

# Alias para comandos comunes usando SQLite3 nativo
function Show-DbTables {
    Write-Host "📋 Mostrando tablas de la base de datos..." -ForegroundColor Cyan
    Invoke-LocalSqlite "users.db" ".tables"
}

function Show-DbSchema {
    param([string]$TableName)
    if ($TableName) {
        Write-Host "📋 Mostrando esquema de la tabla '$TableName'..." -ForegroundColor Cyan
        Invoke-LocalSqlite "users.db" ".schema $TableName"
    } else {
        Write-Host "📋 Mostrando esquema completo de la base de datos..." -ForegroundColor Cyan
        Invoke-LocalSqlite "users.db" ".schema"
    }
}

function Show-DbUsers {
    Write-Host "👥 Mostrando usuarios..." -ForegroundColor Cyan
    Invoke-LocalSqlite "users.db" "SELECT id, username, email, created_at FROM users ORDER BY created_at DESC LIMIT 10;"
}

function Count-DbUsers {
    Write-Host "🔢 Contando usuarios..." -ForegroundColor Cyan
    Invoke-LocalSqlite "users.db" "SELECT COUNT(*) as total_users FROM users;"
}

function Show-DbInfo {
    param([string]$TableName = "users")
    Write-Host "📋 Mostrando información de la tabla '$TableName'..." -ForegroundColor Cyan
    Invoke-DbManager "info" $TableName
}

function Backup-Database {
    Write-Host "💾 Creando backup de la base de datos..." -ForegroundColor Cyan
    Invoke-DbManager "backup"
}

function Execute-DbQuery {
    param([string]$Query)
    if (-not $Query) {
        Write-Host "❌ Debes proporcionar una consulta SQL" -ForegroundColor Red
        Write-Host "Ejemplo: Execute-DbQuery 'SELECT COUNT(*) FROM users;'" -ForegroundColor Yellow
        return
    }
    Write-Host "🔍 Ejecutando consulta: $Query" -ForegroundColor Cyan
    Invoke-LocalSqlite "users.db" $Query
}

# Función para ejecutar archivo SQL
function Execute-SqlFile {
    param([string]$SqlFile)
    # Si no es una ruta completa, buscar en sqlite-tools
    if (-not [System.IO.Path]::IsPathRooted($SqlFile)) {
        $SqlFile = Join-Path $PSScriptRoot "sqlite-tools\$SqlFile"
    }
    
    if (-not (Test-Path $SqlFile)) {
        Write-Host "❌ Archivo SQL no encontrado: $SqlFile" -ForegroundColor Red
        return
    }
    Write-Host "📂 Ejecutando archivo SQL: $SqlFile" -ForegroundColor Cyan
    Invoke-LocalSqlite "users.db" ".read $SqlFile"
}

# Mostrar ayuda
function Show-DbHelp {
    Write-Host ""
    Write-Host "🗃️  Utilidades de Base de Datos - Gym InfoSys" -ForegroundColor Green
    Write-Host "===============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔧 Herramientas disponibles:" -ForegroundColor Magenta
    Write-Host "  SQLite3 nativo (./sqlite-tools/sqlite3.exe)" -ForegroundColor Gray
    Write-Host "  Python db_manager.py (backup/fallback)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📋 Comandos disponibles:" -ForegroundColor Cyan
    Write-Host "  Open-Database              # Abrir SQLite3 interactivo"
    Write-Host "  Show-DbTables              # Mostrar todas las tablas"
    Write-Host "  Show-DbSchema [tabla]      # Mostrar esquema"
    Write-Host "  Show-DbUsers               # Mostrar usuarios (últimos 10)"
    Write-Host "  Count-DbUsers              # Contar total de usuarios"
    Write-Host "  Execute-DbQuery 'SQL'      # Ejecutar consulta"
    Write-Host "  Execute-SqlFile file.sql   # Ejecutar archivo SQL desde sqlite-tools"
    Write-Host "  Backup-Database            # Crear backup de la BD"
    Write-Host ""
    Write-Host "📝 Ejemplos:" -ForegroundColor Yellow
    Write-Host "  Open-Database"
    Write-Host "  Show-DbTables"
    Write-Host "  Show-DbSchema users"
    Write-Host "  Execute-DbQuery 'SELECT COUNT(*) FROM users;'"
    Write-Host "  Execute-DbQuery 'SELECT * FROM users WHERE email LIKE \"%gmail%\";'"
    Write-Host ""
    Write-Host "� Comando rápido para explorar:" -ForegroundColor Magenta
    Write-Host "  Open-Database    # Te abre una consola SQLite3 interactiva"
    Write-Host ""
}

# Mostrar ayuda al cargar
Write-Host ""
Write-Host "🗃️ Utilidades de BD cargadas. Usa 'Show-DbHelp' para ver comandos disponibles" -ForegroundColor Green