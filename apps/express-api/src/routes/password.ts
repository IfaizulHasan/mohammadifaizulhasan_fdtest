import { Router } from 'express';
import { forgotPasswordSchema, resetPasswordSchema } from '@shared/authSchemas';
import { PrismaClient } from '@prisma/client';
import { sendMail } from '../utils/email';
import { hashPassword } from '../utils/password';
import crypto from 'crypto';

const prisma = new PrismaClient();
const router = Router();

// Forgot Password
router.post('/forgot-password', async (req, res, next) => {
  try {
    const result = forgotPasswordSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, message: 'Invalid input', data: result.error.issues });
    }
    const { email } = result.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(200).json({ success: true, message: 'Check your email for password reset link', data: {} });
    }
    const token = crypto.randomBytes(32).toString('hex');
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });
    await sendMail({
      to: email,
      subject: 'Password Reset',
      text: `Reset your password: ${process.env.FRONTEND_URL}/reset-password?token=${token}`,
    });
    return res.json({ success: true, message: 'Check your email for password reset link', data: {} });
  } catch (err) {
    next(err);
  }
});

// Reset Password
router.post('/reset-password', async (req, res, next) => {
  try {
    const result = resetPasswordSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, message: 'Invalid input', data: result.error.issues });
    }
    const { token, password } = result.data;
    const reset = await prisma.passwordReset.findUnique({ where: { token } });
    if (!reset || reset.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token', data: {} });
    }
    const hashed = await hashPassword(password);
    await prisma.user.update({ where: { id: reset.userId }, data: { password: hashed } });
    await prisma.passwordReset.delete({ where: { id: reset.id } });
    return res.json({ success: true, message: 'Password reset successful', data: {} });
  } catch (err) {
    next(err);
  }
});

export default router;
