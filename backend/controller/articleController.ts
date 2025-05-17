import { Request, Response, NextFunction } from "express";
import Article from "../models/articleModel.js";
import User from "../models/userModel.js";
import Feedback from "../models/feedbackModel.js";
import AppError from "../utils/appError.js";
import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";

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

export const createArticle = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description, tags, category } = req.body;

    if (!title || !description || !category) {
      return next(new AppError("Please provide all required fields", 400));
    }

    const images: string[] = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(
          file.buffer,
          `article-images/${req.user._id}`
        );
        images.push(result.secure_url);
      }
    }

    const article = await Article.create({
      title,
      description,
      images,
      tags: tags ? JSON.parse(tags) : [],
      category,
      createdBy: req.user._id,
    });

    res.status(201).json({
      status: "success",
      data: {
        article,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllArticles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const articles = await Article.find()
      .populate({
        path: "createdBy",
        select: "name",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: articles.length,
      data: {
        articles,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getArticlesByPreferences = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const query: any = { block: { $ne: true } };

    if (user.preferences && user.preferences.length > 0) {
      query.category = { $in: user.preferences };
    }

    const articles = await Article.find(query)
      .populate({
        path: "createdBy",
        select: "name",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: articles.length,
      data: {
        articles,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserArticles = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const articles = await Article.find({ createdBy: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      status: "success",
      results: articles.length,
      data: {
        articles,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getArticle = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const article = await Article.findById(req.params.id).populate({
      path: "createdBy",
      select: "name",
    });

    if (!article) {
      return next(new AppError("Article not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        article,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateArticle = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description, tags, category } = req.body;
    const articleId = req.params.id;

    const article = await Article.findOne({
      _id: articleId,
      createdBy: req.user._id,
    });

    if (!article) {
      return next(
        new AppError("Article not found or you are not authorized", 404)
      );
    }

    if (title) article.title = title;
    if (description) article.description = description;
    if (tags) article.tags = JSON.parse(tags);
    if (category) article.category = category;

    if (req.files && req.files.length > 0) {
      const newImages: string[] = [];

      for (const file of req.files) {
        const result = await uploadToCloudinary(
          file.buffer,
          `article-images/${req.user._id}`
        );
        newImages.push(result.secure_url);
      }

      article.images = [...article.images, ...newImages];
    }

    if (req.body.removeImages) {
      const imagesToRemove = JSON.parse(req.body.removeImages);

      for (const imageUrl of imagesToRemove) {
        const publicId = imageUrl.split("/").pop()?.split(".")[0];
        if (publicId) {
          await cloudinary.uploader.destroy(
            `article-images/${req.user._id}/${publicId}`
          );
        }
      }

      article.images = article.images.filter(
        (imgUrl) => !imagesToRemove.includes(imgUrl)
      );
    }

    await article.save();

    res.status(200).json({
      status: "success",
      data: {
        article,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteArticle = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const articleId = req.params.id;

    const article = await Article.findOne({
      _id: articleId,
      createdBy: req.user._id,
    });

    if (!article) {
      return next(
        new AppError("Article not found or you are not authorized", 404)
      );
    }

    for (const imageUrl of article.images) {
      const publicId = imageUrl.split("/").pop()?.split(".")[0];
      if (publicId) {
        await cloudinary.uploader.destroy(
          `article-images/${req.user._id}/${publicId}`
        );
      }
    }

    await Feedback.deleteMany({ articleId: article._id });

    await Article.findByIdAndDelete(articleId);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const likeArticle = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const articleId = req.params.id;
    const userId = req.user._id;

    const article = await Article.findById(articleId);
    if (!article) return next(new AppError("Article not found", 404));

    const existingFeedback = await Feedback.findOne({ userId, articleId });

    if (existingFeedback) {
      if (existingFeedback.type === "like") {
        await Feedback.findByIdAndDelete(existingFeedback._id);
        article.likes = Math.max(0, article.likes - 1);
      } else {
        if (existingFeedback.type === "dislike") {
          article.dislikes = Math.max(0, article.dislikes - 1);
        }

        existingFeedback.type = "like";
        await existingFeedback.save();
        article.likes += 1;
      }
    } else {
      await Feedback.create({ userId, articleId, type: "like" });
      article.likes += 1;
    }

    await article.save();
    const userFeedback = await Feedback.findOne({ userId, articleId });
    res.status(200).json({
      status: "success",
      message: "Like updated",
      data: {
        likes: article.likes,
        dislikes: article.dislikes,
        userFeedback: userFeedback?.type || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const dislikeArticle = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const articleId = req.params.id;
    const userId = req.user._id;

    const article = await Article.findById(articleId);
    if (!article) return next(new AppError("Article not found", 404));

    const existingFeedback = await Feedback.findOne({ userId, articleId });

    if (existingFeedback) {
      if (existingFeedback.type === "dislike") {
        await Feedback.findByIdAndDelete(existingFeedback._id);
        article.dislikes = Math.max(0, article.dislikes - 1);
      } else {
        if (existingFeedback.type === "like") {
          article.likes = Math.max(0, article.likes - 1);
        }

        existingFeedback.type = "dislike";
        await existingFeedback.save();
        article.dislikes += 1;
      }
    } else {
      await Feedback.create({ userId, articleId, type: "dislike" });
      article.dislikes += 1;
    }

    await article.save();

    const userFeedback = await Feedback.findOne({ userId, articleId });
    res.status(200).json({
      status: "success",
      message: "Dislike updated",
      data: {
        likes: article.likes,
        dislikes: article.dislikes,
        userFeedback: userFeedback?.type || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const blockArticle = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const articleId = req.params.id;

    const article = await Article.findById(articleId);

    if (!article) {
      return next(new AppError("Article not found", 404));
    }

    article.block = !article.block;
    await article.save();

    res.status(200).json({
      status: "success",
      message: `Article ${article.block ? "blocked" : "unblocked"}`,
      data: {
        block: article.block,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getArticleStats = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const articleId = req.params.id;

    const article = await Article.findById(articleId);

    if (!article) {
      return next(new AppError("Article not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        likes: article.likes,
        dislikes: article.dislikes,
      },
    });
  } catch (error) {
    next(error);
  }
};
