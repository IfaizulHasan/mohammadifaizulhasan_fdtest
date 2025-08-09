import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import emailRoutes from './routes/email';
import passwordRoutes from './routes/password';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));

app.use(cookieParser());
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/auth', emailRoutes);
app.use('/auth', passwordRoutes);

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Hello from Express.js API!', data: {} });
});

// Global error handler
import type { Request, Response, NextFunction } from 'express';
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error', data: {} });
});

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
