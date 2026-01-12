"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Search, CheckCircle, XCircle, Clock, Users, ArchiveX, RotateCcw } from "lucide-react"
import { RecipeFormDialog } from "@/components/recipe/recipe-form-dialog"
import { useRecipeStore } from "@/lib/recipe-store"
import type { Recipe } from "@/lib/types"
import toast, { Toaster } from 'react-hot-toast'

type TabType = "all" | "pending" | "approved" | "rejected" | "users" | "trash"

export default function AdminPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { recipes } = useRecipeStore()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>("all")
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([])
  const [usersList, setUsersList] = useState<any[]>([])

  // Load ALL recipes (including pending) từ API khi component mount
  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const res = await fetch('/api/recipes?includeAll=true')
        const data = await res.json()
        if (data.success) {
          setAllRecipes(data.recipes)
          useRecipeStore.setState({ recipes: data.recipes })
        }
      } catch (error) {
        console.error('Error loading recipes:', error)
      } finally {
        setLoading(false)
      }
    }
    loadRecipes()
  }, [])

  // Load users khi chuyển sang tab users
  useEffect(() => {
    if (activeTab === "users") {
      const loadUsers = async () => {
        try {
          const res = await fetch('/api/users')
          const data = await res.json()
          if (data.success) {
            setUsersList(data.users)
          }
        } catch (error) {
          console.error('Error loading users:', error)
        }
      }
      loadUsers()
    }
  }, [activeTab])

  // Redirect if not authenticated or not admin
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Truy cập bị từ chối</CardTitle>
              <CardDescription>Bạn không có quyền truy cập trang này</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/")} className="w-full">
                Về trang chủ
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  // Filter recipes theo tab và search
  const filteredRecipes = allRecipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Loại bỏ các recipe đã xóa (trong thùng rác) khỏi các tab khác
    const notInTrash = !recipe.isDeleted
    
    if (activeTab === "all") return matchesSearch && notInTrash
    if (activeTab === "pending") return matchesSearch && recipe.status === "pending" && notInTrash
    if (activeTab === "approved") return matchesSearch && (recipe.status === "approved" || !recipe.status) && notInTrash
    if (activeTab === "rejected") return matchesSearch && recipe.status === "rejected" && notInTrash
    if (activeTab === "trash") return matchesSearch && recipe.isDeleted
    
    return matchesSearch
  })

  const pendingCount = allRecipes.filter(r => r.status === "pending" && !r.isDeleted).length
  const approvedCount = allRecipes.filter(r => (r.status === "approved" || !r.status) && !r.isDeleted).length
  const rejectedCount = allRecipes.filter(r => r.status === "rejected" && !r.isDeleted).length
  const trashCount = allRecipes.filter(r => r.isDeleted).length

  const handleAddRecipe = () => {
    setEditingRecipe(null)
    setIsDialogOpen(true)
  }

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setIsDialogOpen(true)
  }

  const handleDeleteRecipe = async (recipeId: string, moveToTrash: boolean = true) => {
    // Hiển thị toast confirm
    const confirmDelete = window.confirm(
      moveToTrash 
        ? "Bạn có chắc muốn chuyển công thức này vào thùng rác?" 
        : "Bạn có chắc muốn xóa vĩnh viễn công thức này?"
    )
    if (!confirmDelete) return

    // Toast loading
    const loadingToast = toast.loading(moveToTrash ? "Đang chuyển vào thùng rác..." : "Đang xóa vĩnh viễn...")

    try {
      const response = await fetch(`/api/recipes?id=${recipeId}&moveToTrash=${moveToTrash}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Reload lại recipes để cập nhật trạng thái
        const res = await fetch('/api/recipes?includeAll=true')
        const data = await res.json()
        if (data.success) {
          setAllRecipes(data.recipes)
          useRecipeStore.setState({ recipes: data.recipes })
        }
        
        // Success toast
        toast.success(
          moveToTrash 
            ? "Đã chuyển vào thùng rác!" 
            : "Đã xóa vĩnh viễn!", 
          {
            id: loadingToast,
            duration: 3000,
          }
        )
      } else {
        toast.error("Lỗi khi xóa công thức", {
          id: loadingToast,
        })
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Đã xảy ra lỗi", {
        id: loadingToast,
      })
    }
  }

  const handleRestoreRecipe = async (recipeId: string) => {
    const loadingToast = toast.loading("Đang khôi phục...")
    
    try {
      const response = await fetch('/api/recipes/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId }),
      })

      if (response.ok) {
        // Reload lại recipes
        const res = await fetch('/api/recipes?includeAll=true')
        const data = await res.json()
        if (data.success) {
          setAllRecipes(data.recipes)
          useRecipeStore.setState({ recipes: data.recipes })
        }
        
        toast.success("Đã khôi phục công thức!", {
          id: loadingToast,
          duration: 3000,
        })
      } else {
        toast.error("Có lỗi xảy ra", { id: loadingToast })
      }
    } catch (error) {
      console.error("Restore error:", error)
      toast.error("Đã xảy ra lỗi", { id: loadingToast })
    }
  }

  const handleDialogClose = async () => {
    setIsDialogOpen(false)
    setEditingRecipe(null)
    
    // Reload recipes từ API sau khi thêm/sửa
    try {
      const res = await fetch('/api/recipes?includeAll=true')
      const data = await res.json()
      if (data.success) {
        setAllRecipes(data.recipes)
        useRecipeStore.setState({ recipes: data.recipes })
      }
    } catch (error) {
      console.error('Error reloading recipes:', error)
    }
  }

  const handleReviewRecipe = async (recipeId: string, action: "approve" | "reject") => {
    const note = action === "reject" ? prompt("Lý do từ chối (tùy chọn):") : ""
    
    const loadingToast = toast.loading(action === "approve" ? "Đang duyệt..." : "Đang từ chối...")
    
    try {
      const response = await fetch('/api/recipes/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId, action, note }),
      })

      if (response.ok) {
        // Cập nhật realtime
        const res = await fetch('/api/recipes?includeAll=true')
        const data = await res.json()
        if (data.success) {
          setAllRecipes(data.recipes)
          useRecipeStore.setState({ recipes: data.recipes })
        }
        
        toast.success(action === "approve" ? "Đã duyệt công thức!" : "Đã từ chối công thức!", {
          id: loadingToast,
          duration: 3000,
        })
      } else {
        toast.error("Có lỗi xảy ra", { id: loadingToast })
      }
    } catch (error) {
      console.error("Review error:", error)
      toast.error("Đã xảy ra lỗi", { id: loadingToast })
    }
  }

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    const loadingToast = toast.loading(isActive ? "Đang khóa tài khoản..." : "Đang mở khóa...")
    
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates: { isActive: !isActive } }),
      })

      if (response.ok) {
        // Cập nhật realtime
        setUsersList(prev => prev.map(u => 
          u.id === userId ? { ...u, isActive: !isActive } : u
        ))
        
        toast.success(isActive ? "Đã khóa tài khoản!" : "Đã mở khóa tài khoản!", {
          id: loadingToast,
          duration: 3000,
        })
      } else {
        toast.error("Có lỗi xảy ra", { id: loadingToast })
      }
    } catch (error) {
      console.error("Toggle user error:", error)
      toast.error("Đã xảy ra lỗi", { id: loadingToast })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa người dùng này?")
    if (!confirmDelete) return

    const loadingToast = toast.loading("Đang xóa...")

    try {
      const response = await fetch(`/api/users?userId=${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Xóa ngay khỏi state
        setUsersList(prev => prev.filter(u => u.id !== userId))
        
        toast.success("Đã xóa người dùng!", {
          id: loadingToast,
          duration: 3000,
        })
      } else {
        const data = await response.json()
        toast.error(data.error || "Có lỗi xảy ra", {
          id: loadingToast,
        })
      }
    } catch (error) {
      console.error("Delete user error:", error)
      toast.error("Đã xảy ra lỗi", {
        id: loadingToast,
      })
    }
  }

  return (
    <div className="min-h-screen">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Quản Trị Hệ Thống</h1>
            <p className="text-muted-foreground">
              Quản lý công thức, kiểm duyệt bài viết và người dùng
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b">
            <Button
              variant={activeTab === "all" ? "default" : "ghost"}
              onClick={() => setActiveTab("all")}
              className="rounded-b-none"
            >
              Tất Cả ({allRecipes.length})
            </Button>
            <Button
              variant={activeTab === "pending" ? "default" : "ghost"}
              onClick={() => setActiveTab("pending")}
              className="rounded-b-none"
            >
              <Clock className="h-4 w-4 mr-2" />
              Chờ Duyệt ({pendingCount})
            </Button>
            <Button
              variant={activeTab === "approved" ? "default" : "ghost"}
              onClick={() => setActiveTab("approved")}
              className="rounded-b-none"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Đã Duyệt ({approvedCount})
            </Button>
            <Button
              variant={activeTab === "rejected" ? "default" : "ghost"}
              onClick={() => setActiveTab("rejected")}
              className="rounded-b-none"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Từ Chối ({rejectedCount})
            </Button>
            <Button
              variant={activeTab === "trash" ? "default" : "ghost"}
              onClick={() => setActiveTab("trash")}
              className="rounded-b-none"
            >
              <ArchiveX className="h-4 w-4 mr-2" />
              Thùng Rác ({trashCount})
            </Button>
            <Button
              variant={activeTab === "users" ? "default" : "ghost"}
              onClick={() => setActiveTab("users")}
              className="rounded-b-none"
            >
              <Users className="h-4 w-4 mr-2" />
              Người Dùng
            </Button>
          </div>

          {/* Search (chỉ hiện khi không phải tab users) */}
          {activeTab !== "users" && (
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm công thức..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Recipe List hoặc User List */}
          {activeTab === "users" ? (
            <Card>
              <CardHeader>
                <CardTitle>Quản Lý Người Dùng</CardTitle>
                <CardDescription>
                  {usersList.length} người dùng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usersList.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{user.email}</h3>
                          {/* Hiển thị Role */}
                          {user.email === "admin@recipe.com" ? (
                            <Badge className="bg-red-500 hover:bg-red-600">Admin</Badge>
                          ) : user.role === "moderator" ? (
                            <Badge className="bg-blue-500 hover:bg-blue-600">Moderator</Badge>
                          ) : (
                            <Badge variant="secondary">User</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Đăng ký: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                        {user.isActive === false && (
                          <Badge variant="destructive" className="mt-1">Đã khóa</Badge>
                        )}
                      </div>
                      {user.email !== "admin@recipe.com" && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleUserStatus(user.id, user.isActive !== false)}
                          >
                            {user.isActive !== false ? "Khóa" : "Mở khóa"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  {usersList.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      Chưa có người dùng nào
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Danh Sách Công Thức</CardTitle>
                <CardDescription>
                  {filteredRecipes.length} công thức
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <img 
                          src={recipe.image || '/placeholder.svg'} 
                          alt={recipe.name}
                          className="w-16 h-16 bg-muted rounded-md object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{recipe.name}</h3>
                            {recipe.status === "pending" && (
                              <Badge variant="outline" className="bg-yellow-50">
                                <Clock className="h-3 w-3 mr-1" />
                                Chờ duyệt
                              </Badge>
                            )}
                            {recipe.status === "approved" && (
                              <Badge variant="outline" className="bg-green-50">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Đã duyệt
                              </Badge>
                            )}
                            {recipe.status === "rejected" && (
                              <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                Từ chối
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {recipe.description}
                          </p>
                          {recipe.authorEmail && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Đăng bởi: {recipe.authorEmail}
                            </p>
                          )}
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {recipe.category}
                            </span>
                            <span className="text-xs bg-secondary px-2 py-1 rounded">
                              {recipe.cuisine}
                            </span>
                            <span className="text-xs bg-muted px-2 py-1 rounded">
                              {recipe.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {activeTab === "trash" ? (
                          // Nút trong thùng rác
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                              onClick={() => handleRestoreRecipe(recipe.id)}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Khôi phục
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteRecipe(recipe.id, false)}
                              title="Xóa vĩnh viễn"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          // Nút bình thường
                          <>
                            {recipe.status === "pending" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                  onClick={() => handleReviewRecipe(recipe.id, "approve")}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Duyệt
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                  onClick={() => handleReviewRecipe(recipe.id, "reject")}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Từ chối
                                </Button>
                              </>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditRecipe(recipe)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteRecipe(recipe.id, true)}
                              title="Chuyển vào thùng rác"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  {filteredRecipes.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      Không tìm thấy công thức nào
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <RecipeFormDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        recipe={editingRecipe}
      />
    </div>
  )
}
