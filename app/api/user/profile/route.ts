import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

/**
 * API protected - Chỉ user đã đăng nhập mới truy cập được
 * Ví dụ: GET /api/user/profile
 */
export async function GET(request: NextRequest) {
  // Verify token
  const tokenPayload = verifyToken(request)

  if (!tokenPayload) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Vui lòng đăng nhập' },
      { status: 401 }
    )
  }

  // Token hợp lệ, trả về thông tin user
  return NextResponse.json({
    success: true,
    user: {
      id: tokenPayload.userId,
      email: tokenPayload.email,
      name: tokenPayload.name,
    },
    message: 'Đã xác thực thành công',
  })
}
