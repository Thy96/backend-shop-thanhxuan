import multer from "multer";
import fs from "fs";
import path from "path";

// tạo đường dẫn uploads
const uploadDir = path.join(__dirname, "../../../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// config multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  }
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();
  if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ được upload file ảnh"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB
});