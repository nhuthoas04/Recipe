import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getDatabase } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { recipeId } = body

    if (!recipeId) {
      return NextResponse.json(
        { success: false, error: 'Missing recipe ID' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const recipesCollection = db.collection('recipes')

    // Khôi phục từ thùng rác
    await recipesCollection.updateOne(
      { _id: new ObjectId(recipeId) },
      { 
        $unset: { 
          isDeleted: "", 
          deletedAt: "" 
        } 
      }
    )

    return NextResponse.json({ 
      success: true,
      message: 'Recipe restored successfully' 
    })
  } catch (error) {
    console.error('Restore recipe error:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi khi khôi phục công thức' },
      { status: 500 }
    )
  }
}
