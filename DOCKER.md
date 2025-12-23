# Docker Deployment Guide

## 🐳 Chạy ứng dụng với Docker

### Yêu cầu
- Docker Desktop đã cài đặt
- Docker Compose

### Bước 1: Build và chạy tất cả services

```bash
# Tại thư mục gốc của project
docker-compose up -d --build
```

Lệnh này sẽ:
- ✅ Tạo MongoDB container (port 27017)
- ✅ Build và chạy Backend API (port 5000)
- ✅ Build và chạy Frontend (port 3000)

### Bước 2: Kiểm tra services đang chạy

```bash
docker-compose ps
```

### Bước 3: Xem logs

```bash
# Xem tất cả logs
docker-compose logs -f

# Xem logs từng service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f mongodb
```

### Bước 4: Truy cập ứng dụng

- 🌐 Frontend: http://localhost:3000
- 🔧 Backend API: http://localhost:5000
- 🗄️ MongoDB: localhost:27017

### Dừng và xóa containers

```bash
# Dừng tất cả services
docker-compose down

# Dừng và xóa cả volumes (data)
docker-compose down -v
```

## 📦 Cấu trúc Docker

```
recipe/
├── docker-compose.yml          # Orchestrate tất cả services
├── Dockerfile                  # Frontend (Next.js)
├── .dockerignore              # Ignore files khi build frontend
└── backend/
    ├── Dockerfile.backend     # Backend (Express.js)
    └── .dockerignore         # Ignore files khi build backend
```

## 🔧 Services

### 1. MongoDB (mongodb)
- Image: mongo:7
- Port: 27017
- Username: admin
- Password: admin123
- Database: goiymonan

### 2. Backend API (backend)
- Build từ: ./backend/Dockerfile.backend
- Port: 5000
- Env: Production
- Kết nối MongoDB qua network nội bộ

### 3. Frontend (frontend)
- Build từ: ./Dockerfile
- Port: 3000
- Env: Production
- Standalone Next.js build

## ⚡ Tips

### Rebuild một service cụ thể
```bash
docker-compose up -d --build frontend
docker-compose up -d --build backend
```

### Xem resource usage
```bash
docker stats
```

### Truy cập vào container
```bash
docker exec -it recipe-frontend sh
docker exec -it recipe-backend sh
docker exec -it recipe-mongodb mongosh
```

### Clear tất cả và rebuild
```bash
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

## 🔒 Production Notes

Khi deploy production, nhớ thay đổi:
1. ✅ MongoDB credentials trong docker-compose.yml
2. ✅ JWT_SECRET trong environment variables
3. ✅ SMTP credentials
4. ✅ Sử dụng MongoDB Atlas thay vì local MongoDB
5. ✅ Enable HTTPS/SSL
6. ✅ Set proper CORS origins

## 🐛 Troubleshooting

### Port đã được sử dụng
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5000
netstat -ano | findstr :27017

# Hoặc thay đổi port trong docker-compose.yml
```

### Container không start
```bash
docker-compose logs backend
docker-compose logs frontend
```

### MongoDB connection failed
```bash
# Kiểm tra MongoDB có chạy không
docker-compose ps mongodb

# Restart MongoDB
docker-compose restart mongodb
```
