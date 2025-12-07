import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { migrateDatabase } from './db/index.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV === 'development';

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// API Routes
app.use('/api/auth', await import('./routes/auth.js').then(m => m.default));
app.use('/api/stores', await import('./routes/stores.js').then(m => m.default));
app.use('/api/dashboard', await import('./routes/dashboard.js').then(m => m.default));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Development mode: Use Vite dev server as middleware
if (isDev) {
  const { createServer: createViteServer } = await import('vite');

  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: {
        port: 3001
      }
    },
    appType: 'spa',
    root: path.join(__dirname, '../src')
  });

  app.use(vite.middlewares);
} else {
  // Production mode: Serve static files from dist
  app.use(express.static(path.join(__dirname, '../dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Start server
async function startServer() {
  try {
    // Migrate database
    await migrateDatabase();

    // Start listening
    app.listen(PORT, () => {
      console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📊 API endpoints:`);
      console.log(`   • Auth: http://localhost:${PORT}/api/auth`);
      console.log(`   • Stores: http://localhost:${PORT}/api/stores`);
      console.log(`\n📝 Database: SQLite (./server/db/namvung.db)`);
      console.log(`\n💻 Full application available at: http://localhost:${PORT}`);
      console.log(`\n⚡ Ready for development!`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();