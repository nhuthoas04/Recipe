# 🔧 Backend Structure

## 📁 Cấu trúc thư mục Backend:

```
backend/
├── src/                      # Source code
│   ├── server.ts            # Entry point
│   ├── config/              # Configuration
│   │   └── database.ts      # MongoDB connection
│   ├── models/              # Mongoose models
│   │   ├── User.ts
│   │   ├── Recipe.ts
│   │   └── MealPlan.ts
│   ├── routes/              # API routes
│   │   ├── auth.ts
│   │   ├── recipes.ts
│   │   ├── users.ts
│   │   └── mealPlans.ts
│   └── middleware/          # Middleware
│       ├── auth.ts          # JWT authentication
│       └── errorHandler.ts  # Error handling
│
├── scripts/                 # Database scripts
│   ├── check-data.js        # Kiểm tra dữ liệu
│   ├── clear-database.js    # Xóa database
│   └── create-admin.js      # Tạo admin user
│
├── docs/                    # Documentation
│   ├── MONGODB_SETUP.md
│   ├── MONGODB_INTEGRATION.md
│   ├── MONGODB_ATLAS_SETUP.md
│   ├── FIX_MONGODB_AUTH.md
│   ├── FIX_MONGODB_QUICK.md
│   ├── ADMIN_ROLES.md
│   ├── JWT_AUTHENTICATION.md
│   ├── SAMPLE_DATA_GUIDE.md
│   └── TOAST_NOTIFICATIONS.md
│
├── docker-compose.yml       # Docker Compose config
├── Dockerfile               # Docker image config
├── .dockerignore            # Docker ignore patterns
├── DOCKER.md                # Docker documentation
│
├── mongo-init.js            # MongoDB initialization
├── setup-mongodb-user.js    # Setup MongoDB user
├── disable-mongodb-auth.ps1 # PowerShell script
│
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── nodemon.json             # Nodemon config
└── .env                     # Environment variables
```

---

## 🚀 Commands

### Development:
```bash
cd backend
npm run dev              # Start với nodemon (auto-reload)
```

### Build & Production:
```bash
npm run build            # Build TypeScript → dist/
npm run start            # Run production server
```

### Database Scripts:
```bash
node scripts/check-data.js      # Kiểm tra dữ liệu DB
node scripts/clear-database.js  # Xóa toàn bộ DB
node scripts/create-admin.js    # Tạo admin user
```

### Docker:
```bash
docker-compose up -d           # Start MongoDB container
docker-compose down            # Stop containers
```

---

## 🔧 Configuration

### Environment Variables (`.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/recipe-app
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### MongoDB:
- **Local:** `mongodb://localhost:27017/recipe-app`
- **Atlas:** Xem `docs/MONGODB_ATLAS_SETUP.md`

---

## 📊 Tech Stack

- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (jsonwebtoken)
- **Password:** bcryptjs
- **Dev Tools:** nodemon, ts-node

---

## 🔐 API Endpoints

### Authentication:
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất

### Recipes:
- `GET /api/recipes` - Lấy danh sách recipes
- `POST /api/recipes` - Tạo recipe
- `PUT /api/recipes/:id` - Cập nhật recipe
- `DELETE /api/recipes/:id` - Xóa recipe

### Users:
- `GET /api/users` - Lấy danh sách users (admin)
- `GET /api/users/:id` - Lấy thông tin user
- `PUT /api/users/:id` - Cập nhật user
- `DELETE /api/users/:id` - Xóa user (admin)

### Meal Plans:
- `GET /api/meal-plans` - Lấy meal plans
- `POST /api/meal-plans` - Tạo meal plan
- `PUT /api/meal-plans/:id` - Cập nhật meal plan
- `DELETE /api/meal-plans/:id` - Xóa meal plan

---

## 📝 Status

**⏸️ Backend đã tạo nhưng chưa tích hợp**

Frontend hiện đang sử dụng Next.js API Routes (trong `app/api/`).
Backend Express.js này đã sẵn sàng nhưng chưa được kết nối với frontend.

---

## 🔗 Tích hợp với Frontend

Để tích hợp backend này:

1. Start backend: `cd backend && npm run dev` (port 5000)
2. Update frontend API calls từ `/api/*` → `http://localhost:5000/api/*`
3. Sử dụng `client/lib/api-client.ts` (đã tạo sẵn)

---

## 📖 Documentation

Xem thêm trong thư mục `docs/`:
- MongoDB setup & troubleshooting
- Authentication implementation
- Admin roles & permissions
- Sample data guide
