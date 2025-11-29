"use client"

import { useState, useEffect } from "react"
import { RecipeCard } from "@/components/recipe/recipe-card"
import { RecipeDetailDialog } from "@/components/recipe/recipe-detail-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles } from "lucide-react"
import type { Recipe } from "@/lib/types"

interface AIRecommendationsProps {
  userId: string
  age?: number
  healthConditions?: string[]
  dietaryPreferences?: string[]
}

export function AIRecommendations({ userId, age, healthConditions, dietaryPreferences }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  useEffect(() => {
    loadRecommendations()
  }, [userId, age, healthConditions, dietaryPreferences])

  const loadRecommendations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/ai-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          age,
          healthConditions: healthConditions || [],
          dietaryPreferences: dietaryPreferences || [],
        }),
      })

      const data = await response.json()
      if (data.success) {
        setRecommendations(data.recommendations)
      }
    } catch (error) {
      console.error('Load recommendations error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <CardTitle>Gợi Ý Dành Riêng Cho Bạn</CardTitle>
          </div>
          <CardDescription>Đang tải gợi ý...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500 animate-pulse" />
          <CardTitle className="text-purple-900">Gợi Ý Dành Riêng Cho Bạn</CardTitle>
        </div>
        <CardDescription className="text-purple-700">
          {recommendations.length} món ăn phù hợp với tình trạng sức khỏe của bạn
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recommendations.map((recipe) => (
            <RecipeCard 
              key={recipe.id} 
              recipe={recipe} 
              onClick={() => setSelectedRecipe(recipe)}
            />
          ))}
        </div>
      </CardContent>
      
      <RecipeDetailDialog 
        recipe={selectedRecipe} 
        onClose={() => setSelectedRecipe(null)} 
      />
    </Card>
  )
}
