import mongoose, { Document, Schema } from 'mongoose';

export interface IMealPlan extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  meals: {
    breakfast?: mongoose.Types.ObjectId;
    lunch?: mongoose.Types.ObjectId;
    dinner?: mongoose.Types.ObjectId;
    snack?: mongoose.Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
}

const mealPlanSchema = new Schema<IMealPlan>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  meals: {
    breakfast: {
      type: Schema.Types.ObjectId,
      ref: 'Recipe'
    },
    lunch: {
      type: Schema.Types.ObjectId,
      ref: 'Recipe'
    },
    dinner: {
      type: Schema.Types.ObjectId,
      ref: 'Recipe'
    },
    snack: {
      type: Schema.Types.ObjectId,
      ref: 'Recipe'
    }
  }
}, {
  timestamps: true
});

export default mongoose.model<IMealPlan>('MealPlan', mealPlanSchema);
