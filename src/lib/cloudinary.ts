import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ================= UPLOAD HELPER ================= */

export async function uploadToCloudinary(
  file: string,
  options: {
    folder?: string;
    resource_type?: "image" | "video" | "raw" | "auto";
  } = {}
) {
  return new Promise<any>((resolve, reject) => {
    cloudinary.uploader.upload(
      file,
      {
        folder: options.folder || "uploads",
        resource_type: options.resource_type || "auto",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
  });
}