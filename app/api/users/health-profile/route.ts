import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

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

    const client = await clientPromise
    const db = client.db("recipe-app")

    // Tạo query filter - ưu tiên email nếu có, fallback sang userId
    let filter: any
    if (userEmail) {
      filter = { email: userEmail }
    } else {
      try {
        filter = { _id: new ObjectId(userId) }
      } catch (err) {
        return NextResponse.json(
          { success: false, error: "Invalid user ID format" },
          { status: 400 }
        )
      }
    }

    console.log("Update filter:", filter)

    // Cập nhật thông tin sức khỏe cho user
    const result = await db.collection("users").updateOne(
      filter,
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

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

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
