# Recipe App - RESTful API Backend

Backend API server cho ứng dụng Recipe, được xây dựng với Express.js, TypeScript, và MongoDB.

## 🚀 Cài đặt

### 1. Cài đặt dependencies

```bash
cd backend
npm install
```

### 2. Cấu hình môi trường

Sửa file `.env` với thông tin của bạn:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/recipe-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Chạy server

**Development mode (với hot reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Recipes
- `GET /api/recipes` - Lấy danh sách recipes
- `GET /api/recipes/:id` - Lấy chi tiết recipe
- `POST /api/recipes` - Tạo recipe mới (cần auth)
- `PUT /api/recipes/:id` - Cập nhật recipe (cần auth)
- `DELETE /api/recipes/:id` - Xóa recipe (cần auth)
- `POST /api/recipes/:id/review` - Duyệt/từ chối recipe (admin only)

### Users
- `GET /api/users` - Lấy danh sách users (admin only)
- `PATCH /api/users/:id/toggle-active` - Khóa/mở khóa user (admin only)
- `DELETE /api/users/:id` - Xóa user (admin only)

### Meal Plans
- `GET /api/meal-plans` - Lấy meal plans (cần auth)
- `POST /api/meal-plans` - Tạo/cập nhật meal plan (cần auth)
- `DELETE /api/meal-plans/:id` - Xóa meal plan (cần auth)

## 🔐 Authentication

API sử dụng JWT token để xác thực. Token có thể được gửi qua:
1. **Cookie** (httpOnly): `token`
2. **Authorization header**: `Bearer <token>`

Token có thời hạn 7 ngày.

## 🧪 Test API

Bạn có thể test API bằng:
- **Postman** hoặc **Insomnia**
- **curl** commands
- Hoặc trực tiếp từ frontend

### Ví dụ với curl:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","name":"Test User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# Get recipes
curl http://localhost:5000/api/recipes
```

## 📁 Cấu trúc project

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts       # MongoDB connection
│   ├── models/
│   │   ├── User.ts           # User model
│   │   ├── Recipe.ts         # Recipe model
│   │   └── MealPlan.ts       # MealPlan model
│   ├── routes/
│   │   ├── auth.ts           # Auth routes
│   │   ├── recipes.ts        # Recipe routes
│   │   ├── users.ts          # User routes
│   │   └── mealPlans.ts      # MealPlan routes
│   ├── middleware/
│   │   ├── auth.ts           # JWT authentication
│   │   └── errorHandler.ts  # Error handling
│   └── server.ts             # Main server file
├── .env                      # Environment variables
├── package.json
├── tsconfig.json
└── nodemon.json
```

## 🔄 So sánh với Next.js API Routes

### Trước (Next.js API Routes):
- ❌ Monolithic, không tách biệt frontend/backend
- ❌ Khó scale riêng lẻ
- ❌ Không thể dùng cho mobile app
- ✅ Đơn giản, deploy 1 lần

### Sau (RESTful API):
- ✅ Tách biệt hoàn toàn frontend/backend
- ✅ Có thể scale độc lập
- ✅ Dùng được cho web, mobile, desktop
- ✅ Nhiều team có thể làm việc song song
- ❌ Phức tạp hơn, phải deploy 2 nơi

## 🚀 Deploy

### Backend:
- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub repo
- **Render**: Connect GitHub repo
- **DigitalOcean**: Docker container
- **AWS EC2**: Manual setup

### Database:
- **MongoDB Atlas**: Free tier 512MB
- Cập nhật `MONGODB_URI` trong `.env`

## 📝 Notes

- User đầu tiên đăng ký sẽ tự động là **admin**
- Admin posts recipe → tự động **approved**
- User posts recipe → cần admin **review**
- CORS đã được cấu hình cho `http://localhost:3000`

## 🐛 Debugging

```bash
# Xem logs
npm run dev

# Check MongoDB connection
# Đảm bảo MongoDB đang chạy tại port 27017

# Test health endpoint
curl http://localhost:5000/health
```

## 📚 Technologies

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests
