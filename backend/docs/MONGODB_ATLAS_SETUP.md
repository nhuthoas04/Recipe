# Setup MongoDB Atlas - Hướng dẫn chi tiết

MongoDB Atlas là dịch vụ MongoDB cloud miễn phí, không cần cài đặt gì cả!

## 🚀 Bước 1: Tạo tài khoản MongoDB Atlas

1. **Truy cập:** https://www.mongodb.com/cloud/atlas/register
2. **Đăng ký** bằng Google hoặc Email
3. **Xác nhận email** (check hộp thư)

---

## 📦 Bước 2: Tạo Cluster (Database)

1. **Chọn Plan:**
   - Click "Create" hoặc "Build a Database"
   - Chọn **"M0 Free"** (512MB storage miễn phí)
   - Provider: **AWS** hoặc **Google Cloud**
   - Region: Chọn gần Việt Nam nhất (Singapore, Hong Kong)
   - Cluster Name: `Cluster0` (mặc định)
   - Click **"Create Cluster"**

2. **Đợi 1-3 phút** để cluster được tạo (có thanh loading)

---

## 🔐 Bước 3: Tạo Database User

1. **Security → Database Access** (menu bên trái)
2. Click **"Add New Database User"**
3. **Authentication Method:** Password
4. **Username:** `admin` (hoặc tên bạn muốn)
5. **Password:** Click "Autogenerate Secure Password" hoặc tự đặt
   - ⚠️ **LƯU LẠI PASSWORD NÀY!**
6. **Database User Privileges:** Read and write to any database
7. Click **"Add User"**

---

## 🌐 Bước 4: Cho phép IP truy cập

1. **Security → Network Access** (menu bên trái)
2. Click **"Add IP Address"**
3. **Chọn một trong hai:**
   
   **Option A: Allow từ mọi nơi (Đơn giản - Development)**
   - Click **"Allow Access from Anywhere"**
   - IP Address: `0.0.0.0/0`
   - Click **"Confirm"**
   
   **Option B: Chỉ IP hiện tại (An toàn hơn)**
   - Click **"Add Current IP Address"**
   - Click **"Confirm"**

---

## 🔗 Bước 5: Lấy Connection String

1. **Database → Clusters** (menu bên trái)
2. Click nút **"Connect"** ở cluster của bạn
3. Chọn **"Connect your application"**
4. **Driver:** Node.js
5. **Version:** 6.8 or later
6. **Copy connection string**, ví dụ:
   ```
   mongodb+srv://admin:<password>@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
   ```

7. **Thay thế `<password>`** bằng password thật:
   ```
   mongodb+srv://admin:MyPassword123@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
   ```

8. **Thêm database name** (recipe):
   ```
   mongodb+srv://admin:MyPassword123@cluster0.abc123.mongodb.net/recipe?retryWrites=true&w=majority
   ```

---

## ⚙️ Bước 6: Cập nhật `.env` trong project

1. **Mở file `.env`** trong project
2. **Paste connection string:**

```env
MONGODB_URI=mongodb+srv://admin:MyPassword123@cluster0.abc123.mongodb.net/recipe?retryWrites=true&w=majority

JWT_SECRET=8f9e7d6c5b4a3928171615141312111009080706050403020100abcdefghijklmnop
```

⚠️ **Lưu ý:**
- Thay `admin:MyPassword123` bằng username/password của bạn
- Thay `cluster0.abc123` bằng cluster name của bạn
- Đảm bảo có `/recipe` trước `?retryWrites`

---

## 🧪 Bước 7: Test kết nối

1. **Restart dev server:**
```powershell
# Dừng server (Ctrl+C hoặc)
Stop-Process -Name node -Force

# Start lại
pnpm dev
```

2. **Mở browser:** http://localhost:3000
3. **Thử đăng nhập hoặc đăng ký**
4. **Check terminal logs:**

✅ **Thành công:**
```
✓ Compiled /api/auth/login
POST /api/auth/login 200 in XXXms
```

❌ **Lỗi:**
```
MongoServerError: bad auth
```
→ Username/password sai, kiểm tra lại

```
MongoServerError: IP not whitelisted
```
→ Chưa add IP trong Network Access

---

## 📊 Bước 8: Xem data trên Atlas (Optional)

