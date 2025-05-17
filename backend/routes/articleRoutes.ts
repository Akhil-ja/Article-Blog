import express from "express";

import protect from "../middleware/authMiddleware.js";
import {
  getAllArticles,
  getArticle,
  getArticleStats,
  createArticle,
  updateArticle,
  deleteArticle,
  getUserArticles,
  getArticlesByPreferences,
  likeArticle,
  dislikeArticle,
  blockArticle,
} from "../controller/articleController.js";
import multer from "multer";

const articleRouter = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(null, false);
      return new Error("Only image files are allowed");
    }
  },
});

articleRouter.use(protect);

articleRouter
  .route("/")
  .get(getAllArticles)
  .post(upload.array("images", 5), createArticle);

articleRouter.get("/my-articles", getUserArticles);
articleRouter.get("/preferences", getArticlesByPreferences);

articleRouter
  .route("/:id")
  .get(getArticle)
  .patch(upload.array("images", 5), updateArticle)
  .delete(deleteArticle);

articleRouter.get("/:id/stats", getArticleStats);
articleRouter.post("/:id/like", likeArticle);
articleRouter.post("/:id/dislike", dislikeArticle);
articleRouter.post("/:id/block", blockArticle);

export default articleRouter;
