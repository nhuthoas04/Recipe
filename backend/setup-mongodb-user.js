// Script để tạo admin user trong MongoDB
// Chạy: mongosh < setup-mongodb-user.js

use admin

db.createUser({
  user: "admin",
  pwd: "adminpassword",
  roles: [
    { role: "userAdminAnyDatabase", db: "admin" },
    { role: "readWriteAnyDatabase", db: "admin" }
  ]
})

use recipe

db.createUser({
  user: "recipeuser",
  pwd: "recipepassword",
  roles: [
    { role: "readWrite", db: "recipe" }
  ]
})

print("✅ Đã tạo users thành công!")
print("Admin user: admin / adminpassword")
print("Recipe user: recipeuser / recipepassword")
