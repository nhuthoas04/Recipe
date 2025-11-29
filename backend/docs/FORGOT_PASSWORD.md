# Chức Năng Quên Mật Khẩu

## Tổng Quan
Hệ thống quên mật khẩu sử dụng mã xác thực 6 số được gửi qua email để xác thực người dùng trước khi cho phép đặt lại mật khẩu.

## API Endpoints

### 1. Yêu Cầu Đặt Lại Mật Khẩu
```
POST /api/users/forgot-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Mã xác thực đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư."
}
```

**Response (Rate Limited):**
```json
{
  "success": false,
  "error": "Vui lòng đợi 60s để gửi lại mã"
}
```

### 2. Xác Thực Mã và Đặt Lại Mật Khẩu
```
POST /api/users/reset-password
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "newSecurePassword123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới."
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Mã xác thực không chính xác"
}
```

### 3. Gửi Lại Mã Xác Thực
```
POST /api/users/resend-reset-code
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Mã xác thực mới đã được gửi đến email của bạn."
}
```

## Cấu Hình Email (SMTP)

### Sử dụng Gmail

1. Bật xác thực 2 bước cho tài khoản Gmail
2. Tạo App Password: https://myaccount.google.com/apppasswords
3. Cập nhật file `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM=no-reply@recipe.com
```

### Sử dụng SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=no-reply@recipe.com
```

### Development Mode (Không cần SMTP)

Nếu không cấu hình SMTP, email sẽ được log ra console:

```
[emailService] Preview email payload: {
  from: 'no-reply@recipe.com',
  to: 'user@example.com',
  subject: 'Đặt lại mật khẩu - Bếp Nhà',
  html: '<div>...</div>',
  text: 'Mã xác thực đặt lại mật khẩu của bạn là 123456...'
}
```

## Bảo Mật

### Rate Limiting
- Mỗi email chỉ có thể yêu cầu gửi mã mới sau **60 giây**
- Mã xác thực hết hạn sau **10 phút**

### Validation
- Email phải tồn tại trong hệ thống
- Mã xác thực phải chính xác (6 số)
- Mật khẩu mới phải có ít nhất 6 ký tự
- Mã hết hạn sau 10 phút

### Security Best Practices
- ✅ Không tiết lộ email có tồn tại hay không
- ✅ Mã xác thực được lưu với `select: false` (không trả về mặc định)
- ✅ Mật khẩu được hash bằng bcrypt
- ✅ Rate limiting để chống spam

## Flow Người Dùng

1. **Yêu cầu đặt lại mật khẩu:**
   - Người dùng nhập email
   - Server tạo mã 6 số và gửi qua email
   - Mã có hiệu lực 10 phút

2. **Xác thực và đặt lại:**
   - Người dùng nhập mã từ email
   - Nhập mật khẩu mới (tối thiểu 6 ký tự)
   - Server xác thực mã và cập nhật mật khẩu

3. **Gửi lại mã (nếu cần):**
   - Nếu mã hết hạn hoặc không nhận được
   - Phải đợi 60s giữa mỗi lần gửi

## Database Schema

Thêm vào User model:

```typescript
{
  resetPasswordCode?: string;          // Mã xác thực 6 số
  resetPasswordExpires?: Date;         // Thời gian hết hạn
  lastResetPasswordEmailSentAt?: Date; // Thời gian gửi email cuối
}
```

## Testing

### Test Manual với curl:

```bash
# 1. Yêu cầu đặt lại mật khẩu
curl -X POST http://localhost:5000/api/users/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 2. Kiểm tra console log để lấy mã (nếu không cấu hình SMTP)

# 3. Đặt lại mật khẩu
curl -X POST http://localhost:5000/api/users/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "code":"123456",
    "newPassword":"newPassword123"
  }'

# 4. Gửi lại mã
curl -X POST http://localhost:5000/api/users/resend-reset-code \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## Error Codes

| Status | Error Message | Giải Thích |
|--------|--------------|------------|
| 400 | Vui lòng cung cấp email | Thiếu email trong request |
| 400 | Mật khẩu mới phải có ít nhất 6 ký tự | Password quá ngắn |
| 400 | Mã xác thực không tồn tại | Chưa yêu cầu reset hoặc mã đã xóa |
| 400 | Mã xác thực đã hết hạn | Mã quá 10 phút |
| 400 | Mã xác thực không chính xác | Sai mã |
| 404 | Không tìm thấy tài khoản | Email không tồn tại (chỉ hiện khi reset) |
| 429 | Vui lòng đợi Xs để gửi lại mã | Rate limiting |
| 500 | Không thể gửi email | SMTP error |

## Frontend Integration

Tạo UI với 2 màn hình:

### 1. Forgot Password Screen
- Input: Email
- Button: "Gửi mã xác thực"
- Link: "Quay lại đăng nhập"

### 2. Reset Password Screen
- Input: Email (readonly/prefilled)
- Input: Mã xác thực 6 số
- Input: Mật khẩu mới
- Input: Xác nhận mật khẩu mới
- Button: "Đặt lại mật khẩu"
- Link: "Gửi lại mã"
- Link: "Quay lại"

## Troubleshooting

### Email không gửi được

1. Kiểm tra SMTP config trong `.env`
2. Kiểm tra console log
3. Với Gmail: Đảm bảo đã tạo App Password
4. Kiểm tra tường lửa/antivirus

### Mã luôn hết hạn

- Kiểm tra timezone server
- Kiểm tra `RESET_PASSWORD_TTL_MS` (mặc định 10 phút)

### Rate limit quá nhanh

- Điều chỉnh `RESEND_COOLDOWN_MS` trong code (mặc định 60s)
