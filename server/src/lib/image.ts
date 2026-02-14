import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.resolve(__dirname, "..", "..", "uploads");
const TARGET_ASPECT = 9 / 16; // width / height
const TARGET_WIDTH = 720; // 720x1280 at 9:16
const TARGET_HEIGHT = Math.round(TARGET_WIDTH / TARGET_ASPECT); // 1280
const JPEG_QUALITY = 70; // good balance of quality vs size

export interface ProcessedImage {
  imageUrl: string;
  width: number;
  height: number;
}

/**
 * Process an uploaded image buffer:
 * 1. Center-crop to 9:16 aspect ratio (no black bars)
 * 2. Resize to 720x1280
 * 3. Convert to JPEG and compress
 */
export async function processImage(
  inputBuffer: Buffer,
): Promise<ProcessedImage> {
  // Ensure uploads dir exists
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  const metadata = await sharp(inputBuffer).metadata();
  const srcWidth = metadata.width || 720;
  const srcHeight = metadata.height || 1280;

  // Calculate center crop to 9:16
  const srcAspect = srcWidth / srcHeight;

  let cropWidth: number;
  let cropHeight: number;

  if (srcAspect > TARGET_ASPECT) {
    // Image is wider than 9:16 — crop sides
    cropHeight = srcHeight;
    cropWidth = Math.round(srcHeight * TARGET_ASPECT);
  } else {
    // Image is taller than 9:16 — crop top/bottom
    cropWidth = srcWidth;
    cropHeight = Math.round(srcWidth / TARGET_ASPECT);
  }

  const left = Math.round((srcWidth - cropWidth) / 2);
  const top = Math.round((srcHeight - cropHeight) / 2);

  const filename = `profile-${randomUUID()}.jpg`;
  const filePath = path.join(UPLOAD_DIR, filename);

  await sharp(inputBuffer)
    .extract({ left, top, width: cropWidth, height: cropHeight })
    .resize(TARGET_WIDTH, TARGET_HEIGHT)
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toFile(filePath);

  return {
    imageUrl: `/uploads/${filename}`,
    width: TARGET_WIDTH,
    height: TARGET_HEIGHT,
  };
}

/**
 * Process an image from a file path on disk (used for update flow
 * where photos may already be saved as temp files).
 */
export async function processImageFromPath(
  inputPath: string,
): Promise<ProcessedImage> {
  const buffer = fs.readFileSync(inputPath);
  const result = await processImage(buffer);
  // Clean up temp file if it was in uploads dir with a different name
  if (inputPath !== path.join(UPLOAD_DIR, path.basename(result.imageUrl))) {
    try {
      fs.unlinkSync(inputPath);
    } catch {
      // ignore cleanup errors
    }
  }
  return result;
}

/**
 * Delete old image files from uploads directory.
 */
export function deleteImages(images: Array<{ imageUrl: string }>): void {
  for (const img of images) {
    const filename = path.basename(img.imageUrl);
    const filePath = path.join(UPLOAD_DIR, filename);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      // ignore cleanup errors
    }
  }
}
