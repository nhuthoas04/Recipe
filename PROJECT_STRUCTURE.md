# 📁 Cấu trúc Dự án - Recipe App

## 🏗️ Tổng quan:

```
recipe/
├── app/                  # 📱 Next.js App Router (Pages & API Routes)
├── client/               # 💻 Frontend Code (Components, Libs, Styles)
├── backend/              # ⚙️ Express.js Backend (chưa sử dụng)
├── scripts/              # 🛠️ Setup scripts
├── node_modules/         # 📦 Dependencies
└── [config files]        # ⚙️ Config files
```

---

## 📱 **app/** - Next.js App Router

### Pages:
- `/` - Homepage (Recipe Browser)
- `/login` - Đăng nhập
- `/register` - Đăng ký
- `/profile` - Trang cá nhân
- `/meal-planner` - Lên kế hoạch món ăn
- `/shopping-list` - Danh sách mua sắm
- `/admin` - Trang quản trị

### API Routes:
- `/api/auth/*` - Authentication (login, register, logout)
- `/api/recipes/*` - CRUD recipes
- `/api/comments/*` - CRUD comments
- `/api/meal-plans/*` - CRUD meal plans
- `/api/shopping-list/*` - CRUD shopping list
- `/api/users/*` - User management
- `/api/admin/*` - Admin functions

---

## 💻 **client/** - Frontend Code

### **components/** - React Components (chia theo feature)

#### `auth/` - Authentication
- `auth-guard.tsx` - Protected route wrapper
- `user-data-sync.tsx` - Sync user data
- `cleanup-localstorage.tsx` - Cleanup localStorage

#### `recipe/` - Recipe Management
- `recipe-browser.tsx` - Browse & filter recipes
- `recipe-card.tsx` - Recipe card display
- `recipe-detail-dialog.tsx` - Recipe details + comments
- `recipe-form-dialog.tsx` - Create/edit recipe form

#### `meal/` - Meal Planning
- `meal-planner.tsx` - Weekly meal planner
- `meal-slot.tsx` - Individual meal slot
- `add-meal-dialog.tsx` - Add meal to plan dialog

#### `shopping/` - Shopping List
- `shopping-list.tsx` - Shopping list management

#### `layout/` - Layout Components
- `header.tsx` - Navigation header
- `theme-provider.tsx` - Dark/Light mode

#### `shared/` - Shared Utilities
- `client-only.tsx` - Client-side only wrapper

#### `ui/` - shadcn/ui Components (12 files)
- button, card, dialog, input, checkbox, etc.

### **lib/** - Utilities & Logic

- `auth-store.ts` - Zustand auth state management
- `recipe-store.ts` - Zustand recipe state management
- `types.ts` - TypeScript type definitions
- `utils.ts` - Helper functions
- `mongodb.ts` - MongoDB connection
- `recipes-data.ts` - Default recipe data
- `auth.ts` - Auth utilities

### **styles/** - Styles
- `globals.css` - Global CSS styles

---

## ⚙️ **backend/** - Express.js Backend

**Trạng thái:** Đã tạo nhưng chưa tích hợp

```
backend/
├── src/              # Source code (models, routes, middleware)
├── scripts/          # Database scripts
├── docs/             # Documentation (9 files)
├── docker-compose.yml
├── Dockerfile
├── mongo-init.js
└── setup-mongodb-user.js
```

Xem chi tiết: [backend/STRUCTURE.md](backend/STRUCTURE.md)

---

## 📝 **Config Files**

- `package.json` - Dependencies & scripts
- `tsconfig.json` - TypeScript config (`@/*` → `./client/*`)
- `next.config.mjs` - Next.js config
- `components.json` - shadcn/ui config
- `postcss.config.mjs` - PostCSS config
- `.env.local` - Environment variables

---

## 🔗 Import Paths

Tất cả imports sử dụng alias `@/`:

```typescript
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/auth-store"
import { Recipe } from "@/lib/types"
```

Mapping:
- `@/components/*` → `client/components/*`
- `@/lib/*` → `client/lib/*`

---

## 🚀 Commands

```bash
# Development
npm run dev              # Start Next.js frontend
npm run dev:backend      # Start Express backend
npm run dev:frontend     # Start Next.js frontend

# Build
npm run build            # Build for production
npm run start            # Start production server
```

---

## 📊 Tech Stack

### Frontend:
- **Framework:** Next.js 15.2.4 (App Router)
- **React:** 19
- **TypeScript:** 5
- **Styling:** Tailwind CSS 4.1.9
- **UI Components:** shadcn/ui (Radix UI)
- **State Management:** Zustand
- **Database:** MongoDB 6.20.0
- **Auth:** JWT + bcryptjs

### Backend (chưa dùng):
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose

---

## 📖 Ghi chú

1. **App Router ở root:** Next.js yêu cầu thư mục `app` ở root hoặc `src`
2. **Client folder:** Chứa tất cả frontend code (components, libs)
3. **Backend folder:** Đã tạo nhưng chưa tích hợp vào hệ thống
4. **API Routes:** Hiện dùng Next.js API Routes (trong `app/api`)
