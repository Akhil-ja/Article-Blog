import mongoose, { Document, Schema, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  preferences: string[];
  isVerified: boolean;
  verificationOTP?: string;
  otpExpiry?: Date;
  resetPasswordOTP?: string;
  resetOTPExpiry?: Date;
  createdAt?: Date;
}

const userSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  preferences: { type: [String], default: [] },
  isVerified: { type: Boolean, default: false },
  verificationOTP: { type: String },
  otpExpiry: { type: Date },
  resetPasswordOTP: { type: String },
  resetOTPExpiry: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
