import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { isAuthenticated } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

const router = express.Router();

interface RateLimitInfo {
  attempts: number;
  blockedUntil: number;
}

const loginAttempts = new Map<string, RateLimitInfo>();

const getIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
    if (Array.isArray(forwarded)) return forwarded[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
};

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const ip = getIp(req);
  const now = Date.now();
  const info = loginAttempts.get(ip);

  if (info && now < info.blockedUntil) {
    const waitSeconds = Math.ceil((info.blockedUntil - now) / 1000);
    return res.status(429).json({
      message: `Terlalu banyak percobaan masuk. Silakan coba lagi setelah ${waitSeconds} detik.`
    });
  }

  try {
    const registerFailedAttempt = () => {
      const currentInfo = loginAttempts.get(ip) || { attempts: 0, blockedUntil: 0 };
      currentInfo.attempts += 1;
      if (currentInfo.attempts >= 5) {
        currentInfo.blockedUntil = Date.now() + 5 * 60 * 1000; // block for 5 minutes
      }
      loginAttempts.set(ip, currentInfo);
    };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      registerFailedAttempt();
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      registerFailedAttempt();
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Set session
    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.name = user.name;

    // Reset attempts on success
    loginAttempts.delete(ip);

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out.' });
    }
    res.clearCookie('sid');
    return res.json({ message: 'Logout successful.' });
  });
});

// GET /api/auth/me
router.get('/me', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.json({ user });
  } catch (error) {
    console.error('Fetch user error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

export default router;
