import express, { Request, Response } from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import pg from 'pg';
import connectPgSimple from 'connect-pg-simple';
import path from 'path';
import fs from 'fs';

import authRoutes from './routes/auth.js';
import posRoutes from './routes/pos.js';
import adminRoutes from './routes/admin.js';
import dashboardRoutes from './routes/dashboard.js';
import reportsRoutes from './routes/reports.js';

dotenv.config();

const app = express();

// Ensure uploads directory exists (only locally, not on Vercel)
if (!process.env.VERCEL) {
  const uploadsDir = path.join(process.cwd(), 'storage', 'menus');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}
const PORT: number | string = process.env.PORT || 5000;

// CORS setup
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (menu photos, etc.) from /storage
// Redirect to Supabase Storage if SUPABASE_URL environment variable is set
app.get('/storage/menus/:filename', (req, res, next) => {
  if (process.env.SUPABASE_URL) {
    const publicUrl = `${process.env.SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/menus/${req.params.filename}`;
    return res.redirect(publicUrl);
  }
  next();
});
app.get('/storage/settings/:filename', (req, res, next) => {
  if (process.env.SUPABASE_URL) {
    const publicUrl = `${process.env.SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/settings/${req.params.filename}`;
    return res.redirect(publicUrl);
  }
  next();
});
app.use('/storage', express.static(path.join(process.cwd(), 'storage')));

// Session Store Configuration
let sessionStore: session.Store | undefined;
if (process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
  const PgSession = connectPgSimple(session);
  const pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
  });
  sessionStore = new PgSession({
    pool: pgPool,
    tableName: 'session'
  });
} else {
  // Fallback to memory store for development
  console.log('Using Express MemoryStore for sessions...');
}

app.use(session({
  name: 'sid',
  secret: process.env.SESSION_SECRET || 'secret-key-denjavas-pos',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 8, // 8 hours (duration of a shift)
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date() });
});

// Start Server
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

export default app;
