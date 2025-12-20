import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, age, healthConditions, dietaryPreferences } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing user ID" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("goiymonan")

    // Lấy tất cả recipes đã approved và chưa xóa
    const allRecipes = await db
      .collection("recipes")
      .find({ 
        status: { $in: ["approved", null] },
        isDeleted: { $ne: true }
      })
      .toArray()

    // Logic AI đơn giản để filter recipes phù hợp
    const recommendedRecipes = allRecipes
      .map((recipe) => {
        let score = 0
        const reasons = []

        // Kiểm tra health tags
        if (recipe.healthTags && dietaryPreferences) {
          const matchingHealthTags = recipe.healthTags.filter((tag: string) =>
            dietaryPreferences.some((pref: string) => 
              tag.toLowerCase().includes(pref.toLowerCase()) ||
              pref.toLowerCase().includes(tag.toLowerCase())
            )
          )
          if (matchingHealthTags.length > 0) {
            score += matchingHealthTags.length * 3
            reasons.push(`Phù hợp với chế độ ăn: ${matchingHealthTags.join(", ")}`)
          }
        }

        // Kiểm tra suitable for
        if (recipe.suitableFor && healthConditions) {
          const matchingSuitable = recipe.suitableFor.filter((condition: string) =>
            healthConditions.some((userCondition: string) =>
              condition.toLowerCase().includes(userCondition.toLowerCase()) ||
              userCondition.toLowerCase().includes(condition.toLowerCase())
            )
          )
          if (matchingSuitable.length > 0) {
            score += matchingSuitable.length * 5
            reasons.push(`Phù hợp cho: ${matchingSuitable.join(", ")}`)
          }
        }

        // Kiểm tra NOT suitable for - loại bỏ
        if (recipe.notSuitableFor && healthConditions) {
          const hasConflict = recipe.notSuitableFor.some((condition: string) =>
            healthConditions.some((userCondition: string) =>
              condition.toLowerCase().includes(userCondition.toLowerCase()) ||
              userCondition.toLowerCase().includes(condition.toLowerCase())
            )
          )
          if (hasConflict) {
            return null // Loại bỏ recipe này
          }
        }

        // Kiểm tra tuổi
        if (age) {
          if (age < 18 && recipe.suitableFor?.includes("Trẻ em")) {
            score += 2
            reasons.push("Phù hợp cho trẻ em")
          }
          if (age >= 60 && recipe.suitableFor?.includes("Người cao tuổi")) {
            score += 2
            reasons.push("Phù hợp cho người cao tuổi")
          }
        }

        // Kiểm tra calories (ví dụ: người béo phì nên ăn ít calo)
        if (healthConditions?.includes("Béo phì") || healthConditions?.includes("béo phì")) {
          if (recipe.nutrition && recipe.nutrition.calories < 500) {
            score += 2
            reasons.push("Ít calo")
          }
        }

        // Kiểm tra protein (ví dụ: người gầy nên ăn nhiều protein)
        if (healthConditions?.includes("Gầy") || healthConditions?.includes("gầy")) {
          if (recipe.nutrition && recipe.nutrition.protein > 30) {
            score += 2
            reasons.push("Giàu protein")
          }
        }

        return {
          ...recipe,
          _id: recipe._id.toString(),
          recommendationScore: score,
          recommendationReasons: reasons.length > 0 ? reasons : ["Công thức phổ biến"],
        }
      })
      .filter(Boolean)
      .sort((a: any, b: any) => {
        // Ưu tiên theo score, nếu bằng nhau thì theo likesCount
        if (b.recommendationScore !== a.recommendationScore) {
          return b.recommendationScore - a.recommendationScore
        }
        return (b.likesCount || 0) - (a.likesCount || 0)
      })
      .slice(0, 10) // Top 10 recommendations

    // Format recipes với likes và saves count từ database
    const formattedRecipes = recommendedRecipes.map((recipe: any) => ({
      id: recipe._id,
      name: recipe.name,
      description: recipe.description,
      image: recipe.image,
      category: recipe.category,
      cuisine: recipe.cuisine,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      nutrition: recipe.nutrition,
      tags: recipe.tags,
      healthTags: recipe.healthTags,
      suitableFor: recipe.suitableFor,
      notSuitableFor: recipe.notSuitableFor,
      recommendationScore: recipe.recommendationScore,
      recommendationReasons: recipe.recommendationReasons,
      likesCount: recipe.likesCount || 0,
      savesCount: recipe.savesCount || 0,
    }))

    return NextResponse.json({
      success: true,
      recipes: formattedRecipes,
      totalRecommendations: formattedRecipes.length,
    })
  } catch (error: any) {
    console.error("AI recommendation error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
