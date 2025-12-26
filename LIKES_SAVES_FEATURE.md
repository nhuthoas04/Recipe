# Chức năng Like và Save Recipes

## Tổng quan
Đã thêm chức năng cho phép người dùng:
- ❤️ **Thích (Like)** công thức yêu thích
- 🔖 **Lưu (Save)** công thức để xem sau
- 📊 Xem số lượng likes và saves trên mỗi công thức
- 📱 Quản lý danh sách recipes đã thích và đã lưu trong trang cá nhân

## Các thay đổi đã thực hiện

### 1. Backend Changes

#### Models
- **User Model** (`backend/src/models/User.ts`):
  - Thêm `savedRecipes: ObjectId[]` - Danh sách recipes đã lưu
  - Thêm `likedRecipes: ObjectId[]` - Danh sách recipes đã thích

- **Recipe Model** (`backend/src/models/Recipe.ts`):
  - Thêm `likesCount: number` - Số lượt thích
  - Thêm `savesCount: number` - Số lượt lưu

#### API Routes
Thêm các endpoints mới trong `backend/src/routes/users.ts`:

1. **POST `/api/users/like-recipe`** - Like/Unlike recipe
   ```typescript
   Body: { recipeId: string }
   Headers: Authorization: Bearer <token>
   Response: { success, isLiked, likesCount, likedRecipes }
   ```

2. **POST `/api/users/save-recipe`** - Save/Unsave recipe
   ```typescript
   Body: { recipeId: string }
   Headers: Authorization: Bearer <token>
   Response: { success, isSaved, savesCount, savedRecipes }
   ```

3. **GET `/api/users/liked-recipes`** - Lấy danh sách recipes đã thích
   ```typescript
   Headers: Authorization: Bearer <token>
   Response: { success, recipes: Recipe[] }
   ```

4. **GET `/api/users/saved-recipes`** - Lấy danh sách recipes đã lưu
   ```typescript
   Headers: Authorization: Bearer <token>
   Response: { success, recipes: Recipe[] }
   ```

### 2. Frontend API Routes (Next.js)

Các API routes trong `app/api/user/` sử dụng MongoDB trực tiếp:
- `like-recipe/route.ts` - Like/Unlike recipe trực tiếp với MongoDB
- `save-recipe/route.ts` - Save/Unsave recipe trực tiếp với MongoDB
- `liked-recipes/route.ts` - Lấy danh sách recipes đã thích
- `saved-recipes/route.ts` - Lấy danh sách recipes đã lưu

#### Components

**Recipe Card** (`client/components/recipe/recipe-card.tsx`):
- Thêm nút Like với icon trái tim ❤️
- Thêm nút Save với icon bookmark 🔖
- Hiển thị số lượt like và save
- Animation khi click (fill color)
- Toast notifications khi like/save thành công

**Profile Page** (`app/profile/page.tsx`):
- Thêm Tabs để phân loại:
  - Tab "Đã đăng" - Recipes user đã tạo
  - Tab "Đã lưu" 🔖 - Recipes đã save
  - Tab "Đã thích" ❤️ - Recipes đã like
- Hiển thị recipes dạng grid với RecipeCard
- Click vào recipe để xem chi tiết

#### Types & Store
- **types.ts**: Thêm `likesCount`, `savesCount` vào Recipe interface
- **types.ts**: Thêm `savedRecipes`, `likedRecipes` vào User interface  
- **auth-store.ts**: Thêm savedRecipes và likedRecipes vào User interface
- **auth-store.ts**: Lưu và xóa token từ localStorage

### 3. Sample Data Script

**File**: `backend/scripts/add-likes-saves-data.js`

Script để thêm dữ liệu mẫu:
- Thêm likesCount (5-54) và savesCount (3-32) cho mỗi recipe
- Thêm 3-8 liked recipes cho mỗi user
- Thêm 2-5 saved recipes cho mỗi user

**Cách chạy:**
```bash
cd backend
node scripts/add-likes-saves-data.js
```

## Hướng dẫn sử dụng

### 1. Setup Database
Chạy script để thêm dữ liệu mẫu:
```bash
cd backend
node scripts/add-likes-saves-data.js
```

### 2. Khởi động Backend
```bash
cd backend
npm run dev
# hoặc
pnpm dev
```

### 3. Khởi động Frontend
```bash
# Từ thư mục gốc
npm run dev
# hoặc
pnpm dev
```

### 4. Sử dụng chức năng

#### Trong Recipe Browser:
1. Mỗi recipe card hiện có 2 nút:
   - ❤️ **Like button** - Click để thích/bỏ thích
   - 🔖 **Save button** - Click để lưu/bỏ lưu
2. Số lượt like/save hiển thị bên cạnh mỗi icon
3. Icon sẽ được fill màu khi đã like/save

#### Trong Profile Page:
1. Vào trang Profile (`/profile`)
2. Xem 3 tabs:
   - **Đã đăng**: Recipes bạn đã tạo (với status)
   - **Đã lưu** 🔖: Recipes đã save
   - **Đã thích** ❤️: Recipes đã like
3. Click vào recipe card để xem chi tiết

## Technical Details

### Authentication Flow
1. User login → Nhận JWT token
2. Token được lưu vào localStorage
3. Mỗi request like/save gửi token trong body
4. Next.js API route forward request với token trong header
5. Backend middleware xác thực token
6. Update database và return kết quả

### State Management
- Auth store lưu user info (bao gồm savedRecipes, likedRecipes arrays)
- Recipe card có local state cho isLiked, isSaved
- Khi like/save, cập nhật cả local state và auth store
- Profile page fetch data mỗi khi load

### Database Schema
```typescript
User {
  savedRecipes: ObjectId[]  // Array of Recipe IDs
  likedRecipes: ObjectId[]  // Array of Recipe IDs
}

Recipe {
  likesCount: number  // Counter for likes
  savesCount: number  // Counter for saves
}
```

## Troubleshooting

### Lỗi 401 Unauthorized
- Kiểm tra đã đăng nhập chưa
- Kiểm tra token trong localStorage: `localStorage.getItem('token')`
- Thử đăng xuất và đăng nhập lại

### Không thấy số likes/saves
- Chạy lại script add-likes-saves-data.js
- Kiểm tra backend đã chạy chưa
- Check console log xem có lỗi API không

### Tabs không hiển thị recipes
- Kiểm tra đã có recipes đã like/save chưa
- Check Network tab xem API có trả về data không
- Kiểm tra token có được gửi đúng không

## Future Enhancements
- [ ] Real-time updates khi có người khác like/save
- [ ] Thông báo khi recipe được like nhiều
- [ ] Filter/Sort recipes trong tabs
- [ ] Export saved recipes
- [ ] Share liked recipes với bạn bè
