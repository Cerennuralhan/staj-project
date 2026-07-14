import { Schema, model, models } from "mongoose";

const SabitSchema = new Schema({
  anahtar: { type: String, required: true, unique: true },
  deger: { type: Schema.Types.Mixed, required: true },
});

export const Sabit = models.Sabit || model("Sabit", SabitSchema);
