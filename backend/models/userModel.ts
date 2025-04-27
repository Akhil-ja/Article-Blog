import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  images: Types.ObjectId[];
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
  images: [{ type: mongoose.Schema.Types.ObjectId, ref: "Image" }],
  isVerified: { type: Boolean, default: false },
  verificationOTP: { type: String },
  otpExpiry: { type: Date },
  resetPasswordOTP: { type: String },
  resetOTPExpiry: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
