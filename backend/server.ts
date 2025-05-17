import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import { authRouter } from "./routes/authRoutes.js";
import globalErrorHandler from "./middleware/errorMiddleware.js";
import articleRouter from "./routes/articleRoutes.js";
import { userRouter } from "./routes/userRouter.js";

dotenv.config();

connectDB();

const port = process.env.PORT;

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

console.log("Running backend — FRONTEND_URL:", process.env.FRONTEND_URL);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/article", articleRouter);

app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
