import { Schema, model, Document } from "mongoose";

// ── Interface ──────────────────────────────────────────────────────────────────

export interface IUser extends Document {
  fullName: string;
  username: string;
  email: string;
  password: string;
  birthDate?: string;
  gender?: string;
  personalityBaseline?: {
    traits: string[];
    humorStyle: string;
    communicationStyle: string;
  };
  onboardingComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ────────────────────────────────────────────────────────────────────

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    username: { type: String, trim: true, lowercase: true, sparse: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    birthDate: { type: String },
    gender: { type: String },
    personalityBaseline: {
      traits: [String],
      humorStyle: String,
      communicationStyle: String,
    },
    onboardingComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
