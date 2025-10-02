@echo off
echo Starting Keycloak 25.0.4 Server (Stable Version)...
echo ====================================

set JAVA_HOME=%~dp0tools\jdk-17
set PATH=%JAVA_HOME%\bin;%PATH%
set KEYCLOAK_ADMIN=admin
set KEYCLOAK_ADMIN_PASSWORD=admin

echo JAVA_HOME: %JAVA_HOME%
echo Keycloak Version: 25.0.4 (stable)
echo.

cd /d %~dp0tools\keycloak-25.0.4\bin
echo Starting Keycloak in development mode...
echo Admin Console will be available at: http://localhost:8080/admin
echo Admin credentials: admin / admin
echo.

call kc.bat start-dev
