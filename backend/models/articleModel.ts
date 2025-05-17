import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface IArticle extends Document {
  title: string;
  description: string;
  images: string[];
  tags: string[];
  category: string;
  createdBy: Types.ObjectId;
  likes: number;
  dislikes: number;
  block: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const articleSchema: Schema<IArticle> = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String }],
    tags: [{ type: String }],
    category: {
      type: String,
      enum: [
        "sports",
        "politics",
        "space",
        "technology",
        "entertainment",
        "others",
      ],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    block: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Article: Model<IArticle> = mongoose.model<IArticle>(
  "Article",
  articleSchema
);

export default Article;
