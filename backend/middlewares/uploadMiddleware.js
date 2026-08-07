const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [
    '.mp4', '.mov', '.mkv', '.avi', '.webm', '.m4v', '.3gp',
    '.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg', '.wma', '.txt'
  ];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext) || file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed formats: ${allowedExtensions.join(', ')}`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 } // 500 MB max
});

module.exports = upload;
