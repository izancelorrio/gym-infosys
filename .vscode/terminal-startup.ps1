# PowerShell profile para VS Code - Gym InfoSys
# Se ejecuta automáticamente cuando se abre un terminal

$projectRoot = Split-Path -Parent $PSScriptRoot
$apiPath = Join-Path $projectRoot "API"
$venvPath = Join-Path $apiPath "venv\Scripts\Activate.ps1"

# Verificar si estamos en el proyecto correcto
if (Test-Path $venvPath) {
    # Cambiar al directorio API
    Set-Location $apiPath
    
    # Activar el entorno virtual
    & $venvPath
    
    # Cargar utilidades de base de datos
    $dbUtilsPath = Join-Path $projectRoot "db-utils.ps1"
    if (Test-Path $dbUtilsPath) {
        . $dbUtilsPath
    }
    
    # Mensaje de bienvenida
    Write-Host ""
    Write-Host "🏋️ " -NoNewline -ForegroundColor Green
    Write-Host "Gym InfoSys - Entorno de desarrollo activado!" -ForegroundColor Green
    Write-Host "📍 Directorio actual: " -NoNewline -ForegroundColor Cyan
    Write-Host "API/" -ForegroundColor White
    Write-Host "🐍 Python: " -NoNewline -ForegroundColor Cyan
    Write-Host "$(& python --version)" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Comandos útiles:" -ForegroundColor Magenta
    Write-Host "  uvicorn main:app --reload     # Iniciar API" -ForegroundColor Gray
    Write-Host "  cd .. && npm run dev          # Iniciar Next.js" -ForegroundColor Gray
    Write-Host "  Show-DbTables                 # Ver tablas BD" -ForegroundColor Gray
    Write-Host "  Show-DbHelp                   # Ayuda BD" -ForegroundColor Gray
    Write-Host ""
}