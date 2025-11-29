import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { getDatabase } from '@/lib/mongodb'

/**
 * GET /api/admin/users - Lấy danh sách tất cả users (Admin only)
 */
export async function GET(request: NextRequest) {
  // Kiểm tra quyền admin
  const adminCheck = requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const db = await getDatabase()
    const usersCollection = db.collection('users')

    // Lấy tất cả users (không trả về password)
    const users = await usersCollection
      .find({})
      .project({ password: 0 }) // Bỏ password
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      success: true,
      users: users.map(user => ({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role || 'user',
        isActive: user.isActive !== false, // Mặc định true
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      })),
      total: users.length,
    })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể lấy danh sách users' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/users - Cập nhật role hoặc trạng thái user (Admin only)
 */
export async function PATCH(request: NextRequest) {
  // Kiểm tra quyền admin
  const adminCheck = requireAdmin(request)
  if (adminCheck) return adminCheck

  try {
    const { userId, role, isActive } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Thiếu userId' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const usersCollection = db.collection('users')
    const { ObjectId } = require('mongodb')

    // Prepare update data
    const updateData: any = {}
    if (role !== undefined) {
      if (!['user', 'admin'].includes(role)) {
        return NextResponse.json(
          { success: false, error: 'Role không hợp lệ' },
          { status: 400 }
        )
      }
      updateData.role = role
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không có dữ liệu để cập nhật' },
        { status: 400 }
      )
    }

    // Cập nhật user
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy user' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật thành công',
    })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật user' },
      { status: 500 }
    )
  }
}
