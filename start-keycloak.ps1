# Keycloak Startup Script for PowerShell
Write-Host "Starting Keycloak 25.0.4 Server (Stable Version)..." -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

# Set environment variables
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$env:JAVA_HOME = "$projectRoot\tools\jdk-17"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
$env:KEYCLOAK_ADMIN = "admin"
$env:KEYCLOAK_ADMIN_PASSWORD = "admin"

Write-Host "JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Cyan
Write-Host "Keycloak Version: 25.0.4 (stable)" -ForegroundColor Cyan
Write-Host ""

# Verify Java installation
$javaVersion = & "$env:JAVA_HOME\bin\java.exe" -version 2>&1
Write-Host "Java Version:" -ForegroundColor Cyan
Write-Host $javaVersion
Write-Host ""

# Start Keycloak
Set-Location "$projectRoot\tools\keycloak-25.0.4\bin"
Write-Host "Starting Keycloak in development mode..." -ForegroundColor Yellow
Write-Host "Admin Console will be available at: http://localhost:8080/admin" -ForegroundColor Yellow
Write-Host "Admin credentials: admin / admin" -ForegroundColor Yellow
Write-Host ""

& ".\kc.bat" start-dev
