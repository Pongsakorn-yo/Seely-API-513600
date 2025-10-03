# Keycloak Setup Instructions

> **Note**: Keycloak และ JDK ไม่ได้อยู่ใน repository เพื่อลดขนาด  
> ต้องดาวน์โหลดและติดตั้งแยกต่างหาก

## 📥 Download Requirements

### 1. Java JDK 17+
ดาวน์โหลดจาก:
- **Eclipse Temurin JDK 17**: https://adoptium.net/temurin/releases/
- **Oracle JDK 17**: https://www.oracle.com/java/technologies/downloads/

ติดตั้งแล้วตั้งค่า `JAVA_HOME` environment variable

### 2. Keycloak 25.0.4
ดาวน์โหลดจาก:
- **Official**: https://www.keycloak.org/downloads
- **Direct Link**: https://github.com/keycloak/keycloak/releases/download/25.0.4/keycloak-25.0.4.zip

## 🚀 Installation Steps

### Option 1: Manual Installation (Recommended)

1. **Extract Keycloak**
   ```bash
   # Extract keycloak-25.0.4.zip to project root
   Seely-API-513600/
     ├── keycloak-25.0.4/
     └── ...
   ```

2. **Install Java 17**
   - Install JDK 17 on your system
   - Set `JAVA_HOME` environment variable
   - Add `JAVA_HOME/bin` to PATH

3. **Run Keycloak**
   ```powershell
   .\start-keycloak.ps1
   ```

### Option 2: Use System Java

หากติดตั้ง Java 17+ ในระบบแล้ว:

1. แก้ไข `start-keycloak.ps1`:
   ```powershell
   # Comment out JAVA_HOME setting
   # $env:JAVA_HOME = ".\jdk-17"
   
   # Use system Java
   java -version  # Verify Java 17+
   ```

2. รัน Keycloak:
   ```powershell
   cd keycloak-25.0.4
   .\bin\kc.bat start-dev
   ```

### Option 3: Docker (Easiest)

```bash
docker run -d \
  --name keycloak \
  -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:25.0.4 \
  start-dev
```

## 📂 Project Structure

```
Seely-API-513600/
├── src/                      # Source code
├── keycloak-25.0.4/         # Keycloak (not in git)
├── jdk-17/                  # JDK 17 (not in git) - Optional
├── start-keycloak.ps1       # Start script
├── KEYCLOAK_INTEGRATION.md  # Full guide
└── .gitignore               # Excludes keycloak-*/ jdk-*/
```

## ⚙️ Configuration

### 1. Create Realm
1. Access: http://localhost:8080/admin/master/console/
2. Login: admin/admin
3. Create realm: `seely-api`

### 2. Create Client
- Client ID: `seely-api-client`
- Client authentication: ON
- Valid redirect URIs: `http://localhost:3000/*`
- Copy Client Secret to `.env`

### 3. Create User
- Username: `testuser`
- Password: `pass123`
- Email verified: ON

### 4. Update .env
```env
KEYCLOAK_AUTH_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=seely-api
KEYCLOAK_CLIENT_ID=seely-api-client
KEYCLOAK_CLIENT_SECRET=your_client_secret_here
```

## 🔧 Troubleshooting

### Java not found
```bash
# Check Java version
java -version

# Should show: openjdk version "17.x.x" or higher
```

### Keycloak won't start
1. Check port 8080 is free
2. Check Java 17+ is installed
3. Check `keycloak-25.0.4` folder exists

### Can't access Admin Console
1. Wait 10-20 seconds after start
2. Check http://localhost:8080
3. Try http://localhost:8080/admin/master/console/

## 📚 Full Documentation

- [KEYCLOAK_INTEGRATION.md](KEYCLOAK_INTEGRATION.md) - Complete guide
- [KEYCLOAK_TEST_RESULT.md](KEYCLOAK_TEST_RESULT.md) - Test results

## 🆚 Keycloak is Optional!

โปรเจคนี้ทำงานได้ปกติด้วย **JWT authentication** เพียงอย่างเดียว

Keycloak เป็น **Bonus Feature** สำหรับ:
- ✅ SSO (Single Sign-On)
- ✅ OAuth2/OpenID Connect
- ✅ Enterprise user management

**หากไม่ต้องการใช้ Keycloak:**
- ไม่ต้องติดตั้งอะไรเพิ่ม
- ใช้ JWT endpoints ได้เลย (`/api/v1/auth/login`, `/api/v1/auth/register`)
- API ทำงานได้ครบทุกอย่าง

---

**สำคัญ**: ไฟล์ Keycloak และ JDK ไม่ควร commit ลง Git เพราะมีขนาดใหญ่มาก (500MB+)
