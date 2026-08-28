import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { db } from './server/db';
import apiRouter from './server/api';
import { prisma } from './server/db/prisma';

import helmet from 'helmet';
import morgan from 'morgan';

dotenv.config();

// Map GEMINI_API_KEY to required env vars for CopilotKit / Google GenAI adapters
if (process.env.GEMINI_API_KEY) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GEMINI_API_KEY;
  if (!process.env.GOOGLE_API_KEY) process.env.GOOGLE_API_KEY = process.env.GEMINI_API_KEY;
}

export const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Basic Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(morgan('tiny'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mount API router
app.use('/api', apiRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message
  });
});

async function startServer() {
  // Test Database Connection and Migrate JSON Data
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Connected to PostgreSQL');
    await db.migrateFromJSONIfNeeded();
  } catch (err) {
    console.error('❌ Failed to connect to PostgreSQL database:', err);
    process.exit(1);
  }

  // Vite development middleware or production static asset server
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Campus OS Server running at http://0.0.0.0:${PORT}`);
  });
}

// Only start the server if not running in a Vercel serverless environment
if (!process.env.VERCEL) {
  startServer().catch(async err => {
    console.error('Failed to start Campus OS server:', err);
    await prisma.$disconnect();
    process.exit(1);
  });
}

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
