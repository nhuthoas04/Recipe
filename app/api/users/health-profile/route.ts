import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getDatabase } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, userEmail, age, healthConditions, dietaryPreferences } = body

    console.log("Health profile update request:", { userId, userEmail, age, healthConditions, dietaryPreferences })

    if ((!userId && !userEmail) || !age) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    
    // Debug: Log database name
    console.log("=== DEBUG Health Profile ===")
    console.log("Database name:", db.databaseName)
    
    // List all collections
    const collections = await db.listCollections().toArray()
    console.log("Collections:", collections.map(c => c.name))
    
    // Count users in collection
    const userCount = await db.collection("users").countDocuments()
    console.log("Total users in DB:", userCount)
    
    // Get sample users
    const allUsers = await db.collection("users").find({}).limit(5).toArray()
    console.log("Sample users:", allUsers.map(u => ({ id: u._id?.toString(), email: u.email })))
    
    // Thử tìm user bằng cả 2 cách
    if (userEmail) {
      const foundByEmail = await db.collection("users").findOne({ email: userEmail })
      console.log("Found by email:", foundByEmail ? "Yes" : "No")
    }
    if (userId) {
      try {
        const foundById = await db.collection("users").findOne({ _id: new ObjectId(userId) })
        console.log("Found by ID:", foundById ? "Yes" : "No")
      } catch (e) {
        console.log("Error finding by ID:", e)
      }
    }
    console.log("=== END DEBUG ===")

    // Tạo query filter - thử cả 2 nếu không tìm thấy bằng 1 cách
    let filter: any
    let existingUser = null
    
    // Ưu tiên tìm bằng email
    if (userEmail) {
      existingUser = await db.collection("users").findOne({ email: userEmail })
    }
    
    // Nếu không tìm thấy bằng email, thử bằng ID
    if (!existingUser && userId) {
      try {
        existingUser = await db.collection("users").findOne({ _id: new ObjectId(userId) })
      } catch (err) {
        // Invalid ObjectId format
      }
    }
    
    if (!existingUser) {
      console.log("User not found with email:", userEmail, "or ID:", userId)
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }
    
    // Cập nhật thông tin sức khỏe cho user
    const result = await db.collection("users").updateOne(
      { _id: existingUser._id },
      {
        $set: {
          age,
          healthConditions: healthConditions || [],
          dietaryPreferences: dietaryPreferences || [],
          hasCompletedHealthProfile: true,
          updatedAt: new Date(),
        },
      }
    )

    console.log("Update result:", result.matchedCount, "matched,", result.modifiedCount, "modified")

    return NextResponse.json({
      success: true,
      message: "Health profile updated successfully",
    })
  } catch (error: any) {
    console.error("Update health profile error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
