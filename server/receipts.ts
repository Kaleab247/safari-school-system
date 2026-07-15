// server/receipts.ts
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
    // Clean filename: remove special chars and spaces
    const cleanBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${cleanBaseName}_${uniqueId}${ext}`);
  }
});

// File filter for validation
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter
});

// Upload receipt endpoint - supports multiple files
router.post('/upload', upload.array('receipts', 5), (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const fileRecords = files.map(file => ({
      originalName: file.originalname,
      storedName: file.filename,
      path: file.path,
      size: file.size,
      type: file.mimetype,
      url: `/api/receipts/file/${file.filename}`,
      uploadedAt: new Date().toISOString()
    }));

    console.log(`📤 Uploaded ${fileRecords.length} receipt(s)`);

    res.json({
      success: true,
      files: fileRecords
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload files'
    });
  }
});

// Get receipt file (serve the actual file)
router.get('/file/:filename', (req, res) => {
  const filename = req.params.filename;

  // Security: prevent path traversal
  const safeFilename = path.basename(filename);
  const filePath = path.join(RECEIPTS_DIR, safeFilename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Set appropriate content type
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.pdf': 'application/pdf'
  };

  const contentType = contentTypes[ext] || 'application/octet-stream';
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

  res.sendFile(filePath);
});

// Get receipt info (metadata only)
router.get('/info/:filename', (req, res) => {
  const filename = req.params.filename;
  const safeFilename = path.basename(filename);
  const filePath = path.join(RECEIPTS_DIR, safeFilename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  const stats = fs.statSync(filePath);
  const ext = path.extname(filename).toLowerCase();
  const contentTypes: Record<string, string> = {
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

// Delete receipt
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

// List all receipts with metadata
router.get('/list', (req, res) => {
  try {
    const files = fs.readdirSync(RECEIPTS_DIR);
    const fileInfos = files
      .filter(filename => filename !== '.gitkeep')
      .map(filename => {
        const filePath = path.join(RECEIPTS_DIR, filename);
        const stats = fs.statSync(filePath);
        const ext = path.extname(filename).toLowerCase();
        const contentTypes: Record<string, string> = {
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

    res.json({
      success: true,
      count: fileInfos.length,
      files: fileInfos
    });
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