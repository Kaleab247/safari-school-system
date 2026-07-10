// server.js - Windows compatible version
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    geminiConfigured: false,
  });
});

// AI chat endpoint (mock mode)
app.post('/api/gemini/chat', async (req, res) => {
  const { message, roleContext } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const responses = {
    student: "📚 I'll help you learn! Let me explain this in a simple way...",
    teacher: "👨‍🏫 Great! Here's a comprehensive lesson plan for this topic...",
    parent: "👪 I understand your concern. Here's how to support your child...",
    default: "💡 I'm here to help with your school management needs!"
  };

  const response = responses[roleContext] || responses.default;

  return res.json({
    text: `**AI Assistant** (Mock Mode)\n\n${response}\n\n> *Note: Add GEMINI_API_KEY to .env for real AI responses.*`
  });
});

// Setup Vite or serve static files
async function startServer() {
  try {
    console.log('🔄 Starting Vite development server...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('✅ Vite development server mounted');
  } catch (error) {
    console.log('⚠️ Vite not available, serving static files...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`🚀 School Management System running at http://localhost:${PORT}`);
    console.log('📊 AI Mode: Mock (Add GEMINI_API_KEY for real AI)');
  });
}

startServer();