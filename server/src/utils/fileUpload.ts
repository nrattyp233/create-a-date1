import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { UploadedFile } from 'express-fileupload';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const UPLOADS_DIR = join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const handleAvatarUpload = async (file: UploadedFile): Promise<string> => {
  // Validate file
  if (!file.mimetype.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('File too large');
  }

  // Process image
  const filename = `${Date.now()}-${file.name}`;
  const filepath = join(UPLOADS_DIR, filename);

  await sharp(file.data)
    .resize(500, 500, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality: 80 })
    .toFile(filepath);

  return `/uploads/${filename}`;
};