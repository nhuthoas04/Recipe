import express, { Request, Response } from 'express';
import User from '../models/User';
import { authenticate, authorizeAdmin, AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { sendResetPasswordEmail } from '../services/emailService';

const router = express.Router();

// Constants
const RESET_PASSWORD_TTL_MS = 1 * 60 * 1000; // 1 phút
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 giây

// Get all users (admin only)
router.get('/', authenticate, authorizeAdmin, async (req: AuthRequest, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle user active status (admin only)
router.patch('/:id/toggle-active', authenticate, authorizeAdmin, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `Đã ${user.isActive ? 'mở khóa' : 'khóa'} tài khoản`,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticate, authorizeAdmin, async (req: AuthRequest, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user?.userId) {
      return res.status(400).json({ message: 'Không thể xóa chính mình' });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    res.json({ message: 'Xóa user thành công' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Cập nhật health profile
router.post('/health-profile', async (req: Request, res: Response) => {
  try {
    const { userId, userEmail, age, healthConditions, dietaryPreferences } = req.body

    console.log('Health profile update request:', { userId, userEmail, age, healthConditions, dietaryPreferences })

    if ((!userId && !userEmail) || !age) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      })
    }

    // Tìm user bằng email hoặc userId
    const user = await User.findOne(
      userEmail ? { email: userEmail } : { _id: userId }
    )

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    console.log('Found user:', user.email)

    // Cập nhật thông tin sức khỏe
    user.age = age
    user.healthConditions = healthConditions || []
    user.dietaryPreferences = dietaryPreferences || []
    user.hasCompletedHealthProfile = true
    await user.save()

    console.log('Health profile updated successfully')

    res.json({
      success: true,
      message: 'Health profile updated successfully',
    })
  } catch (error: any) {
    console.error('Update health profile error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// POST - AI recommendations
router.post('/ai-recommendations', async (req: Request, res: Response) => {
  try {
    const { userId, age, healthConditions, dietaryPreferences } = req.body

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing user ID'
      })
    }

    // CHỈ lấy recipes đã approved và chưa xóa cho tất cả users (kể cả admin)
    const Recipe = mongoose.connection.collection('recipes')
    const allRecipes = await Recipe.find({ 
      status: { $in: ['approved', null] },
      isDeleted: { $ne: true }
    }).toArray()

    // Logic AI để filter recipes phù hợp
    const recommendedRecipes = allRecipes
      .map((recipe: any) => {
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
            reasons.push(`Phù hợp với chế độ ăn: ${matchingHealthTags.join(', ')}`)
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
            reasons.push(`Phù hợp cho: ${matchingSuitable.join(', ')}`)
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
            return null
          }
        }

        // Kiểm tra tuổi
        if (age) {
          if (age < 18 && recipe.suitableFor?.includes('Trẻ em')) {
            score += 2
            reasons.push('Phù hợp cho trẻ em')
          }
          if (age >= 60 && recipe.suitableFor?.includes('Người cao tuổi')) {
            score += 2
            reasons.push('Phù hợp cho người cao tuổi')
          }
        }

        // Kiểm tra calories
        if (healthConditions?.includes('Béo phì')) {
          if (recipe.nutrition && recipe.nutrition.calories < 500) {
            score += 2
            reasons.push('Ít calo')
          }
        }

        // Kiểm tra protein
        if (healthConditions?.includes('Gầy')) {
          if (recipe.nutrition && recipe.nutrition.protein > 30) {
            score += 2
            reasons.push('Giàu protein')
          }
        }

        return score > 0
          ? {
              ...recipe,
              id: recipe._id.toString(),
              _id: undefined,
              recommendationScore: score,
              recommendationReasons: reasons,
            }
          : null
      })
      .filter((recipe: any) => recipe !== null)
      .sort((a: any, b: any) => b.recommendationScore - a.recommendationScore)
      .slice(0, 10)

    res.json({
      success: true,
      recommendations: recommendedRecipes,
    })
  } catch (error: any) {
    console.error('AI recommendations error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// POST - Yêu cầu đặt lại mật khẩu (gửi mã xác thực)
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Vui lòng cung cấp email' 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+resetPasswordCode +resetPasswordExpires +lastResetPasswordEmailSentAt');

    if (!user) {
      // Không tiết lộ email có tồn tại hay không để bảo mật
      return res.json({
        success: true,
        message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được mã xác thực trong vài phút.'
      });
    }

    const now = Date.now();

    // Không cho spam: mỗi 60s gửi 1 lần
    if (user.lastResetPasswordEmailSentAt &&
        now - user.lastResetPasswordEmailSentAt.getTime() < RESEND_COOLDOWN_MS) {
      const wait = Math.ceil((RESEND_COOLDOWN_MS - (now - user.lastResetPasswordEmailSentAt.getTime())) / 1000);
      return res.status(429).json({ 
        success: false, 
        error: `Vui lòng đợi ${wait}s để gửi lại mã` 
      });
    }

    // Tạo mã xác thực 6 số
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = new Date(now + RESET_PASSWORD_TTL_MS);
    user.lastResetPasswordEmailSentAt = new Date(now);

    await user.save();

    try {
      await sendResetPasswordEmail(user.email, user.name, resetCode);
      console.log(`✉️ Đã gửi mã đặt lại mật khẩu đến: ${user.email}`);
    } catch (err) {
      console.error('Không thể gửi email đặt lại mật khẩu:', err);
      return res.status(500).json({ 
        success: false, 
        error: 'Không thể gửi email. Vui lòng thử lại sau.' 
      });
    }

    return res.json({
      success: true,
      message: 'Mã xác thực đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.'
    });

  } catch (err) {
    console.error('forgot-password error:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Có lỗi xảy ra khi xử lý yêu cầu' 
    });
  }
});

// POST - Xác thực mã và đặt lại mật khẩu
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Vui lòng cung cấp email, mã xác thực và mật khẩu mới' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'Mật khẩu mới phải có ít nhất 6 ký tự' 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+resetPasswordCode +resetPasswordExpires');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'Không tìm thấy tài khoản với email này' 
      });
    }

    if (!user.resetPasswordCode || !user.resetPasswordExpires) {
      return res.status(400).json({ 
        success: false, 
        error: 'Mã xác thực không tồn tại. Vui lòng yêu cầu gửi lại mã.' 
      });
    }

    if (user.resetPasswordExpires.getTime() < Date.now()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Mã xác thực đã hết hạn. Vui lòng yêu cầu gửi lại mã mới.' 
      });
    }

    if (user.resetPasswordCode !== code.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Mã xác thực không chính xác' 
      });
    }

    // Xác thực thành công - đặt lại mật khẩu
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    user.lastResetPasswordEmailSentAt = undefined;

    await user.save();

    console.log(`✅ Đặt lại mật khẩu thành công cho: ${user.email}`);

    return res.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.'
    });

  } catch (err) {
    console.error('reset-password error:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Có lỗi xảy ra khi đặt lại mật khẩu' 
    });
  }
});

