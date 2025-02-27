import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
  verifyEmail,
  getUserProfile,
  forgotPassword,
  resendVerificationOTP,
} from "../controller/userController.js";
import protect from "../middleware/authMiddleware.js";

const userRouter = Router();

// Public routes
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);
userRouter.post("/resend-verification", resendVerificationOTP);

// Protected routes
userRouter.post("/verify-email", protect, verifyEmail);
userRouter.post("/logout", protect, logoutUser);
userRouter.get("/profile", protect, getUserProfile);

export { userRouter };
