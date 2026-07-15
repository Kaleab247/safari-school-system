// server.ts - Updated with receipt API
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import receiptRoutes from './server/receipts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Mount receipt routes BEFORE Vite middleware
app.use('/api/receipts', receiptRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mode: 'offline',
    schoolName: process.env.SCHOOL_NAME || 'My School',
  });
});

// Simple chat endpoint
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const responses: Record<string, string> = {
    'grade': 'You can view grades in the Grades tab. Each grade shows detailed feedback.',
    'payment': 'Payments can be made through the Tuition section or by clicking the Make Payment button.',
    'student': 'Student information is available in the main dashboard.',
    'help': 'I can help you navigate the system. What would you like to know?',
  };

  let reply = 'I\'m here to help you navigate the school management system. Could you please rephrase your question?';

  const lowerText = message.toLowerCase();
  for (const [key, value] of Object.entries(responses)) {
    if (lowerText.includes(key)) {
      reply = value;
      break;
    }
  }

  return res.json({ text: reply });
});

async function configureServer() {
  if (process.env.NODE_ENV !== 'production') {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('✅ Vite development server mounted');
    } catch (error) {
      console.error('❌ Failed to mount Vite:', error);
      // Fallback to static files
      const distPath = path.join(process.cwd(), 'dist');
      if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
          res.sendFile(path.join(distPath, 'index.html'));
        });
        console.log('✅ Serving static files from dist');
      }
    }
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('✅ Production static assets configured');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 School Management System running at http://localhost:${PORT}`);
    console.log('📊 AI Mode: Offline (No API required)');
    console.log(`📁 Receipts stored in: ${path.join(process.cwd(), 'students_receipts')}`);
  });
}

// Need to import fs for the fallback
import fs from 'fs';

configureServer();