/**
 * Multer file upload configuration.
 * Saves to uploads/ with optional subdir (e.g. receipts, attachments).
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AppError } = require('./errorHandler');

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const BASE_PATH = path.join(process.cwd(), UPLOAD_DIR);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * Create multer instance for a subdir. Options: { subdir, fieldName, maxCount, maxSizeMB }.
 */
function createUploader(options = {}) {
  const subdir = options.subdir || 'files';
  const fieldName = options.fieldName || 'file';
  const maxCount = options.maxCount || 5;
  const maxSizeMB = options.maxSizeMB || 10;
  const dest = path.join(BASE_PATH, subdir);
  ensureDir(dest);

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || '.bin';
      const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
      cb(null, name);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      // Optional: restrict mime types
      cb(null, true);
    },
  });

  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') return next(new AppError('File too large', 400));
        if (err.code === 'LIMIT_FILE_COUNT') return next(new AppError('Too many files', 400));
      }
      if (err) return next(err);
      next();
    });
  };
}

/**
 * Single file upload for one field.
 */
function singleUpload(subdir = 'files', fieldName = 'file', maxSizeMB = 10) {
  const dest = path.join(BASE_PATH, subdir);
  ensureDir(dest);
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || '.bin';
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  });
  return multer({
    storage,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
  }).single(fieldName);
}

/**
 * Build public URL for a stored file (for API responses).
 */
function getFileUrl(filename, subdir = 'files') {
  const base = process.env.API_BASE_URL || '';
  return `${base}/${UPLOAD_DIR}/${subdir}/${filename}`.replace(/\/+/g, '/');
}

module.exports = { createUploader, singleUpload, getFileUrl, UPLOAD_DIR, BASE_PATH };
