import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendMail } from '../utils/email';

const prisma = new PrismaClient();
const router = Router();

// Email Verification
router.get('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, message: 'Token required', data: {} });
    }
    const verification = await prisma.emailVerification.findUnique({ where: { token } });
    if (!verification || verification.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token', data: {} });
    }
    await prisma.user.update({ where: { id: verification.userId }, data: { is_verified: true } });
    await prisma.emailVerification.delete({ where: { id: verification.id } });
    return res.json({ success: true, message: 'Email verified', data: {} });
  } catch (err) {
    next(err);
  }
});

export default router;
