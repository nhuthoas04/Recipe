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

    console.log('[AI Recommendations API] User info:', {
      userId,
      age,
      healthConditionsCount: healthConditions?.length || 0,
      dietaryPreferencesCount: dietaryPreferences?.length || 0
    })

    const client = await clientPromise
    const db = client.db("goiymonan")
    const commentsCollection = db.collection("comments")

    // Lấy tất cả recipes đã approved và chưa xóa
    const allRecipes = await db
      .collection("recipes")
      .find({
        status: { $in: ["approved", null] },
        isDeleted: { $ne: true }
      })
      .toArray()

    console.log(`[AI Recommendations API] Found ${allRecipes.length} recipes`)

    // Helper function để matching linh hoạt hơn
    const matchesCondition = (recipeTag: string, userCondition: string): boolean => {
      const recipeTagLower = recipeTag.toLowerCase().trim()
      const userConditionLower = userCondition.toLowerCase().trim()
      
      // Exact match
      if (recipeTagLower === userConditionLower) return true
      
      // Partial match
      if (recipeTagLower.includes(userConditionLower) || userConditionLower.includes(recipeTagLower)) return true
      
      // Synonyms/Related terms
      const synonyms: { [key: string]: string[] } = {
        'tiểu đường': ['đái tháo đường', 'đường huyết cao', 'ít đường', 'không đường'],
        'cao huyết áp': ['huyết áp cao', 'ít muối', 'ít natri'],
        'cholesterol cao': ['mỡ máu cao', 'ít mỡ', 'không cholesterol'],
        'béo phì': ['giảm cân', 'ít calo', 'ít dầu mỡ'],
        'gầy': ['tăng cân', 'giàu protein', 'giàu calo'],
        'ăn chay': ['chay', 'không thịt', 'rau củ'],
      }
      
      for (const [key, values] of Object.entries(synonyms)) {
        if (userConditionLower.includes(key) && values.some(v => recipeTagLower.includes(v))) {
          return true
        }
        if (recipeTagLower.includes(key) && values.some(v => userConditionLower.includes(v))) {
          return true
        }
      }
      
      return false
    }

    // Logic AI để filter recipes phù hợp
    const recommendedRecipes = allRecipes
      .map((recipe) => {
        let score = 0
        const reasons = []

        // 1. KIỂM TRA LOẠI TRỪ TRƯỚC (notSuitableFor) - ƯU TIÊN CAO NHẤT
        if (recipe.notSuitableFor && healthConditions && healthConditions.length > 0) {
          const hasConflict = recipe.notSuitableFor.some((recipeCondition: string) =>
            healthConditions.some((userCondition: string) =>
              matchesCondition(recipeCondition, userCondition)
            )
          )
          if (hasConflict) {
            console.log(`[AI] Rejected recipe "${recipe.name}" due to notSuitableFor conflict`)
            return null // Loại bỏ recipe này ngay
          }
        }

        // 2. KIỂM TRA PHẦN PHÙNG HỢP (suitableFor) - ĐIỂM CAO
        if (recipe.suitableFor && healthConditions && healthConditions.length > 0) {
          const matchingSuitable = recipe.suitableFor.filter((recipeCondition: string) =>
            healthConditions.some((userCondition: string) =>
              matchesCondition(recipeCondition, userCondition)
            )
          )
          if (matchingSuitable.length > 0) {
            score += matchingSuitable.length * 10 // Tăng điểm từ 5 lên 10
            reasons.push(`Phù hợp cho: ${matchingSuitable.join(", ")}`)
          }
        }

        // 3. KIỂM TRA HEALTH TAGS (healthTags) - ĐIỂM TRUNG BÌNH
        if (recipe.healthTags && dietaryPreferences && dietaryPreferences.length > 0) {
          const matchingHealthTags = recipe.healthTags.filter((tag: string) =>
            dietaryPreferences.some((pref: string) =>
              matchesCondition(tag, pref)
            )
          )
          if (matchingHealthTags.length > 0) {
            score += matchingHealthTags.length * 5 // Tăng từ 3 lên 5
            reasons.push(`Đặc điểm: ${matchingHealthTags.join(", ")}`)
          }
        }

        // 4. KIỂM TRA TUỔI
        if (age) {
          if (age < 18 && recipe.suitableFor?.some((s: string) => 
            s.toLowerCase().includes('trẻ') || s.toLowerCase().includes('em')
          )) {
            score += 3
            reasons.push("Phù hợp cho trẻ em")
          }
          if (age >= 60 && recipe.suitableFor?.some((s: string) => 
            s.toLowerCase().includes('cao tuổi') || s.toLowerCase().includes('người già')
          )) {
            score += 3
            reasons.push("Phù hợp cho người cao tuổi")
          }
        }

        // 5. KIỂM TRA DINH DƯỠNG DỰA TRÊN BỆNH LÝ
        if (recipe.nutrition && healthConditions) {
          // Béo phì -> Ít calo
          if (healthConditions.some(c => matchesCondition('béo phì', c))) {
            if (recipe.nutrition.calories && recipe.nutrition.calories < 500) {
              score += 3
              reasons.push("Ít calo, phù hợp giảm cân")
            }
          }
          
          // Gầy -> Nhiều protein, nhiều calo
          if (healthConditions.some(c => matchesCondition('gầy', c))) {
            if (recipe.nutrition.protein && recipe.nutrition.protein > 30) {
              score += 3
              reasons.push("Giàu protein")
            }
            if (recipe.nutrition.calories && recipe.nutrition.calories > 600) {
              score += 2
              reasons.push("Giàu năng lượng")
            }
          }
          
          // Tiểu đường -> Ít carbs, ít đường
          if (healthConditions.some(c => matchesCondition('tiểu đường', c))) {
            if (recipe.nutrition.carbs && recipe.nutrition.carbs < 50) {
              score += 3
              reasons.push("Ít carbohydrate")
            }
          }
        }

        // Nếu không có lý do cụ thể, vẫn giữ lại nhưng điểm thấp
        if (score === 0) {
          score = 1
          reasons.push("Món ăn phổ biến")
        }

        return {
          ...recipe,
          _id: recipe._id.toString(),
          recommendationScore: score,
          recommendationReasons: reasons,
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
      .slice(0, 12) // Top 12 recommendations (tăng từ 10)

    console.log(`[AI Recommendations API] Returning ${recommendedRecipes.length} recommendations`)

    // Get comment counts for recommended recipes (batch query)
    const recipeIds = recommendedRecipes.map((r: any) => r._id)
    const commentCounts = await commentsCollection.aggregate([
      { $match: { recipeId: { $in: recipeIds } } },
      { $group: { _id: "$recipeId", count: { $sum: 1 } } }
    ]).toArray()

    const commentCountMap = new Map(
      commentCounts.map(c => [c._id, c.count])
    )

    // Format recipes với likes, saves và comments count
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
      commentsCount: commentCountMap.get(recipe._id) || 0,
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

