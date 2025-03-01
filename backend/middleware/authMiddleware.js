import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const protect = async (req, res, next) => {
  try {
    const userToken = req.cookies?.userToken;

    console.log("User  Token:", userToken);

    if (!userToken) {
      return res.status(401).json({
        message: "Not authorized, please login",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "Server configuration error: JWT_SECRET is not defined",
      });
    }

    try {
      const decoded = jwt.verify(userToken, process.env.JWT_SECRET);

      const user = await User.findById(decoded.data.id).select("-password");
      if (!user) {
        return res.status(401).json({
          message: "User  not found",
        });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          message: "Token expired, please login again",
        });
      }
      return res.status(401).json({
        message: "Invalid token",
      });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

export default protect;
