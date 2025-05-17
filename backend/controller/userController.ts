import { Request, Response, NextFunction } from "express";
import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import bcrypt from "bcryptjs";
import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";
import { categories } from "../constants/category.constant.js";
import Feedback from "../models/feedbackModel.js";

interface CloudinaryResult {
  secure_url: string;
  public_id: string;
}

const uploadToCloudinary = (
  buffer: Buffer,
  folder: string
): Promise<CloudinaryResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        if (!result)
          return reject(new Error("Failed to get result from Cloudinary"));
        resolve(result as CloudinaryResult);
      }
    );

    const readableStream = new Readable({
      read() {
        this.push(buffer);
        this.push(null);
      },
    });

    readableStream.pipe(uploadStream);
  });
};

export const updatePreferences = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { preferences } = req.body;

    if (!preferences || !Array.isArray(preferences)) {
      return next(new AppError("Invalid preferences data", 400));
    }

    const validCategories = categories;
    for (const pref of preferences) {
      if (!validCategories.includes(pref)) {
        return next(new AppError(`Invalid category: ${pref}`, 400));
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { preferences },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { firstName, lastName, phoneNumber, dob } = req.body;

    const updateData: any = {};
    if (firstName && lastName) updateData.name = firstName + " " + lastName;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (dob) updateData.dob = new Date(dob);

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(
        new AppError("Please provide current password and new password", 400)
      );
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      return next(new AppError("Current password is incorrect", 401));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getUserPreferences = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user._id).select("preferences");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.status(200).json({
      status: "success",
      data: {
        categories,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      return next(new AppError("Not authorized", 401));
    }

    const user = await User.findById(req.user._id).select("-password");

    if (user) {
      res.status(200).json(user);
    } else {
      return next(new AppError("User not found", 404));
    }
  } catch (error) {
    next(error);
  }
};

export const getUserActivities = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req.user._id;

    const activities = await Feedback.find({ userId: userId })
      .populate({
        path: "articleId",
        select: "_id title summary createdAt",
      })
      .sort({ createdAt: -1 });

    if (!activities || activities.length === 0) {
      return res.status(200).json({
        status: "success",
        data: {
          activities: [],
        },
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        activities,
      },
    });
  } catch (error) {
    next(error);
  }
};
