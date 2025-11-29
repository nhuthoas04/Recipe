import { NextRequest, NextResponse } from 'next/server'

/**
 * API Logout - Xóa token khỏi cookie
 * POST /api/auth/logout
 */
export async function POST(request: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: 'Đăng xuất thành công',
  })

  // Xóa cookie bằng cách set maxAge = 0
  response.cookies.set({
    name: 'auth-token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0, // Xóa ngay lập tức
    path: '/',
  })

  return response
}
