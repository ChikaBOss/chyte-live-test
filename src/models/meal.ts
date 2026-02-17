import { Schema, model, models } from 'mongoose';

const MealSchema = new Schema({
  chefId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String },
  description: { type: String, required: true },
  available: { type: Boolean, default: true },
  preparationTime: { type: Number, default: 30 },
  ingredients: [{ type: String }],
  serves: { type: Number, default: 1 },
}, {
  timestamps: true
});

export default models.Meal || model('Meal', MealSchema);