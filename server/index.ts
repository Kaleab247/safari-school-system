// server/index.ts
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import receiptRoutes from './receipts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.url}`);
  next();
});

// Mount receipt routes
app.use('/api/receipts', receiptRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    receiptsDir: path.join(process.cwd(), 'students_receipts')
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Receipts API server running on port ${PORT}`);
  console.log(`📁 Receipts stored in: ${path.join(process.cwd(), 'students_receipts')}`);
  console.log(`📋 API endpoints:`);
  console.log(`   POST   /api/receipts/upload  - Upload receipt(s)`);
  console.log(`   GET    /api/receipts/file/:filename  - Download receipt`);
  console.log(`   GET    /api/receipts/info/:filename  - Get receipt info`);
  console.log(`   DELETE /api/receipts/file/:filename  - Delete receipt`);
  console.log(`   GET    /api/receipts/list    - List all receipts`);
  console.log(`   GET    /api/receipts/stats   - Get storage stats`);
});

export default app;