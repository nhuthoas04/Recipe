# Admin & User Roles - Hướng dẫn

## 🔐 Hệ thống phân quyền

### Roles
- **`user`** - Người dùng thường
  - Đăng món ăn (cần admin duyệt)
  - Quản lý thực đơn cá nhân
  - Tạo danh sách mua sắm

- **`admin`** - Quản trị viên
  - Tất cả quyền của user
  - Duyệt món ăn
  - Quản lý users (thay đổi role, khóa tài khoản)
  - Xem thống kê hệ thống

---

## 🎯 Tự động tạo Admin

### User đầu tiên = Admin
**Khi đăng ký tài khoản đầu tiên**, hệ thống tự động gán role `admin`.

```typescript
// Trong register API
const userCount = await usersCollection.countDocuments()
const role = userCount === 0 ? 'admin' : 'user'
```

**Ví dụ:**
1. Database trống (0 users)
2. Bạn đăng ký: `admin@recipe.com`
3. Tự động nhận role: `admin` 🔑
4. Các user sau sẽ là: `user`

---

## 📋 Cách sử dụng

### 1. Tạo Admin (Lần đầu)
```bash
# Đảm bảo database trống
# Đăng ký tài khoản đầu tiên
POST /api/auth/register
{
  "email": "admin@recipe.com",
  "password": "admin123",
  "name": "admin"
}

Response:
{
  "success": true,
  "user": {
    "id": "...",
    "email": "admin@recipe.com",
    "name": "admin",
    "role": "admin"  👈 Tự động là admin!
  }
}
```

### 2. Đăng nhập
```bash
POST /api/auth/login
{
  "email": "admin@recipe.com",
  "password": "admin123"
}

Response:
{
  "success": true,
  "user": {
    "role": "admin"  👈 Token có chứa role
  },
  "token": "eyJhbGciOiJIUzI1..."
}
```

### 3. Kiểm tra role (Client-side)
```typescript
// Decode token để lấy role
import jwt_decode from 'jwt-decode'

const token = localStorage.getItem('token')
const decoded = jwt_decode(token)

if (decoded.role === 'admin') {
  // Show admin menu
}
```

---

## 🛠️ Admin APIs

### Lấy danh sách users
```bash
GET /api/admin/users
Authorization: Bearer {token}

Response:
{
  "success": true,
  "users": [
    {
      "id": "...",
      "email": "admin@recipe.com",
      "name": "Admin",
      "role": "admin",
      "isActive": true,
      "createdAt": "2025-10-31T00:00:00Z",
      "lastLogin": "2025-10-31T10:00:00Z"
    },
    {
      "id": "...",
      "email": "user@recipe.com",
      "name": "User",
      "role": "user",
      "isActive": true
    }
  ],
  "total": 2
}
```

### Thay đổi role user
```bash
PATCH /api/admin/users
Authorization: Bearer {admin-token}
{
  "userId": "507f1f77bcf86cd799439011",
  "role": "admin"  # hoặc "user"
}

Response:
{
  "success": true,
  "message": "Cập nhật thành công"
}
```

### Khóa/Mở khóa user
```bash
PATCH /api/admin/users
Authorization: Bearer {admin-token}
{
  "userId": "507f1f77bcf86cd799439011",
  "isActive": false  # false = khóa, true = mở
}
```

---

## 🔒 Bảo vệ Routes

### Backend (API Routes)
```typescript
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  // Kiểm tra admin
  const adminCheck = requireAdmin(request)
  if (adminCheck) return adminCheck
  
  // Code cho admin...
}
```

### Client-side (Pages)
```typescript
// app/admin/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Kiểm tra role từ token
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    
    const decoded = jwt_decode(token)
    if (decoded.role !== 'admin') {
      router.push('/')
    }
  }, [])
  
  return <div>Admin Dashboard</div>
}
```

---

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId("..."),
  email: "admin@recipe.com",
  password: "$2a$10$...", // hashed
  name: "Admin",
  role: "admin", // 👈 "user" | "admin"
  isActive: true,
  createdAt: ISODate("2025-10-31T00:00:00Z"),
  lastLogin: ISODate("2025-10-31T10:00:00Z")
}
```

---

## 🎨 UI Examples

### Admin Menu
```typescript
{user.role === 'admin' && (
  <div>
    <Link href="/admin/users">Quản lý Users</Link>
    <Link href="/admin/recipes">Duyệt món ăn</Link>
    <Link href="/admin/stats">Thống kê</Link>
  </div>
)}
```

### Show Badge
```typescript
{user.role === 'admin' && (
  <Badge variant="destructive">Admin</Badge>
)}
```

---

## 🆘 Troubleshooting

### Làm sao tạo admin thứ 2?
**Option 1: Dùng admin hiện tại**
```bash
PATCH /api/admin/users
{
  "userId": "user-id",
  "role": "admin"
}
```

**Option 2: Update trực tiếp MongoDB**
```javascript
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

### Làm sao reset về user thường?
```bash
PATCH /api/admin/users
{
  "userId": "admin-id",
  "role": "user"
}
```

### Quên mất admin?
**Option 1: Tạo lại database**
```bash
# Xóa tất cả users
db.users.deleteMany({})

# Đăng ký lại, user đầu tiên = admin
```

**Option 2: Update MongoDB**
```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

---

## ✅ Checklist Setup Admin

- [ ] Database trống hoặc biết email admin hiện tại
- [ ] Đăng ký tài khoản đầu tiên
- [ ] Verify role là `admin` trong response
- [ ] Login và check token có `role: "admin"`
- [ ] Test API admin: GET /api/admin/users
- [ ] Tạo thêm user thường để test
- [ ] Test thay đổi role user → admin
- [ ] Test khóa/mở user
- [ ] Implement UI cho admin dashboard

---

## 🔐 Security Best Practices

1. **Luôn verify role ở backend**
   - Không tin tưởng client-side checks
   - Dùng `requireAdmin()` middleware

2. **Log admin actions**
   ```typescript
   console.log(`Admin ${adminEmail} changed ${userEmail} role to ${newRole}`)
   ```

3. **Giới hạn số admin**
   - Chỉ cần 1-2 admin
   - Review thường xuyên

4. **Không cho phép tự promote**
   - User không thể tự set role = admin
   - Chỉ admin khác mới promote được

5. **Backup trước khi thay đổi**
   - Export user list
   - Có thể restore nếu sai

---

## 📈 Next Steps

1. **Tạo Admin UI** - Dashboard quản lý users
2. **Activity Log** - Ghi lại hành động admin
3. **Permissions** - Phân quyền chi tiết hơn
4. **2FA** - Xác thực 2 lớp cho admin
5. **Audit Trail** - Lịch sử thay đổi

---

## 🎉 Done!

Bây giờ bạn có:
- ✅ Hệ thống role (user/admin)
- ✅ Auto admin cho user đầu tiên
- ✅ API quản lý users
- ✅ Middleware bảo vệ admin routes
- ✅ Token có chứa role

**Test thôi!** 🚀
