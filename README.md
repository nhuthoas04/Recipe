# Recipe App - MongoDB Atlas Quick Start

## 🚀 Setup nhanh (5 phút)

### 1. Tạo MongoDB Atlas (Free)
- Truy cập: https://www.mongodb.com/cloud/atlas/register
- Đăng ký bằng Google/Email
- Tạo cluster M0 (Free 512MB)

### 2. Tạo Database User
```
Security → Database Access → Add New Database User
Username: admin
Password: [tự đặt hoặc auto generate]
```

### 3. Allow IP
```
Security → Network Access → Add IP Address
→ Allow Access from Anywhere (0.0.0.0/0)
```

### 4. Lấy Connection String
```
Database → Connect → Connect your application
→ Copy connection string
→ Thay <password> và thêm /recipe
```

### 5. Update `.env`
```env
MONGODB_URI=mongodb+srv://admin:yourpassword@cluster0.abc.mongodb.net/recipe?retryWrites=true&w=majority
JWT_SECRET=your-random-secret-key-min-32-chars
```

### 6. Test
```bash
pnpm dev
```

## 📖 Chi tiết

- **MongoDB Setup:** [backend/docs/MONGODB_ATLAS_SETUP.md](backend/docs/MONGODB_ATLAS_SETUP.md)
- **Project Structure:** [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- **Backend Structure:** [backend/STRUCTURE.md](backend/STRUCTURE.md)

## ⚠️ Lưu ý

- **Không commit file `.env`** lên GitHub
- Dùng `.env.example` làm template
- Password phải encode nếu có ký tự đặc biệt (@, #, %, etc.)

## 🆘 Lỗi thường gặp

### "bad auth"
→ Username/password sai, check lại Database Access

### "IP not whitelisted"  
→ Chưa add IP, vào Network Access → Add 0.0.0.0/0

### "connect ECONNREFUSED"
→ Connection string sai format, check lại có `mongodb+srv://` và `/recipe`

## ✅ Done!

Sau khi setup xong, app sẽ tự động:
- Tạo collections (users, recipes, meal_plans, shopping_lists)
- Lưu data vào Atlas
- Có thể truy cập từ mọi nơi
