import express from 'express';
import Recipe from '../models/Recipe';
import { authenticate, authorizeAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all recipes
router.get('/', async (req, res) => {
  try {
    const { status, includeAll } = req.query;
    
    let query: any = {};
    
    // If not includeAll, only show approved recipes
    if (includeAll !== 'true') {
      query.status = 'approved';
    } else if (status) {
      query.status = status;
    }

    const recipes = await Recipe.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.json({ recipes });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get single recipe
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('author', 'name email');

    if (!recipe) {
      return res.status(404).json({ message: 'Không tìm thấy công thức' });
    }

    res.json({ recipe });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create recipe
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const recipeData = {
      ...req.body,
      author: req.user?.userId,
      status: req.user?.role === 'admin' ? 'approved' : 'pending'
    };

    const recipe = await Recipe.create(recipeData);
    const populatedRecipe = await Recipe.findById(recipe._id)
      .populate('author', 'name email');

    res.status(201).json({
      message: 'Tạo công thức thành công',
      recipe: populatedRecipe
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update recipe
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Không tìm thấy công thức' });
    }

    // Check authorization
    if (recipe.author.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa công thức này' });
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('author', 'name email');

    res.json({
      message: 'Cập nhật công thức thành công',
      recipe: updatedRecipe
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete recipe
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Không tìm thấy công thức' });
    }

    // Check authorization
    if (recipe.author.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền xóa công thức này' });
    }

    await Recipe.findByIdAndDelete(req.params.id);

    res.json({ message: 'Xóa công thức thành công' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Review recipe (admin only)
router.post('/:id/review', authenticate, authorizeAdmin, async (req: AuthRequest, res) => {
  try {
    const { status, reviewNote } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status không hợp lệ' });
    }

    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { status, reviewNote },
      { new: true }
    ).populate('author', 'name email');

    if (!recipe) {
      return res.status(404).json({ message: 'Không tìm thấy công thức' });
    }

    res.json({
      message: `Đã ${status === 'approved' ? 'duyệt' : 'từ chối'} công thức`,
      recipe
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
