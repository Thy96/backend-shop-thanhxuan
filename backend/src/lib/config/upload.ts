import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

// Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload buffer lên Cloudinary, trả về secure_url
export async function uploadToCloudinary(buffer: Buffer): Promise<string> {
  // Validate credentials before attempting upload
  const cfg = cloudinary.config();
  if (!cfg.cloud_name || !cfg.api_key || !cfg.api_secret) {
    throw new Error("Cloudinary credentials chưa được cấu hình (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)");
  }

  console.log('[uploadToCloudinary] buffer size:', buffer?.length ?? 'undefined');

  if (!buffer || buffer.length === 0) {
    throw new Error("File buffer rỗng, không thể upload");
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "shop-thanhxuan",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error || !result) {
          console.error('[uploadToCloudinary] error:', JSON.stringify(error));
          // Cloudinary v1 error có thể là plain object, extract message
          const msg = (error as any)?.message
            || (error as any)?.error?.message
            || JSON.stringify(error)
            || "Cloudinary upload thất bại";
          reject(new Error(msg));
        } else {
          console.log('[uploadToCloudinary] success url:', result.secure_url);
          resolve(result.secure_url);
        }
      }
    );
    stream.end(buffer);
  });
}

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const ext = file.originalname.split(".").pop()?.toLowerCase() ?? "";
  const mime = file.mimetype.toLowerCase();
  if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ được upload file ảnh"));
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
});