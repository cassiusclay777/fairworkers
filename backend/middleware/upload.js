const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Vytvořit uploads složku pokud neexistuje
const uploadsDir = path.join(__dirname, '../uploads/media');
const thumbnailsDir = path.join(__dirname, '../uploads/thumbnails');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// Allowed file types
const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
const ALLOWED_TYPES = [...IMAGE_TYPES, ...VIDEO_TYPES];

// File size limits
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(new Error('Neplatný typ souboru. Povolené typy: obrázky (JPEG, PNG, WebP, GIF), videa (MP4, MOV, AVI, WebM)'), false);
  }

  // Check file size based on type
  const isImage = IMAGE_TYPES.includes(file.mimetype);
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;

  // Note: multer checks size limit separately via limits option
  cb(null, true);
};

// Multer upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_VIDEO_SIZE, // Max size (will be checked per-file in route)
    files: 10 // Max 10 files per request
  }
});

// Helper function to check if file is image
const isImage = (mimetype) => {
  return IMAGE_TYPES.includes(mimetype);
};

// Helper function to check if file is video
const isVideo = (mimetype) => {
  return VIDEO_TYPES.includes(mimetype);
};

// Helper function to validate file size
const validateFileSize = (file) => {
  if (isImage(file.mimetype) && file.size > MAX_IMAGE_SIZE) {
    return { valid: false, error: `Obrázek je příliš velký. Maximum je ${MAX_IMAGE_SIZE / 1024 / 1024}MB.` };
  }
  if (isVideo(file.mimetype) && file.size > MAX_VIDEO_SIZE) {
    return { valid: false, error: `Video je příliš velké. Maximum je ${MAX_VIDEO_SIZE / 1024 / 1024}MB.` };
  }
  return { valid: true };
};

module.exports = {
  upload,
  uploadsDir,
  thumbnailsDir,
  isImage,
  isVideo,
  validateFileSize,
  IMAGE_TYPES,
  VIDEO_TYPES
};
