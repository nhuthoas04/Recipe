"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import { X, Clock, Users, ChefHat, Plus, Send, Trash2, Edit2, MessageCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import type { Recipe, Comment } from "@/lib/types"
import { useAuthStore } from "@/lib/auth-store"
import toast from "react-hot-toast"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"

interface RecipeDetailDialogProps {
  recipe: Recipe | null
  onClose: () => void
}

export function RecipeDetailDialog({ recipe, onClose }: RecipeDetailDialogProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [loading, setLoading] = useState(false)

  // Load comments
  useEffect(() => {
    if (recipe?.id) {
      loadComments()
    }
  }, [recipe?.id])

  const loadComments = async () => {
    if (!recipe?.id) return
    try {
      const res = await fetch(`/api/comments?recipeId=${recipe.id}`)
      const data = await res.json()
      if (data.success) {
        setComments(data.comments)
      }
    } catch (error) {
      console.error("Error loading comments:", error)
    }
  }
  
  if (!recipe) return null

  const totalTime = recipe.prepTime + recipe.cookTime

  const handleAddToMealPlan = () => {
    onClose()
    router.push("/meal-planner")
  }

  const handleSubmitComment = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Vui lòng đăng nhập để bình luận")
      return
    }

    if (!newComment.trim()) {
      toast.error("Vui lòng nhập nội dung bình luận")
      return
    }

    setLoading(true)
    const loadingToast = toast.loading("Đang gửi bình luận...")

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId: recipe.id,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          content: newComment,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setComments([data.comment, ...comments])
        setNewComment("")
        toast.success("Đã gửi bình luận!", { id: loadingToast })
      } else {
        toast.error(data.error || "Lỗi khi gửi bình luận", { id: loadingToast })
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi", { id: loadingToast })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return

    const loadingToast = toast.loading("Đang xóa...")

    try {
      const isAdmin = user?.email === "admin@recipe.com"
      console.log("Delete comment attempt:", { 
        commentId, 
        userId: user?.id, 
        userEmail: user?.email,
        isAdmin 
      })
      
      const res = await fetch(`/api/comments?id=${commentId}&userId=${user?.id}&userEmail=${user?.email}`, {
        method: "DELETE",
      })

      const data = await res.json()
      console.log("Delete response:", data)
      
      if (data.success) {
        setComments(comments.filter((c) => c.id !== commentId))
        toast.success("Đã xóa bình luận!", { id: loadingToast })
      } else {
        toast.error(data.error || "Lỗi khi xóa bình luận", { id: loadingToast })
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Đã xảy ra lỗi", { id: loadingToast })
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) {
      toast.error("Vui lòng nhập nội dung")
      return
    }

    const loadingToast = toast.loading("Đang cập nhật...")

    try {
      const res = await fetch("/api/comments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId,
          userId: user?.id,
          content: editContent,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setComments(
          comments.map((c) =>
            c.id === commentId ? { ...c, content: editContent, updatedAt: new Date() } : c
          )
        )
        setEditingCommentId(null)
        setEditContent("")
        toast.success("Đã cập nhật bình luận!", { id: loadingToast })
      } else {
        toast.error(data.error || "Lỗi khi cập nhật", { id: loadingToast })
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi", { id: loadingToast })
    }
  }

  return (
    <Dialog open={!!recipe} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] w-[90vw] max-h-[90vh] p-0 gap-0" showCloseButton={false}>
        <div className="grid grid-cols-[minmax(600px,1fr)_400px] h-[90vh]">
          {/* Left: Recipe Details - Minimum 600px width */}
          <div className="overflow-hidden border-r bg-background">
            <ScrollArea className="h-full">
              <div className="relative aspect-[16/9] w-full">
                <Image src={recipe.image || "/placeholder.svg"} alt={recipe.name} fill className="object-cover" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-background/80 backdrop-blur hover:bg-background z-10"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
            <DialogHeader>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <DialogTitle className="text-3xl font-bold text-balance">{recipe.name}</DialogTitle>
                  <Badge variant="secondary">{recipe.cuisine}</Badge>
                </div>
                <p className="text-muted-foreground text-pretty">{recipe.description}</p>
              </div>
            </DialogHeader>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  <strong>Tổng thời gian:</strong> {totalTime} phút
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  <strong>Khẩu phần:</strong> {recipe.servings} người
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ChefHat className="h-4 w-4 text-muted-foreground" />
                <span>
                  <strong>Độ khó:</strong> {recipe.difficulty}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Thông tin sức khỏe */}
            {(recipe.healthTags || recipe.suitableFor || recipe.notSuitableFor) && (
              <div className="rounded-lg border bg-purple-50/50 p-4 space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  🏥 Thông Tin Sức Khỏe
                  <span className="text-xs text-muted-foreground font-normal">
                    Giúp người dùng tìm món ăn phù hợp với tình trạng sức khỏe
                  </span>
                </h3>

                {/* Đặc điểm dinh dưỡng */}
                {recipe.healthTags && recipe.healthTags.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Đặc điểm dinh dưỡng
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recipe.healthTags.map((tag) => (
                        <Badge key={tag} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Phù hợp cho */}
                {recipe.suitableFor && recipe.suitableFor.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-green-700 mb-2">
                      ✓ Phù hợp cho
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recipe.suitableFor.map((tag) => (
                        <Badge key={tag} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Không phù hợp cho */}
                {recipe.notSuitableFor && recipe.notSuitableFor.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-red-700 mb-2">
                      ✗ Không phù hợp cho
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recipe.notSuitableFor.map((tag) => (
                        <Badge key={tag} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Separator />

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">Nguyên Liệu</h3>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-1">•</span>
                      <span>
                        <strong>{ingredient.name}:</strong> {ingredient.amount} {ingredient.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {recipe.nutrition && (
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold">Dinh Dưỡng</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Calories</p>
                      <p className="text-lg font-semibold">{recipe.nutrition.calories} kcal</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Protein</p>
                      <p className="text-lg font-semibold">{recipe.nutrition.protein}g</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Carbs</p>
                      <p className="text-lg font-semibold">{recipe.nutrition.carbs}g</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Chất béo</p>
                      <p className="text-lg font-semibold">{recipe.nutrition.fat}g</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Cách Làm</h3>
              <ol className="space-y-3">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleAddToMealPlan}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm Vào Thực Đơn
              </Button>
            </div>
              </div>
            </ScrollArea>
          </div>

          {/* Right: Comments Section - Fixed 400px */}
          <div className="flex flex-col bg-background">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Bình luận ({comments.length})
              </h3>
            </div>

            {/* Comments List */}
            <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12">
                  <MessageCircle className="h-16 w-16 mb-3 opacity-20" />
                  <p className="text-sm font-medium">Chưa có bình luận nào</p>
                  <p className="text-xs mt-1">Hãy là người đầu tiên bình luận!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                            {comment.userName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{comment.userName}</p>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.createdAt), {
                                addSuffix: true,
                                locale: vi,
                              })}
                              {comment.updatedAt && <span className="ml-1">(đã sửa)</span>}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isAuthenticated && user && (
                        <>
                          {/* Chỉ chủ comment mới thấy nút sửa */}
                          {comment.userId === user.id && (
                            <div className="flex gap-1 shrink-0">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 hover:bg-primary/10"
                                onClick={() => {
                                  setEditingCommentId(comment.id)
                                  setEditContent(comment.content)
                                }}
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteComment(comment.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          )}
                          
                          {/* Admin thấy nút xóa cho tất cả comment (nhưng không sửa được) */}
                          {comment.userId !== user.id && user.email === "admin@recipe.com" && (
                            <div className="flex gap-1 shrink-0">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteComment(comment.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {editingCommentId === comment.id ? (
                      <div className="mt-2 space-y-2">
                        <Input
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          placeholder="Sửa bình luận..."
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleEditComment(comment.id)}
                          >
                            Lưu
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingCommentId(null)
                              setEditContent("")
                            }}
                          >
                            Hủy
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm mt-2 break-words">{comment.content}</p>
                    )}
                  </div>
                ))
              )}
              </div>
            </ScrollArea>

            {/* Comment Input */}
            <div className="p-4 border-t bg-background">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Viết bình luận..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmitComment()
                      }
                    }}
                    disabled={loading}
                  />
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={handleSubmitComment}
                    disabled={loading || !newComment.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Gửi
                  </Button>
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  <p>Vui lòng đăng nhập để bình luận</p>
                  <Button
                    size="sm"
                    variant="link"
                    onClick={() => {
                      onClose()
                      router.push("/login")
                    }}
                  >
                    Đăng nhập
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
