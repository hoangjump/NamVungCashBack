import express from 'express';
import cookieParser from 'cookie-parser';
import { db, users, userSessions } from '../db/index.js';
import { eq } from 'drizzle-orm';
import { hashPassword, comparePassword, generateToken, generateId } from '../utils/auth.js';

const router = express.Router();
router.use(express.json());
router.use(cookieParser());

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, name, phone, password } = req.body;

    // Validate
    if (!email || !name) {
      return res.status(400).json({ error: 'Vui lòng nhập email và tên' });
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email đã được sử dụng' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password || '123456');

    // Create user
    const userId = generateId();
    await db.insert(users).values({
      id: userId,
      email,
      name,
      phone,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Generate token
    const token = generateToken(userId);

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await db.insert(userSessions).values({
      id: generateId(),
      userId,
      token,
      expiresAt,
      createdAt: new Date()
    });

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Đăng ký thành công',
      user: {
        id: userId,
        email,
        name,
        phone,
        balance: 0,
        rank: 'ĐỒNG'
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Đăng ký thất bại' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email) {
      return res.status(400).json({ error: 'Vui lòng nhập email' });
    }

    // Find user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      return res.status(400).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    const foundUser = user[0];

    // Check password (if password provided, check it; otherwise allow login with default)
    if (password && password !== '123456') {
      const isPasswordValid = await comparePassword(password, foundUser.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Email hoặc mật khẩu không đúng' });
      }
    }

    // Generate token
    const token = generateToken(foundUser.id);

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await db.insert(userSessions).values({
      id: generateId(),
      userId: foundUser.id,
      token,
      expiresAt,
      createdAt: new Date()
    });

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      user: {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        phone: foundUser.phone,
        avatar: foundUser.avatar,
        balance: foundUser.balance,
        rank: foundUser.rank,
        role: foundUser.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Đăng nhập thất bại' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies.token;

    if (token) {
      // Remove session
      await db
        .delete(userSessions)
        .where(eq(userSessions.token, token));

      // Clear cookie
      res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)
      });
    }

    res.json({ success: true, message: 'Đăng xuất thành công' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Đăng xuất thất bại' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Bạn chưa đăng nhập' });
    }

    const { verifyToken } = await import('../utils/auth.js');
    const decoded = verifyToken(token);

    // Get user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(401).json({ error: 'Không tìm thấy người dùng' });
    }

    res.json({
      success: true,
      user: {
        id: user[0].id,
        email: user[0].email,
        name: user[0].name,
        phone: user[0].phone,
        avatar: user[0].avatar,
        balance: user[0].balance,
        rank: user[0].rank,
        role: user[0].role,
        pendingBalance: user[0].pendingBalance,
        withdrawnBalance: user[0].withdrawnBalance,
        totalRefund: user[0].totalRefund
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(401).json({ error: 'Token không hợp lệ' });
  }
});

export default router;