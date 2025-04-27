import express from "express";
import {
  uploadImages,
  getUserImages,
  updateImage,
  deleteImage,
  rearrangeImages,
} from "../controller/imageController.js";
import protect from "../middleware/authMiddleware.js";
import multer from "multer";

const imageRouter = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(null, false);
      return new Error("Only image files are allowed");
    }
  },
});

imageRouter.post("/upload", protect, upload.array("images", 10), uploadImages);
imageRouter.get("/", protect, getUserImages);
imageRouter.put("/:id", protect, upload.single("image"), updateImage);
imageRouter.delete("/:id", protect, deleteImage);
imageRouter.post("/rearrange", protect, rearrangeImages);

export default imageRouter;
