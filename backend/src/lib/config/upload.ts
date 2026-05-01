import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

// Upload buffer lên Cloudinary, trả về secure_url
export async function uploadToCloudinary(buffer: Buffer): Promise<string> {
  // Đọc env vars tại thời điểm gọi hàm (không phải module load time)
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  console.log('[uploadToCloudinary] cloud_name:', cloud_name ? 'set' : 'MISSING', '| api_key:', api_key ? 'set' : 'MISSING', '| api_secret:', api_secret ? 'set' : 'MISSING');

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      `Cloudinary credentials chưa được cấu hình: cloud_name=${cloud_name ?? 'missing'}, api_key=${api_key ? 'set' : 'missing'}, api_secret=${api_secret ? 'set' : 'missing'}`
    );
  }

  // Cấu hình lại mỗi lần để đảm bảo dùng giá trị mới nhất
  cloudinary.config({ cloud_name, api_key, api_secret });

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