import express, { Request, Response } from "express";
import { upload } from "../lib/config/upload";

const router = express.Router();

// 🧩 API upload ảnh cho Editor.js
router.post("/", upload.single("thumbnail"), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: 0, message: "No file uploaded" });
  }

  // Cloudinary trả về URL trực tiếp qua req.file.path
  const imageUrl = (req.file as any).path;

  return res.json({
    success: 1,
    file: {
      url: imageUrl, // Editor.js yêu cầu format này
    },
  });
});

export default router;
