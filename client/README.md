# Client Folder

Thư mục này chứa **tất cả code frontend** của ứng dụng (components, libs, styles).

## 📁 Cấu trúc:

```
client/
├── components/       # React Components (chia theo feature)
│   ├── auth/        # Authentication components
│   ├── recipe/      # Recipe-related components
│   ├── meal/        # Meal planning components
│   ├── shopping/    # Shopping list components
│   ├── layout/      # Layout components (Header, Theme)
│   ├── shared/      # Shared utilities
│   └── ui/          # shadcn/ui components
│
├── lib/             # Utilities, Stores, Types
│   ├── auth-store.ts
│   ├── recipe-store.ts
│   ├── types.ts
│   ├── utils.ts
│   └── mongodb.ts
│
└── styles/          # CSS files
    └── globals.css
```

## 🔗 Liên kết với App Router:

Thư mục `app/` (pages & API routes) nằm ở root level để Next.js có thể tự động nhận diện.

## 📦 Import paths:

Tất cả imports sử dụng alias `@/`:
- `@/components/*` → `client/components/*`
- `@/lib/*` → `client/lib/*`

Cấu hình trong `tsconfig.json`:
```json
"paths": {
  "@/*": ["./client/*"]
}
```