// POST - Gửi lại mã xác thực đặt lại mật khẩu
router.post('/resend-reset-code', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Vui lòng cung cấp email' 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+resetPasswordCode +resetPasswordExpires +lastResetPasswordEmailSentAt');

    if (!user) {
      return res.json({
        success: true,
        message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được mã xác thực trong vài phút.'
      });
    }

    const now = Date.now();

    // Không cho spam: mỗi 60s gửi 1 lần
    if (user.lastResetPasswordEmailSentAt &&
        now - user.lastResetPasswordEmailSentAt.getTime() < RESEND_COOLDOWN_MS) {
      const wait = Math.ceil((RESEND_COOLDOWN_MS - (now - user.lastResetPasswordEmailSentAt.getTime())) / 1000);
      return res.status(429).json({ 
        success: false, 
        error: `Vui lòng đợi ${wait}s để gửi lại mã` 
      });
    }

    // Tạo mã mới
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordCode = newCode;
    user.resetPasswordExpires = new Date(now + RESET_PASSWORD_TTL_MS);
    user.lastResetPasswordEmailSentAt = new Date(now);

    await user.save();

    try {
      await sendResetPasswordEmail(user.email, user.name, newCode);
      console.log(`✉️ Đã gửi lại mã đặt lại mật khẩu đến: ${user.email}`);
    } catch (err) {
      console.error('Không thể gửi email:', err);
      return res.status(500).json({ 
        success: false, 
        error: 'Không thể gửi email. Vui lòng thử lại sau.' 
      });
    }

    return res.json({
      success: true,
      message: 'Mã xác thực mới đã được gửi đến email của bạn.'
    });

  } catch (err) {
    console.error('resend-reset-code error:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Có lỗi xảy ra khi gửi lại mã' 
    });
  }
});

export default router;
