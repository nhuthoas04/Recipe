# HƯỚNG DẪN TẮT AUTHENTICATION MONGODB

## Cách 1: Dùng mongod.cfg (Recommended)

### Bước 1: Tìm file mongod.cfg
```powershell
# Thường nằm ở:
C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg
# hoặc
C:\Program Files\MongoDB\Server\6.0\bin\mongod.cfg
```

### Bước 2: Mở Notepad as Administrator
```
Click phải Notepad → Run as administrator
```

### Bước 3: Mở file mongod.cfg và tìm dòng
```yaml
security:
  authorization: enabled
```

### Bước 4: Comment hoặc xóa 2 dòng này
```yaml
# security:
#   authorization: enabled
```

### Bước 5: Lưu file và restart MongoDB service
```powershell
# Chạy PowerShell as Administrator
net stop MongoDB
net start MongoDB
```

---

## Cách 2: Tạo user admin (Nếu muốn giữ authentication)

### Bước 1: Kết nối MongoDB shell
```bash
mongosh --port 27017
```

### Bước 2: Tạo admin user
```javascript
use admin

db.createUser({
  user: "admin",
  pwd: "admin123",
  roles: [ { role: "root", db: "admin" } ]
})

exit
```

### Bước 3: Cập nhật .env
```env
MONGODB_URI=mongodb://admin:admin123@localhost:27017/recipe?authSource=admin
```

---

## Cách 3: Restart MongoDB không dùng config file

### Bước 1: Dừng service
```powershell
net stop MongoDB
```

### Bước 2: Chạy mongod trực tiếp
```powershell
cd "C:\Program Files\MongoDB\Server\7.0\bin"
.\mongod.exe --dbpath "C:\data\db" --port 27017
```

---

## Test sau khi fix

### Bước 1: Restart dev server
```bash
# Stop all node processes
Stop-Process -Name node -Force

# Start dev server
pnpm dev
```

### Bước 2: Thử login lại
- Mở http://localhost:3000/login
- Đăng nhập với tài khoản có sẵn

### Bước 3: Kiểm tra logs
Nếu thành công sẽ thấy:
```
✓ Compiled /api/auth/login
POST /api/auth/login 200 in XXXms
```

Nếu vẫn lỗi:
```
MongoServerError: Command find requires authentication
```
→ Quay lại bước 1

---

## Quick Fix Script (PowerShell as Admin)

Lưu script này vào file `fix-mongodb.ps1` và chạy:

```powershell
# Dừng MongoDB
net stop MongoDB

# Backup config
$configPath = "C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg"
if (Test-Path $configPath) {
    Copy-Item $configPath "$configPath.backup"
    
    # Đọc file và comment security
    $content = Get-Content $configPath
    $newContent = $content -replace '^(security:)', '# $1' -replace '^(  authorization:)', '# $1'
    $newContent | Set-Content $configPath
    
    Write-Host "✅ Đã tắt authentication" -ForegroundColor Green
}

# Start MongoDB
net start MongoDB

Write-Host "✅ MongoDB đã restart" -ForegroundColor Green
```

Chạy:
```powershell
# Run PowerShell as Administrator
.\fix-mongodb.ps1
```
