// server.js - No CSP headers at all (using meta tag only)
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Simple chat endpoint
app.post('/api/chat', (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const responses = {
    'grade': 'You can view grades in the Grades tab.',
    'payment': 'Payments can be made through the Tuition section.',
    'student': 'Student information is available in the main dashboard.',
    'help': 'I can help you navigate the system. What would you like to know?'
  };

  let reply = 'I\'m here to help you navigate the school management system.';
  const lowerText = message.toLowerCase();

  for (const [key, value] of Object.entries(responses)) {
    if (lowerText.includes(key)) {
      reply = value;
      break;
    }
  }

  res.json({ text: reply });
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
  console.log('⚠️ Dist folder not found');
  app.get('*', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>School Management System</title></head>
        <body>
          <h1>🏫 School Management System</h1>
          <p>Building... Please wait.</p>
        </body>
      </html>
    `);
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
});