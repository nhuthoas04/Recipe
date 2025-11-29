import express from 'express';
import MealPlan from '../models/MealPlan';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get meal plans for a date range
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query: any = { userId: req.user?.userId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const mealPlans = await MealPlan.find(query)
      .populate('meals.breakfast meals.lunch meals.dinner meals.snack')
      .sort({ date: 1 });

    res.json({ mealPlans });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update meal plan
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { date, meals } = req.body;

    // Check if meal plan exists for this date
    let mealPlan = await MealPlan.findOne({
      userId: req.user?.userId,
      date: new Date(date)
    });

    if (mealPlan) {
      // Update existing
      mealPlan.meals = meals;
      await mealPlan.save();
    } else {
      // Create new
      mealPlan = await MealPlan.create({
        userId: req.user?.userId,
        date: new Date(date),
        meals
      });
    }

    const populatedMealPlan = await MealPlan.findById(mealPlan._id)
      .populate('meals.breakfast meals.lunch meals.dinner meals.snack');

    res.json({
      message: 'Lưu kế hoạch ăn uống thành công',
      mealPlan: populatedMealPlan
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete meal plan
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const mealPlan = await MealPlan.findOne({
      _id: req.params.id,
      userId: req.user?.userId
    });

    if (!mealPlan) {
      return res.status(404).json({ message: 'Không tìm thấy kế hoạch ăn uống' });
    }

    await MealPlan.findByIdAndDelete(req.params.id);

    res.json({ message: 'Xóa kế hoạch ăn uống thành công' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
