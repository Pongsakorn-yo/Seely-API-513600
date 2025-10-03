# Start Keycloak Script
# Run Keycloak 25.0.4 on Windows with Java 17

$KEYCLOAK_HOME = ".\keycloak-25.0.4"
$JAVA_HOME = ".\jdk-17"

Write-Host "Starting Keycloak 25.0.4..." -ForegroundColor Green
Write-Host ""

# Check if Keycloak exists
if (-Not (Test-Path $KEYCLOAK_HOME)) {
    Write-Host "Error: Keycloak not found at $KEYCLOAK_HOME" -ForegroundColor Red
    Write-Host "Please make sure Keycloak 25.0.4 is in the project folder" -ForegroundColor Yellow
    exit 1
}

# Check if Java exists
if (-Not (Test-Path $JAVA_HOME)) {
    Write-Host "Error: Java 17 not found at $JAVA_HOME" -ForegroundColor Red
    Write-Host "Please make sure JDK 17 is in the project folder" -ForegroundColor Yellow
    exit 1
}

# Set environment variables
$env:JAVA_HOME = (Resolve-Path $JAVA_HOME).Path
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

Write-Host "Java Home: $env:JAVA_HOME" -ForegroundColor Cyan
Write-Host "Keycloak Home: $KEYCLOAK_HOME" -ForegroundColor Cyan
Write-Host ""

# Navigate to Keycloak directory
Push-Location $KEYCLOAK_HOME

try {
    Write-Host "Starting Keycloak server..." -ForegroundColor Green
    Write-Host "Admin Console: http://localhost:8080" -ForegroundColor Yellow
    Write-Host "Username: admin" -ForegroundColor Yellow
    Write-Host "Password: admin" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
    Write-Host "----------------------------------------" -ForegroundColor Gray
    Write-Host ""

    # Run Keycloak
    & ".\bin\kc.bat" start-dev --http-port=8080
}
finally {
    Pop-Location
}
