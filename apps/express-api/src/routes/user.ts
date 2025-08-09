import { Router, Request, Response, NextFunction } from 'express';
import { changePasswordSchema } from '@shared/authSchemas';
import { hashPassword, comparePassword } from '../utils/password';
import { PrismaClient } from '@prisma/client';
import { verifyAccessToken } from '../utils/jwt';

const prisma = new PrismaClient();
const router = Router();

// Auth middleware
interface AuthenticatedRequest extends Request {
  user?: any;
}

function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.access_token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized', data: {} });
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token', data: {} });
  }
}

// Change Password
router.post('/change-password', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = changePasswordSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, message: 'Invalid input', data: result.error.issues });
    }
    const { currentPassword, newPassword } = result.data;
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'User not found', data: {} });
    }
    const valid = await comparePassword(currentPassword, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Current password incorrect', data: {} });
    }
    const hashed = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    // Invalidate all refresh tokens
    await prisma.session.deleteMany({ where: { userId } });
    return res.json({ success: true, message: 'Password changed successfully', data: {} });
  } catch (err) {
    next(err);
  }
});

export default router;
