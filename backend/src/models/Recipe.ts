import mongoose, { Document, Schema } from 'mongoose';

// Interface cho ingredient
export interface IIngredient {
  name: string;
  amount: string;
  unit: string;
}

export interface IRecipe extends Document {
  title: string; // name trong frontend
  description: string;
  image?: string; // imageUrl
  ingredients: IIngredient[]; // Đổi từ string[] sang object[]
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó'; // Đổi sang tiếng Việt
  category: 'món chính' | 'món phụ' | 'canh' | 'món tráng miệng';
  cuisine?: 'Bắc' | 'Trung' | 'Nam' | 'Quốc tế'; // Thêm vùng miền
  tags: string[];
  // Health tags
  healthTags?: string[]; // ["ít đường", "ít muối", "không gluten", "giàu protein", ...]
  suitableFor?: string[]; // ["tiểu đường", "cao huyết áp", "ăn chay", ...]
  notSuitableFor?: string[]; // ["dị ứng hải sản", "dị ứng đậu phộng", ...]
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  author: mongoose.Types.ObjectId;
  authorEmail?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewNote?: string;
  reviewedAt?: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
  likesCount: number;
  savesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ingredientSchema = new Schema({
  name: { type: String, required: true },
  amount: { type: String, required: true },
  unit: { type: String, required: true }
}, { _id: false });

const recipeSchema = new Schema<IRecipe>({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: String,
  ingredients: [ingredientSchema],
  instructions: [{
    type: String,
    required: true
  }],
  prepTime: {
    type: Number,
    required: true
  },
  cookTime: {
    type: Number,
    required: true
  },
  servings: {
    type: Number,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Dễ', 'Trung bình', 'Khó'],
    required: true
  },
  category: {
    type: String,
    enum: ['món chính', 'món phụ', 'canh', 'món tráng miệng'],
    required: true
  },
  cuisine: {
    type: String,
    enum: ['Bắc', 'Trung', 'Nam', 'Quốc tế'],
    default: 'Bắc'
  },
  tags: [String],
  healthTags: [String],
  suitableFor: [String],
  notSuitableFor: [String],
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorEmail: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewNote: String,
  reviewedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  likesCount: {
    type: Number,
    default: 0
  },
  savesCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model<IRecipe>('Recipe', recipeSchema);
