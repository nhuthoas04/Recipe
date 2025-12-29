# 📊 KẾT QUẢ KIỂM THỬ API

## 1. Giới thiệu

Tài liệu này trình bày kết quả kiểm thử các API của hệ thống Website Công thức Nấu ăn.

---

## 2. Môi trường kiểm thử

| Thông tin | Chi tiết |
|-----------|----------|
| **Framework** | Next.js 15.2.4 |
| **Database** | MongoDB Atlas |
| **Authentication** | JWT Token |
| **Công cụ test** | Postman / Browser DevTools |
| **Môi trường** | Development (localhost:3000) |

---

## 3. Kết quả kiểm thử chi tiết

### 3.1. API Xác thực (Authentication)

| STT | Endpoint | Method | Mô tả | Kết quả |
|-----|----------|--------|-------|---------|
| 1 | `/api/auth/register` | POST | Đăng ký tài khoản | ✅ Pass |
| 2 | `/api/auth/login` | POST | Đăng nhập | ✅ Pass |
| 3 | `/api/auth/logout` | POST | Đăng xuất | ✅ Pass |
| 4 | `/api/auth/forgot-password` | POST | Quên mật khẩu | ✅ Pass |
| 5 | `/api/auth/resend-reset-code` | POST | Gửi lại mã | ✅ Pass |
| 6 | `/api/auth/reset-password` | POST | Đặt lại mật khẩu | ✅ Pass |

---

### 3.2. API Công thức (Recipes)

| STT | Endpoint | Method | Mô tả | Kết quả |
|-----|----------|--------|-------|---------|
| 1 | `/api/recipes` | GET | Lấy danh sách công thức | ✅ Pass |
| 2 | `/api/recipes?includeAll=true` | GET | Lấy tất cả (admin) | ✅ Pass |
| 3 | `/api/recipes` | POST | Thêm công thức mới | ✅ Pass |
| 4 | `/api/recipes` | PUT | Cập nhật công thức | ✅ Pass |
| 5 | `/api/recipes?id=xxx` | DELETE | Xóa công thức | ✅ Pass |
| 6 | `/api/recipes/review` | POST | Duyệt/Từ chối | ✅ Pass |
| 7 | `/api/recipes/restore` | POST | Khôi phục | ✅ Pass |

---

### 3.3. API Thích/Lưu (Like/Save)

| STT | Endpoint | Method | Mô tả | Kết quả |
|-----|----------|--------|-------|---------|
| 1 | `/api/user/like-recipe` | POST | Thích công thức | ✅ Pass |
| 2 | `/api/user/save-recipe` | POST | Lưu công thức | ✅ Pass |

---

### 3.4. API Bình luận (Comments)

| STT | Endpoint | Method | Mô tả | Kết quả |
|-----|----------|--------|-------|---------|
| 1 | `/api/comments?recipeId=xxx` | GET | Lấy bình luận | ✅ Pass |
| 2 | `/api/comments` | POST | Thêm bình luận | ✅ Pass |
| 3 | `/api/comments?id=xxx` | DELETE | Xóa bình luận | ✅ Pass |
| 4 | `/api/comments` | PATCH | Thích bình luận | ✅ Pass |

---

### 3.5. API Thực đơn (Meal Plans)

| STT | Endpoint | Method | Mô tả | Kết quả |
|-----|----------|--------|-------|---------|
| 1 | `/api/meal-plans?userId=xxx` | GET | Lấy thực đơn | ✅ Pass |
| 2 | `/api/meal-plans` | POST | Thêm thực đơn | ✅ Pass |
| 3 | `/api/meal-plans` | PUT | Cập nhật thực đơn | ✅ Pass |
| 4 | `/api/meal-plans?userId=x&mealPlanId=x` | DELETE | Xóa thực đơn | ✅ Pass |

---

### 3.6. API Danh sách mua sắm (Shopping List)

| STT | Endpoint | Method | Mô tả | Kết quả |
|-----|----------|--------|-------|---------|
| 1 | `/api/shopping-list?userId=xxx` | GET | Lấy danh sách | ✅ Pass |
| 2 | `/api/shopping-list` | POST | Thêm items | ✅ Pass |
| 3 | `/api/shopping-list?userId=xxx` | DELETE | Xóa tất cả | ✅ Pass |

---

### 3.7. API Người dùng (Users)

| STT | Endpoint | Method | Mô tả | Kết quả |
|-----|----------|--------|-------|---------|
| 1 | `/api/users` | GET | Lấy danh sách users | ✅ Pass |
| 2 | `/api/users` | PUT | Khóa/Mở khóa | ✅ Pass |
| 3 | `/api/users?userId=xxx` | DELETE | Xóa user | ✅ Pass |
| 4 | `/api/users/health-profile` | POST | Cập nhật hồ sơ sức khỏe | ✅ Pass |

---

### 3.8. API AI Gợi ý

| STT | Endpoint | Method | Mô tả | Kết quả |
|-----|----------|--------|-------|---------|
| 1 | `/api/ai/recommendations` | POST | Gợi ý theo sức khỏe | ✅ Pass |

---

## 4. Tổng kết

| Nhóm API | Số lượng | Passed | Failed | Tỷ lệ |
|----------|----------|--------|--------|-------|
| Authentication | 6 | 6 | 0 | 100% |
| Recipes | 7 | 7 | 0 | 100% |
| Like/Save | 2 | 2 | 0 | 100% |
| Comments | 4 | 4 | 0 | 100% |
| Meal Plans | 4 | 4 | 0 | 100% |
| Shopping List | 3 | 3 | 0 | 100% |
| Users | 4 | 4 | 0 | 100% |
| AI Recommendations | 1 | 1 | 0 | 100% |
| **TỔNG CỘNG** | **31** | **31** | **0** | **100%** |

---

## 5. Kết luận

- ✅ Tất cả **31 API endpoints** đã được kiểm thử thành công
- ✅ Tỷ lệ thành công: **100%**
- ✅ Hệ thống hoạt động ổn định
- ✅ Authentication (JWT) hoạt động đúng
- ✅ Real-time updates (Like/Save) hoạt động chính xác

---

## 6. Hướng dẫn Test

### Lấy Token
```
POST http://localhost:3000/api/auth/login
Body: {"email": "admin@recipe.com", "password": "admin123"}
```

### Sử dụng Token
- Tab Authorization → Bearer Token → Paste token
- Hoặc Header: `Authorization: Bearer <token>`
