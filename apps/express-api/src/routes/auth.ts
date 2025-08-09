import { Router } from 'express';
import { z } from 'zod';
import { registerSchema, loginSchema } from '@shared/authSchemas';
import { hashPassword, comparePassword } from '../utils/password';
import { signAccessToken, signRefreshToken } from '../utils/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Registration
router.post('/register', async (req, res, next) => {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, message: 'Invalid input', data: result.error.issues });
    }
    const { name, email, password } = result.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered', data: {} });
    }
    const hashed = await hashPassword(password);
    const user = await prisma.user.create({ data: { name, email, password: hashed } });
    // TODO: Generate email verification token and send email
    return res.status(201).json({ success: true, message: 'Registration successful', data: { userId: user.id } });
  } catch (err) {
    next(err);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, message: 'Invalid input', data: result.error.issues });
    }
    const { email, password } = result.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password', data: {} });
    }
    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password', data: {} });
    }
    // Generate tokens
    const accessToken = signAccessToken({ userId: user.id });
    const refreshToken = signRefreshToken({ userId: user.id });
    // Save refresh token in DB
    await prisma.session.create({ data: { userId: user.id, refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
    // Set HTTP-only cookie
    res.cookie('access_token', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.cookie('refresh_token', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    return res.json({ success: true, message: 'Login successful', data: {} });
  } catch (err) {
    next(err);
  }
});

export default router;
