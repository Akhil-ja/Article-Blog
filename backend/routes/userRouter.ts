import { Router } from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getUserProfile,
  updateProfile,
  changePassword,
  updatePreferences,
  getUserPreferences,
  getAllCategories,
  getUserActivities,
} from "../controller/userController.js";

const userRouter = Router();

userRouter
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateProfile);

userRouter.route("/change-password").put(protect, changePassword);

userRouter
  .route("/preferences")
  .get(protect, getUserPreferences)
  .put(protect, updatePreferences);

userRouter.route("/categories").get(getAllCategories);

userRouter.get("/activities", protect, getUserActivities);

export { userRouter };
