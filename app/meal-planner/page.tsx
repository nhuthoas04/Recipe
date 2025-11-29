"use client"

import { MealPlanner } from "@/components/meal/meal-planner"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function MealPlannerPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-1">
          <MealPlanner />
        </main>
        <Footer />
      </div>
    </AuthGuard>
  )
}
