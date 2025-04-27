import mongoose, { Document, Schema, Model } from "mongoose";

export interface IImage extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  imageUrl: string;
  order?: number;
  createdAt?: Date;
}

const imageSchema: Schema<IImage> = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Image: Model<IImage> = mongoose.model<IImage>("Image", imageSchema);

export default Image;
