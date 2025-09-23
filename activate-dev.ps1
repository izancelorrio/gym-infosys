#!/usr/bin/env pwsh

# Script para activar el entorno virtual y preparar el entorno de desarrollo

Write-Host "🏋️  Activando entorno virtual de Gym InfoSys..." -ForegroundColor Green

# Obtener el directorio del script
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Cambiar al directorio de la API
$ApiPath = Join-Path $ScriptDir "API"
Set-Location -Path $ApiPath

# Verificar si existe el entorno virtual
$VenvActivate = Join-Path $ApiPath "venv\Scripts\Activate.ps1"
if (Test-Path $VenvActivate) {
    # Activar el entorno virtual
    & $VenvActivate
    Write-Host "✅ Entorno virtual activado correctamente" -ForegroundColor Green
    
    # Mostrar información del entorno
    Write-Host "📍 Directorio actual: $(Get-Location)" -ForegroundColor Cyan
    
    try {
        $pythonPath = & python -c 'import sys; print(sys.executable)' 2>$null
        Write-Host "🐍 Python ejecutable: $pythonPath" -ForegroundColor Cyan
    } catch {
        Write-Host "� Python: $(& python --version)" -ForegroundColor Cyan
    }
    
    try {
        $pipVersion = & pip --version 2>$null
        Write-Host "📦 Pip: $pipVersion" -ForegroundColor Cyan
    } catch {
        Write-Host "📦 Pip: No disponible" -ForegroundColor Yellow
    }
    
    # Verificar dependencias instaladas
    if (Test-Path "requirements.txt") {
        Write-Host "`n🔍 Verificando dependencias..." -ForegroundColor Yellow
        $requirements = Get-Content "requirements.txt" | Where-Object { $_ -notmatch '^#' -and $_ -ne '' }
        $installedCount = 0
        $totalCount = $requirements.Count
        
        foreach ($req in $requirements) {
            $package = ($req -split '==|>=|<=|>|<')[0].Trim()
            try {
                & pip show $package > $null 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "  ✅ $package" -ForegroundColor Green
                    $installedCount++
                } else {
                    Write-Host "  ❌ $package (no instalado)" -ForegroundColor Red
                }
            } catch {
                Write-Host "  ❌ $package (error al verificar)" -ForegroundColor Red
            }
        }
        
        Write-Host "`n📊 Estado: $installedCount/$totalCount dependencias instaladas" -ForegroundColor $(if ($installedCount -eq $totalCount) { "Green" } else { "Yellow" })
        
        if ($installedCount -ne $totalCount) {
            Write-Host "💡 Para instalar dependencias faltantes: pip install -r requirements.txt" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`n🚀 Comandos disponibles:" -ForegroundColor Magenta
    Write-Host "  uvicorn main:app --reload    - Iniciar servidor FastAPI" -ForegroundColor White
    Write-Host "  cd .. && npm run dev         - Iniciar servidor Next.js" -ForegroundColor White
    Write-Host "  pip install -r requirements.txt - Instalar dependencias" -ForegroundColor White
    Write-Host "  pip list                     - Ver paquetes instalados" -ForegroundColor White
    
} else {
    Write-Host "❌ No se encontró el entorno virtual en .\venv\" -ForegroundColor Red
    Write-Host "`n🔧 Para configurar el entorno virtual:" -ForegroundColor Yellow
    Write-Host "  1. python -m venv venv" -ForegroundColor White
    Write-Host "  2. .\venv\Scripts\Activate.ps1" -ForegroundColor White
    Write-Host "  3. pip install -r requirements.txt" -ForegroundColor White
    
    # Verificar si Python está disponible
    try {
        $pythonVersion = & python --version 2>$null
        Write-Host "`n✅ Python disponible: $pythonVersion" -ForegroundColor Green
    } catch {
        Write-Host "`n❌ Python no encontrado en PATH" -ForegroundColor Red
        Write-Host "   Asegúrate de tener Python instalado y agregado al PATH" -ForegroundColor Yellow
    }
}