# ============================================
# ทดสอบ Keycloak Authentication
# ============================================
# Script นี้ใช้สำหรับทดสอบการขอ Access Token จาก Keycloak

Write-Host "🔐 ทดสอบ Keycloak Authentication" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# ตั้งค่า
$keycloakUrl = "http://localhost:8080"
$realm = "seely-api"
$clientId = "seely-api-client"
$clientSecret = "b6tyR4i5kPrkXx2ncoPIynADNDf3CHzP"
$username = "testuser"
$password = "password123"

# URL สำหรับขอ token
$tokenUrl = "$keycloakUrl/realms/$realm/protocol/openid-connect/token"

Write-Host "📍 Keycloak URL: $keycloakUrl" -ForegroundColor Yellow
Write-Host "📍 Realm: $realm" -ForegroundColor Yellow
Write-Host "📍 Client ID: $clientId" -ForegroundColor Yellow
Write-Host "📍 Username: $username" -ForegroundColor Yellow
Write-Host ""

# ขอ Access Token
Write-Host "🚀 กำลังขอ Access Token..." -ForegroundColor Green

try {
    $body = @{
        client_id     = $clientId
        client_secret = $clientSecret
        username      = $username
        password      = $password
        grant_type    = "password"
    }

    $response = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"

    Write-Host "✅ สำเร็จ! ได้รับ Access Token แล้ว" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 ข้อมูล Token:" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "Token Type: $($response.token_type)"
    Write-Host "Expires In: $($response.expires_in) seconds ($([math]::Round($response.expires_in/60, 1)) minutes)"
    Write-Host "Refresh Expires In: $($response.refresh_expires_in) seconds ($([math]::Round($response.refresh_expires_in/60, 1)) minutes)"
    Write-Host ""
    Write-Host "🎫 Access Token (ตัวอย่าง 50 ตัวอักษรแรก):" -ForegroundColor Yellow
    Write-Host $response.access_token.Substring(0, [Math]::Min(50, $response.access_token.Length)) -ForegroundColor White
    Write-Host "..."
    Write-Host ""
    Write-Host "📝 Token เต็ม (คัดลอกไปใช้):" -ForegroundColor Cyan
    Write-Host $response.access_token -ForegroundColor White
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host ""
    Write-Host "💡 วิธีใช้งาน:" -ForegroundColor Cyan
    Write-Host "1. คัดลอก Access Token ด้านบน"
    Write-Host "2. เปิด Postman หรือ Thunder Client"
    Write-Host "3. เพิ่ม Header: Authorization: Bearer YOUR_TOKEN"
    Write-Host "4. ลองเรียก API: http://localhost:3000/api/v1/series"
    Write-Host ""

    # บันทึก token ลงไฟล์
    $tokenFile = "keycloak-token.txt"
    $response.access_token | Out-File -FilePath $tokenFile -Encoding UTF8
    Write-Host "💾 บันทึก token ลงไฟล์: $tokenFile" -ForegroundColor Green
    Write-Host ""

    # แสดง curl command ตัวอย่าง
    Write-Host "🌐 ตัวอย่าง cURL command:" -ForegroundColor Cyan
    Write-Host "curl -H ""Authorization: Bearer $($response.access_token.Substring(0, 20))..."" http://localhost:3000/api/v1/series" -ForegroundColor Gray
    Write-Host ""

} catch {
    Write-Host "❌ เกิดข้อผิดพลาด!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 ตรวจสอบว่า:" -ForegroundColor Yellow
    Write-Host "  1. Keycloak ทำงานอยู่ที่ http://localhost:8080"
    Write-Host "  2. สร้าง Realm 'seely-api' แล้ว"
    Write-Host "  3. สร้าง Client 'seely-api-client' แล้ว"
    Write-Host "  4. สร้าง User 'testuser' แล้ว"
    Write-Host "  5. Client Secret ถูกต้อง"
}

Write-Host ""
Write-Host "กด Enter เพื่อปิด..." -ForegroundColor Gray
Read-Host
