// server.js - Complete with Receipt API
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import receiptRoutes from './server/receipts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ MOUNT RECEIPT ROUTES - THIS IS THE FIX
app.use('/api/receipts', receiptRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    receiptsDir: path.join(process.cwd(), 'students_receipts')
  });
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.url}`);
  next();
});

// Serve static files
const distPath = path.join(process.cwd(), 'dist');

if (fs.existsSync(distPath)) {
  console.log('✅ Serving static files from:', distPath);
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.log('⚠️ Dist folder not found - run npm run build first');
  app.get('*', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>School Management System</title></head>
        <body>
          <h1>🏫 School Management System</h1>
          <p>Run <code>npm run build</code> first to build the application.</p>
        </body>
      </html>
    `);
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Open: http://localhost:${PORT}`);
  console.log(`📁 Receipts stored in: ${path.join(process.cwd(), 'students_receipts')}`);
  console.log(`📋 Receipt API endpoints:`);
  console.log(`   POST   /api/receipts/upload  - Upload receipt(s)`);
  console.log(`   GET    /api/receipts/file/:filename  - Download receipt`);
  console.log(`   GET    /api/receipts/info/:filename  - Get receipt info`);
  console.log(`   DELETE /api/receipts/file/:filename  - Delete receipt`);
  console.log(`   GET    /api/receipts/list    - List all receipts`);
  console.log(`   GET    /api/receipts/stats   - Get storage stats`);
});