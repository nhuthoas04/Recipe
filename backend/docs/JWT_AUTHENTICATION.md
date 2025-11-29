# JWT Authentication - Giải thích chi tiết

## JWT là gì?

**JWT (JSON Web Token)** là một chuẩn mở (RFC 7519) để truyền thông tin một cách an toàn giữa các bên dưới dạng JSON object. Token được mã hóa và có thể verify được.

## Cấu trúc JWT

JWT gồm 3 phần, ngăn cách bởi dấu chấm (`.`):

```
xxxxx.yyyyy.zzzzz
```

### 1. Header (xxxxx)
Chứa loại token (JWT) và thuật toán mã hóa (HS256, RS256, etc.)

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### 2. Payload (yyyyy)
Chứa thông tin user và metadata (claims)

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "Nguyen Van A",
  "iat": 1730361600,
  "exp": 1730966400
}
```

**Claims quan trọng:**
- `iat` (issued at): Thời điểm tạo token
- `exp` (expiration): Thời điểm hết hạn
- Custom claims: userId, email, name, role, etc.

### 3. Signature (zzzzz)
Chữ ký để verify token không bị thay đổi

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  JWT_SECRET
)
```

## Flow hoạt động

### 1. Đăng nhập/Đăng ký
```
Client                    Server
  |                          |
  |------ POST /login ------>|
  |   {email, password}      |
  |                          |
  |                          |--- Verify credentials
  |                          |--- Create JWT token
  |                          |
  |<----- 200 OK ------------|
  |   {user, token}          |
  |   Set-Cookie: auth-token |
```

### 2. Truy cập API bảo mật
```
Client                    Server
  |                          |
  |-- GET /api/profile ----->|
  |   Cookie: auth-token     |
  |                          |
  |                          |--- Verify token
  |                          |--- Decode payload
  |                          |
  |<----- 200 OK ------------|
  |   {user data}            |
```

### 3. Token hết hạn
```
Client                    Server
  |                          |
  |-- GET /api/profile ----->|
  |   Cookie: expired-token  |
  |                          |
  |                          |--- Token expired!
  |                          |
  |<----- 401 Unauthorized --|
  |                          |
  |                          |
  |------ Redirect login ----|
```

## Ưu điểm JWT

### 1. **Stateless (Không cần lưu trạng thái)**
- Server không cần lưu session
- Dễ scale horizontally (nhiều server)
- Giảm tải database

### 2. **Self-contained (Tự chứa thông tin)**
- Token chứa tất cả thông tin cần thiết
- Không cần query database mỗi request
- Giảm latency

### 3. **Cross-domain (Dùng được nhiều domain)**
- Token gửi qua HTTP header
- Không bị giới hạn bởi cookie domain
- Phù hợp với microservices

### 4. **Mobile-friendly**
- Dễ sử dụng với mobile apps
- Không phụ thuộc cookie

## Bảo mật

### 1. **httpOnly Cookie**
```typescript
response.cookies.set({
  name: 'auth-token',
  value: token,
  httpOnly: true, // ✅ JavaScript không truy cập được
  secure: true,    // ✅ Chỉ gửi qua HTTPS
  sameSite: 'strict', // ✅ Chống CSRF attack
})
```

**Tại sao?**
- `httpOnly`: Chống XSS (Cross-Site Scripting) - hacker không thể dùng JavaScript để đánh cắp token
- `secure`: Token chỉ gửi qua HTTPS, không gửi qua HTTP không mã hóa
- `sameSite`: Cookie chỉ gửi trong cùng domain, chống CSRF (Cross-Site Request Forgery)

### 2. **JWT_SECRET phải mạnh**
```env
# ❌ Yếu
JWT_SECRET=secret

# ✅ Mạnh (ít nhất 32 ký tự, random)
JWT_SECRET=8f9e7d6c5b4a3928171615141312111009080706050403020100
```

### 3. **Thời gian hết hạn hợp lý**
```typescript
// Session ngắn (1 giờ)
expiresIn: '1h'

// Session vừa (1 ngày)
expiresIn: '1d'

// Session dài (7 ngày) - cần có refresh token
expiresIn: '7d'
```

### 4. **Refresh Token Pattern**
Để tăng bảo mật, nên dùng 2 loại token:
- **Access Token**: Thời gian ngắn (15 phút), dùng để truy cập API
- **Refresh Token**: Thời gian dài (7 ngày), dùng để lấy access token mới

## Cách sử dụng trong project

### 1. Login
```typescript
// app/api/auth/login/route.ts
const token = jwt.sign(
  { userId, email, name },
  JWT_SECRET,
  { expiresIn: '7d' }
)

response.cookies.set({
  name: 'auth-token',
  value: token,
  httpOnly: true,
  // ... options
})
```

### 2. Verify Token (Protected Routes)
```typescript
// app/api/user/profile/route.ts
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const tokenPayload = verifyToken(request)
  
  if (!tokenPayload) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  // ✅ Token hợp lệ, tiếp tục xử lý
  const userId = tokenPayload.userId
}
```

### 3. Logout
```typescript
// app/api/auth/logout/route.ts
response.cookies.set({
  name: 'auth-token',
  value: '',
  maxAge: 0, // Xóa cookie
})
```

### 4. Client-side (Optional)
```typescript
// Nếu muốn lưu token ở localStorage (ít bảo mật hơn)
localStorage.setItem('token', token)

// Gửi token qua header
fetch('/api/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

## So sánh Session vs JWT

| Feature | Session-based | JWT |
|---------|--------------|-----|
| Storage | Server (Redis/DB) | Client (Cookie/Storage) |
| Stateless | ❌ No | ✅ Yes |
| Scalability | ❌ Hard | ✅ Easy |
| Revoke | ✅ Easy | ❌ Hard* |
| Size | Small (session ID) | Large (full data) |
| Security | ✅ Good | ⚠️ Need care |

*Note: Để revoke JWT, cần blacklist hoặc dùng refresh token pattern

## Best Practices

1. ✅ Luôn dùng HTTPS trong production
2. ✅ Set JWT_SECRET mạnh và đặt trong .env
3. ✅ Dùng httpOnly cookie thay vì localStorage
4. ✅ Set thời gian hết hạn hợp lý
5. ✅ Validate token ở mọi protected routes
6. ✅ Không lưu thông tin nhạy cảm trong token (password, credit card, etc.)
7. ✅ Implement refresh token cho security tốt hơn
8. ✅ Log failed authentication attempts
9. ✅ Rate limit login endpoints
10. ✅ Rotate JWT_SECRET định kỳ

## Testing

### 1. Test với Postman/Thunder Client

**Login:**
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "user": {...},
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Access Protected Route:**
```
GET http://localhost:3000/api/user/profile
Cookie: auth-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

OR

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Decode JWT (để debug)
Vào https://jwt.io và paste token để xem payload

## Troubleshooting

### Token không hoạt động?
1. Check JWT_SECRET có đúng không
2. Check token có expired chưa
3. Check cookie có được gửi kèm request không
4. Check CORS settings nếu frontend/backend khác domain

### Token bị đánh cắp?
1. Revoke ngay bằng cách thêm vào blacklist
2. Force user logout
3. Reset JWT_SECRET (tất cả token cũ sẽ invalid)
4. Investigate breach

## Resources

- [JWT.io](https://jwt.io) - Decode và verify JWT
- [RFC 7519](https://tools.ietf.org/html/rfc7519) - JWT specification
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
