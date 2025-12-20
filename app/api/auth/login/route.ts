import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getDatabase } from '@/lib/mongodb'

// Secret key để mã hóa JWT - nên lưu trong .env
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
const JWT_EXPIRES_IN = '7d' // Token hết hạn sau 7 ngày

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập đầy đủ thông tin' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const usersCollection = db.collection('users')

    // Find user by email
    const user = await usersCollection.findOne({ email })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Email hoặc mật khẩu không đúng' },
        { status: 401 }
      )
    }

    // Check if account is locked
    if (user.isActive === false) {
      return NextResponse.json(
        { success: false, error: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin.' },
        { status: 403 }
      )
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password as string)

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Email hoặc mật khẩu không đúng' },
        { status: 401 }
      )
    }

    // Cập nhật lastLogin
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    )

    // Return user info (without password)
    const userInfo = {
      id: user._id.toString(),
      _id: user._id.toString(), // MongoDB ObjectId
      email: user.email,
      name: user.name,
      role: user.role || 'user', // Mặc định là user nếu chưa có role
      createdAt: user.createdAt,
      age: user.age,
      healthConditions: user.healthConditions || [],
      dietaryPreferences: user.dietaryPreferences || [],
      hasCompletedHealthProfile: user.hasCompletedHealthProfile || false,
      savedRecipes: (user.savedRecipes || []).map((id: any) => id.toString()),
      likedRecipes: (user.likedRecipes || []).map((id: any) => id.toString()),
    }

    // Tạo JWT token
    // Token chứa thông tin user và có thời gian hết hạn
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role || 'user', // Thêm role vào token
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    // Tạo response với token trong cookie
    const response = NextResponse.json({
      success: true,
      user: userInfo,
      token, // Trả về token cho client
    })

    // Lưu token vào httpOnly cookie để bảo mật hơn
    // httpOnly: true -> JavaScript không thể truy cập cookie này (chống XSS)
    // secure: true -> Chỉ gửi cookie qua HTTPS (production)
    // sameSite: 'strict' -> Cookie chỉ gửi trong cùng domain (chống CSRF)
    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 ngày (giây)
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    
    // Log chi tiết lỗi để debug
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error details:', errorMessage)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Đã xảy ra lỗi khi đăng nhập',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}
