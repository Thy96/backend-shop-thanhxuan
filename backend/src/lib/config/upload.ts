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
  console.log('[uploadToCloudinary] buffer size:', buffer?.length ?? 'undefined');
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "shop-thanhxuan",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error || !result) {
          console.error('[uploadToCloudinary] error:', error);
          reject(error ?? new Error("Cloudinary upload failed"));
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