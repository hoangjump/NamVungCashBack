import { verifyToken } from '../utils/auth.js';
import { db, users, userSessions } from '../db/index.js';
import { eq } from 'drizzle-orm';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Bạn chưa đăng nhập' });
    }

    const decoded = verifyToken(token);

    // Check if session exists and is valid
    const session = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.token, token))
      .limit(1);

    if (session.length === 0 || new Date(session[0].expiresAt) < new Date()) {
      return res.status(401).json({ error: 'Phiên đăng nhập đã hết hạn' });
    }

    // Get user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(401).json({ error: 'Không tìm thấy người dùng' });
    }

    req.user = user[0];
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token không hợp lệ' });
  }
};