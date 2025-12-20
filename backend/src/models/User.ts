import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
  isActive: boolean;
  age?: number;
  healthConditions?: string[];
  dietaryPreferences?: string[];
  hasCompletedHealthProfile?: boolean;
  resetPasswordCode?: string;
  resetPasswordExpires?: Date;
  lastResetPasswordEmailSentAt?: Date;
  savedRecipes: mongoose.Types.ObjectId[];
  likedRecipes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  age: {
    type: Number,
    required: false
  },
  healthConditions: {
    type: [String],
    default: []
  },
  dietaryPreferences: {
    type: [String],
    default: []
  },
  hasCompletedHealthProfile: {
    type: Boolean,
    default: false
  },
  resetPasswordCode: {
    type: String,
    required: false,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    required: false,
    select: false
  },
  lastResetPasswordEmailSentAt: {
    type: Date,
    required: false,
    select: false
  },
  savedRecipes: [{
    type: Schema.Types.ObjectId,
    ref: 'Recipe',
    default: []
  }],
  likedRecipes: [{
    type: Schema.Types.ObjectId,
    ref: 'Recipe',
    default: []
  }]
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', userSchema);
