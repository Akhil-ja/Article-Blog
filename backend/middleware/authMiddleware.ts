import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/userModel.js";

interface CustomJwtPayload extends JwtPayload {
  data: {
    id: string;
  };
}

const protect = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userToken = req.cookies?.userToken;

    console.log("User Token:", userToken);

    if (!userToken) {
      res.status(401).json({
        message: "Not authorized, please login",
      });
      return;
    }

    if (!process.env.JWT_SECRET) {
      res.status(500).json({
        message: "Server configuration error: JWT_SECRET is not defined",
      });
      return;
    }

    try {
      const decoded = jwt.verify(
        userToken,
        process.env.JWT_SECRET
      ) as CustomJwtPayload;

      const user = await User.findById(decoded.data.id).select("-password");

      console.log("User>>", user?.email);

      if (!user) {
        res.status(401).json({
          message: "User not found",
        });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          message: "Token expired, please login again",
        });
        return;
      }

      res.status(401).json({
        message: "Invalid token",
      });
      return;
    }
  } catch (err: unknown) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
};

export default protect;
