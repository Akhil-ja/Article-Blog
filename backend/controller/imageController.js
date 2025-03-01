import Image from "../models/imageModel.js";
import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
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

export const uploadImages = async (req, res, next) => {
  try {
    const titles = req.body.titles;

    console.log(titles);

    console.log(typeof titles);

    if (!req.files || req.files.length === 0) {
      return next(new AppError("Please upload at least one image", 400));
    }

    if (!Array.isArray(titles)) {
      return next(new AppError("Please provide titles for each image", 400));
    }

    if (req.files.length !== titles.length) {
      return next(
        new AppError("Number of titles must match number of images", 400)
      );
    }

    const uploadedImages = [];
    const user = await User.findById(req.user._id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const maxOrderImage = await Image.findOne({ userId: req.user._id })
      .sort({ order: -1 })
      .limit(1);

    let startOrder = maxOrderImage ? maxOrderImage.order + 1 : 0;

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const title = req.body.titles[i];

      const result = await uploadToCloudinary(
        file.buffer,
        `stock-images/${req.user._id}`
      );

      const newImage = await Image.create({
        userId: req.user._id,
        title,
        imageUrl: result.secure_url,
        order: startOrder + i,
        createdAt: new Date(),
      });

      uploadedImages.push(newImage);
      user.images.push(newImage._id);
    }

    await user.save();

    return res.status(201).json({
      message: "Images uploaded successfully",
      images: uploadedImages,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserImages = async (req, res, next) => {
  try {
    const images = await Image.find({ userId: req.user._id })
      .sort({ order: 1 })
      .select("-__v");

    return res.status(200).json({
      message: "Images retrieved successfully",
      count: images.length,
      images,
    });
  } catch (error) {
    next(error);
  }
};

export const updateImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const image = await Image.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!image) {
      return next(new AppError("Image not found or not authorized", 404));
    }

    if (title) {
      image.title = title;
    }

    if (req.file) {
      const publicId = image.imageUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(
        `stock-images/${req.user._id}/${publicId}`
      );

      const result = await uploadToCloudinary(
        req.file.buffer,
        `stock-images/${req.user._id}`
      );

      image.imageUrl = result.secure_url;
    }

    await image.save();

    return res.status(200).json({
      message: "Image updated successfully",
      image,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteImage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const image = await Image.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!image) {
      return next(new AppError("Image not found or not authorized", 404));
    }

    const publicId = image.imageUrl.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(
      `stock-images/${req.user._id}/${publicId}`
    );

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { images: image._id },
    });

    await Image.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Image deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const rearrangeImages = async (req, res, next) => {
  try {
    const { imageOrders } = req.body;

    if (!imageOrders || !Array.isArray(imageOrders)) {
      return next(new AppError("Please provide image order information", 400));
    }

    const bulkOps = imageOrders.map((item) => ({
      updateOne: {
        filter: { _id: item.id, userId: req.user._id },
        update: { $set: { order: item.order } },
      },
    }));

    await Image.bulkWrite(bulkOps);

    const updatedImages = await Image.find({ userId: req.user._id })
      .sort({ order: 1 })
      .select("-__v");

    return res.status(200).json({
      message: "Images rearranged successfully",
      images: updatedImages,
    });
  } catch (error) {
    next(error);
  }
};
