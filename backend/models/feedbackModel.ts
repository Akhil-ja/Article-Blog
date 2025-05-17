import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface IFeedback extends Document {
  userId: Types.ObjectId;
  articleId: Types.ObjectId;
  type: "like" | "dislike";
  createdAt: Date;
}

const feedbackSchema: Schema<IFeedback> = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Article",
    required: true,
  },
  type: { type: String, enum: ["like", "dislike"], required: true },
  createdAt: { type: Date, default: Date.now },
});

const Feedback: Model<IFeedback> = mongoose.model<IFeedback>(
  "Feedback",
  feedbackSchema
);

export default Feedback;
