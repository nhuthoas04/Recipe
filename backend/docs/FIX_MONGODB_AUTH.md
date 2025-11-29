# Fix MongoDB Authentication Error

## Vấn đề
```
MongoServerError: Command find requires authentication
```

MongoDB đang yêu cầu authentication nhưng connection string không có username/password.

## Giải pháp

### Cách 1: Sử dụng MongoDB với username/password (Recommended)

1. **Cập nhật file `.env`:**
```env
MONGODB_URI=mongodb://admin:adminpassword@localhost:27017/recipe?authSource=admin
JWT_SECRET=8f9e7d6c5b4a3928171615141312111009080706050403020100abcdefghijklmnop
```

2. **Tạo admin user trong MongoDB:**
```bash
# Kết nối MongoDB shell
mongosh

# Tạo admin user
use admin
db.createUser({
  user: "admin",
  pwd: "adminpassword",
  roles: ["root"]
})

# Exit
exit
```

3. **Restart dev server:**
```bash
pnpm dev
```

### Cách 2: Tắt authentication MongoDB (Chỉ dùng development)

1. **Tìm file config MongoDB:**
   - Windows: `C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg`
   - Mac/Linux: `/etc/mongod.conf`

2. **Comment dòng security:**
```yaml
# security:
#   authorization: enabled
```

3. **Restart MongoDB service:**
```bash
# Windows
net stop MongoDB
net start MongoDB

# Mac/Linux
sudo systemctl restart mongod
```

4. **Cập nhật `.env`:**
```env
MONGODB_URI=mongodb://localhost:27017/recipe
```

### Cách 3: Sử dụng MongoDB Atlas (Cloud - Free)

1. **Đăng ký MongoDB Atlas:** https://www.mongodb.com/cloud/atlas/register
2. **Tạo cluster miễn phí**
3. **Lấy connection string:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/recipe?retryWrites=true&w=majority
```

## Kiểm tra

Sau khi fix, restart dev server và thử login lại:
```bash
pnpm dev
```

Nếu thành công, sẽ thấy:
```
✓ Compiled /api/auth/login
POST /api/auth/login 200 in XXXms
```
