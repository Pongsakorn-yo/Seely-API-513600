# ทดสอบ Keycloak 25.0.4 Authentication
# ต้อง start Keycloak ก่อนใช้งาน

Write-Host "`n=== ทดสอบ Keycloak 25.0.4 Authentication ===" -ForegroundColor Green
Write-Host ""

# ตรวจสอบว่า Keycloak ทำงานอยู่ไหม
Write-Host "1. ตรวจสอบ Keycloak Server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -UseBasicParsing -TimeoutSec 5
    Write-Host "   ✓ Keycloak ทำงานอยู่ (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Keycloak ไม่ทำงาน!" -ForegroundColor Red
    Write-Host ""
    Write-Host "กรุณา start Keycloak ก่อน:" -ForegroundColor Yellow
    Write-Host "  1. เปิด PowerShell window ใหม่" -ForegroundColor White
    Write-Host "  2. cd C:\Users\Paahod\Downloads\Seely-API-513600" -ForegroundColor White
    Write-Host "  3. .\start-keycloak.bat" -ForegroundColor Cyan
    Write-Host "  4. รอจนเห็น 'Listening on: http://0.0.0.0:8080'" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""

# ทดสอบ Password Credentials Grant
Write-Host "2. ทดสอบ Password Credentials Grant..." -ForegroundColor Yellow

$clientSecret = "OQ8zcRHp9j7nkCVZIn0YCpt23f97cYjK"
$body = @{
    grant_type = "password"
    client_id = "api-client"
    client_secret = $clientSecret
    username = "testuser"
    password = "Test@123"
}

Write-Host "   Realm: seely-api" -ForegroundColor Cyan
Write-Host "   Client ID: api-client" -ForegroundColor Cyan
Write-Host "   Username: testuser" -ForegroundColor Cyan
Write-Host ""

try {
    $tokenResponse = Invoke-RestMethod -Uri "http://localhost:8080/realms/seely-api/protocol/openid-connect/token" `
        -Method Post `
        -ContentType "application/x-www-form-urlencoded" `
        -Body $body
    
    Write-Host "   ✓ สำเร็จ! ได้ Access Token แล้ว!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access Token (first 100 chars):" -ForegroundColor Cyan
    Write-Host $tokenResponse.access_token.Substring(0, [Math]::Min(100, $tokenResponse.access_token.Length))
    Write-Host "..."
    Write-Host ""
    Write-Host "Token Type: $($tokenResponse.token_type)" -ForegroundColor Cyan
    Write-Host "Expires In: $($tokenResponse.expires_in) seconds" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🎉 Keycloak 25.0.4 + Java 17 ทำงานได้ถูกต้อง!" -ForegroundColor Green
    Write-Host "   ปัญหา 'invalid_grant' หายไปแล้ว!" -ForegroundColor Green
    
} catch {
    Write-Host "   ✗ เกิดข้อผิดพลาด!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message
    Write-Host ""
    
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response:" -ForegroundColor Yellow
            Write-Host $responseBody
        } catch {}
    }
    
    Write-Host ""
    Write-Host "ตรวจสอบ:" -ForegroundColor Yellow
    Write-Host "  1. Realm 'seely-api' สร้างแล้วหรือยัง?" -ForegroundColor White
    Write-Host "  2. Client 'api-client' สร้างแล้วหรือยัง?" -ForegroundColor White
    Write-Host "  3. Client Secret ถูกต้องหรือไม่?" -ForegroundColor White
    Write-Host "  4. User 'testuser' สร้างแล้วหรือยัง?" -ForegroundColor White
    Write-Host "  5. Password 'Test@123' ตั้งค่าถูกต้องหรือไม่?" -ForegroundColor White
    Write-Host "  6. Direct access grants เปิดหรือยัง?" -ForegroundColor White
}

Write-Host ""
