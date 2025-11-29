"use client"

import { ShoppingList } from "@/components/shopping/shopping-list"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function ShoppingListPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-1">
          <ShoppingList />
        </main>
        <Footer />
      </div>
    </AuthGuard>
  )
}
