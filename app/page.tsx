"use client"

import { useEffect, useState } from "react"
import { RecipeBrowser } from "@/components/recipe/recipe-browser"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HealthProfileDialog } from "@/components/health-profile-dialog"
import { useAuthStore } from "@/lib/auth-store"

export default function HomePage() {
  const { user, isAuthenticated } = useAuthStore()
  const [showHealthDialog, setShowHealthDialog] = useState(false)

  useEffect(() => {
    console.log("HomePage - checking health profile:", {
      isAuthenticated,
      userEmail: user?.email,
      hasCompletedHealthProfile: user?.hasCompletedHealthProfile
    })
    
    // Chỉ hiện dialog nếu user đã đăng nhập, không phải admin, và chưa hoàn thành health profile
    if (isAuthenticated && user && user.email !== "admin@recipe.com") {
      // Kiểm tra localStorage để đảm bảo không bị miss data
      const hasCompleted = user.hasCompletedHealthProfile === true
      
      if (!hasCompleted) {
        setShowHealthDialog(true)
      } else {
        setShowHealthDialog(false)
      }
    } else {
      setShowHealthDialog(false)
    }
  }, [isAuthenticated, user])

  const handleHealthProfileComplete = () => {
    setShowHealthDialog(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <RecipeBrowser />
      </main>
      <Footer />
      
      {/* Modal thông tin sức khỏe */}
      <HealthProfileDialog 
        open={showHealthDialog} 
        onComplete={handleHealthProfileComplete} 
      />
    </div>
  )
}
