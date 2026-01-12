import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getDatabase } from '@/lib/mongodb'

const JWT_SECRET = process.env.JWT_SECRET || '8f9e7d6c5b4a3928171615141312111009080706050403020100abcdefghijklmnop'
const JWT_EXPIRES_IN = '7d'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập đầy đủ thông tin' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Email không hợp lệ' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu phải có ít nhất 6 ký tự' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const usersCollection = db.collection('users')

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email đã được sử dụng' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Kiểm tra xem có user nào trong DB chưa
    const userCount = await usersCollection.countDocuments()
    
    // User đầu tiên sẽ tự động là admin
    const role = userCount === 0 ? 'admin' : 'user'

    // Create new user
    const result = await usersCollection.insertOne({
      email,
      password: hashedPassword,
      name,
      role, // Thêm role
      isActive: true, // Mặc định active
      hasCompletedHealthProfile: false, // Chưa hoàn thành profile sức khỏe
      createdAt: new Date(),
      lastLogin: new Date(),
    })

    const userId = result.insertedId.toString()

    const user = {
      id: userId,
      _id: userId, // MongoDB ObjectId
      email,
      name,
      role, // Trả về role cho client
      createdAt: new Date().toISOString(),
      hasCompletedHealthProfile: false,
      age: undefined,
      healthConditions: [],
      dietaryPreferences: [],
    }

    console.log(`✅ Đăng ký thành công: ${email} - Role: ${role}${role === 'admin' ? ' 🔑 (Admin đầu tiên!)' : ''}`)

    // Tạo token ngay sau khi đăng ký
    const token = jwt.sign(
      {
        userId,
        email,
        name,
        role, // Thêm role vào token
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    const response = NextResponse.json({
      success: true,
      user,
      token,
    })

    // Lưu token vào cookie
    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 ngày
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi đăng ký' },
      { status: 500 }
    )
  }
}
