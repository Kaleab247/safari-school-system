// server/receipts.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Create receipts directory if it doesn't exist
const RECEIPTS_DIR = path.join(process.cwd(), 'students_receipts');
if (!fs.existsSync(RECEIPTS_DIR)) {
  fs.mkdirSync(RECEIPTS_DIR, { recursive: true });
  console.log(`📁 Created receipts directory: ${RECEIPTS_DIR}`);
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, RECEIPTS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const cleanBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${cleanBaseName}_${uniqueId}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

// Generate unique receipt ID
function generateReceiptId() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RCP-${year}${month}${day}-${random}`;
}

// Upload endpoint
router.post('/upload', upload.array('receipts', 5), (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    const receiptId = generateReceiptId();

    const fileRecords = files.map(file => ({
      receiptId: receiptId,
      originalName: file.originalname,
      storedName: file.filename,
      path: file.path,
      size: file.size,
      type: file.mimetype,
      url: `/api/receipts/file/${file.filename}`,
      uploadedAt: new Date().toISOString()
    }));

    console.log(`📤 Uploaded ${fileRecords.length} receipt(s) with ID: ${receiptId}`);
    res.json({
      success: true,
      receiptId: receiptId,
      files: fileRecords
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: 'Failed to upload files' });
  }
});

// Get file
router.get('/file/:filename', (req, res) => {
  const filename = req.params.filename;
  const safeFilename = path.basename(filename);
  const filePath = path.join(RECEIPTS_DIR, safeFilename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.pdf': 'application/pdf'
  };

  res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
  res.sendFile(filePath);
});

// Get file info
router.get('/info/:filename', (req, res) => {
  const filename = req.params.filename;
  const safeFilename = path.basename(filename);
  const filePath = path.join(RECEIPTS_DIR, safeFilename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  const stats = fs.statSync(filePath);
  const ext = path.extname(filename).toLowerCase();
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.pdf': 'application/pdf'
  };

  res.json({
    name: filename,
    size: stats.size,
    type: contentTypes[ext] || 'application/octet-stream',
    modified: stats.mtime,
    created: stats.birthtime
  });
});

// Delete file
router.delete('/file/:filename', (req, res) => {
  const filename = req.params.filename;
  const safeFilename = path.basename(filename);
  const filePath = path.join(RECEIPTS_DIR, safeFilename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  try {
    fs.unlinkSync(filePath);
    console.log(`🗑️ Deleted receipt: ${safeFilename}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// List all files
router.get('/list', (req, res) => {
  try {
    const files = fs.readdirSync(RECEIPTS_DIR);
    const fileInfos = files
      .filter(filename => filename !== '.gitkeep')
      .map(filename => {
        const filePath = path.join(RECEIPTS_DIR, filename);
        const stats = fs.statSync(filePath);
        const ext = path.extname(filename).toLowerCase();
        const contentTypes = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.pdf': 'application/pdf'
        };

        return {
          name: filename,
          size: stats.size,
          type: contentTypes[ext] || 'application/octet-stream',
          modified: stats.mtime,
          created: stats.birthtime,
          url: `/api/receipts/file/${filename}`
        };
      });

    res.json({ success: true, count: fileInfos.length, files: fileInfos });
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Get storage stats
router.get('/stats', (req, res) => {
  try {
    const files = fs.readdirSync(RECEIPTS_DIR);
    let totalSize = 0;
    let fileCount = 0;

    files.forEach(filename => {
      if (filename !== '.gitkeep') {
        const filePath = path.join(RECEIPTS_DIR, filename);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
        fileCount++;
      }
    });

    res.json({
      success: true,
      fileCount,
      totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      directory: RECEIPTS_DIR
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get storage stats' });
  }
});

export default router;