import { Router } from "express";
import {
  loginUser,
  logoutUser,
  resetPassword,
  verifyEmail,
  forgotPassword,
  resendVerificationOTP,
  registerUser,
} from "../controller/authController.js";

import protect from "../middleware/authMiddleware.js";

const authRouter = Router();

// Public routes
authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/resend-verification", resendVerificationOTP);

// Protected routes
authRouter.post("/verify-email", protect, verifyEmail);
authRouter.post("/logout", protect, logoutUser);

export { authRouter };
