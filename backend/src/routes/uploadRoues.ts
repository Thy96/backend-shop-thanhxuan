import express, { Request, Response } from "express";
import { upload, uploadToCloudinary } from "../lib/config/upload";

const router = express.Router();

// 🧩 API upload ảnh cho Editor.js
router.post("/", upload.single("thumbnail"), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: 0, message: "No file uploaded" });
  }

  try {
    const imageUrl = await uploadToCloudinary(req.file.buffer);
    return res.json({
      success: 1,
      file: {
        url: imageUrl, // Editor.js yêu cầu format này
      },
    });
  } catch {
    return res.status(500).json({ success: 0, message: "Upload thất bại" });
  }
});

export default router;