1. **Database → Browse Collections**
2. Sẽ thấy các collections:
   - `users` - Danh sách users
   - `recipes` - Món ăn
   - `meal_plans` - Kế hoạch ăn uống
   - `shopping_lists` - Danh sách mua sắm
3. Click vào collection để xem data

---

## 🔒 Bảo mật

### ✅ Do:
- Sử dụng password mạnh (ít nhất 12 ký tự)
- Giới hạn IP nếu có thể (không dùng 0.0.0.0/0 trên production)
- Không commit file `.env` lên GitHub
- Sử dụng environment variables trên hosting

### ❌ Don't:
- Không share connection string công khai
- Không dùng password đơn giản (123456, password, etc.)
- Không hardcode connection string trong code

---

## 📝 Connection String Format

```
mongodb+srv://<username>:<password>@<cluster>.<id>.mongodb.net/<database>?<options>
```

**Ví dụ thực tế:**
```
mongodb+srv://recipeuser:Abc123456@recipecluster.x7y8z9.mongodb.net/recipe?retryWrites=true&w=majority
```

**Giải thích:**
- `recipeuser` - Username
- `Abc123456` - Password
- `recipecluster.x7y8z9` - Cluster hostname
- `recipe` - Database name
- `retryWrites=true&w=majority` - Options

---

## 🆘 Troubleshooting

### Lỗi: "bad auth" / "Authentication failed"
**Nguyên nhân:** Username hoặc password sai

**Giải pháp:**
1. Vào **Security → Database Access**
2. Click **Edit** user
3. Click **Edit Password** → Generate new password
4. Copy password mới
5. Update `.env` với password mới

---

### Lỗi: "IP not whitelisted"
**Nguyên nhân:** IP của bạn chưa được cho phép

**Giải pháp:**
1. Vào **Security → Network Access**
2. Click **Add IP Address**
3. Chọn **Allow Access from Anywhere** (0.0.0.0/0)
4. Hoặc **Add Current IP Address**

---

### Lỗi: "connect ECONNREFUSED"
**Nguyên nhân:** Connection string sai format

**Giải pháp:**
1. Check lại connection string
2. Đảm bảo có `mongodb+srv://` (không phải `mongodb://`)
3. Đảm bảo có database name: `/recipe?retryWrites...`
4. Không có ký tự đặc biệt trong password (nếu có, cần encode)

---

### Password có ký tự đặc biệt
Nếu password có ký tự như `@`, `#`, `%`, cần encode:

**Ví dụ:** Password là `P@ssw0rd!`

**Encode:** Vào https://www.urlencoder.org/
```
P@ssw0rd! → P%40ssw0rd%21
```

**Connection string:**
```
mongodb+srv://admin:P%40ssw0rd%21@cluster0.abc.mongodb.net/recipe
```

---

## 💡 Tips

1. **Free tier limits:**
   - 512MB storage
   - Shared RAM & CPU
   - Đủ cho development và small projects

2. **Backup tự động:**
   - Atlas tự động backup mỗi ngày
   - Có thể restore trong 7 ngày gần nhất

3. **Monitor:**
   - Vào **Metrics** tab để xem:
     - Connection count
     - Query performance
     - Storage usage

4. **Collections:**
   - Sẽ tự động tạo khi insert data lần đầu
   - Không cần tạo trước

---

## ✅ Checklist

- [ ] Đã tạo tài khoản MongoDB Atlas
- [ ] Đã tạo cluster (M0 Free)
- [ ] Đã tạo database user với password
- [ ] Đã add IP address (0.0.0.0/0)
- [ ] Đã lấy connection string
- [ ] Đã thay `<password>` bằng password thật
- [ ] Đã thêm `/recipe` vào connection string
- [ ] Đã update file `.env`
- [ ] Đã restart dev server
- [ ] Đã test login/register thành công
- [ ] Đã check data trên Atlas Browse Collections

---

## 🎉 Hoàn thành!

Bây giờ app của bạn đã connect với MongoDB Atlas cloud!

**Ưu điểm:**
- ✅ Không cần cài MongoDB local
- ✅ Truy cập từ mọi nơi
- ✅ Miễn phí 512MB
- ✅ Backup tự động
- ✅ Deploy dễ dàng (Vercel, Netlify, etc.)

**Next steps:**
- Import data cũ từ local MongoDB (nếu có)
- Setup indexes để tăng performance
- Monitor usage trong Atlas dashboard
