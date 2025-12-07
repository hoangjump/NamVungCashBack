import express from 'express';
import { db, users, transactions, stores, userSessions } from '../db/index.js';
import { eq, and, like, desc } from 'drizzle-orm';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all dashboard routes
router.use(authenticate);

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    // Get user info from middleware
    const userId = req.user.id;

    // Count completed orders
    const completedOrders = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .where(eq(transactions.status, 'COMPLETED'));

    // Count pending orders
    const pendingOrders = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .where(eq(transactions.status, 'PENDING'));

    // Get user balance info
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate total refund from completed orders
    const totalRefund = completedOrders.reduce((sum, order) => sum + order.amount, 0);

    res.json({
      success: true,
      data: {
        completedOrders: completedOrders.length,
        pendingOrders: pendingOrders.length,
        totalRefund: totalRefund + user[0].totalRefund,
        availableBalance: user[0].balance,
        rank: user[0].rank
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get recent transactions
router.get('/transactions', async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    const userTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(transactions.createdAt, 'desc')
      .limit(limit);

    res.json({
      success: true,
      data: userTransactions.map(t => ({
        id: t.id,
        orderId: t.orderId,
        store: t.store,
        amount: t.amount,
        status: t.status,
        description: t.description,
        createdAt: t.createdAt
      }))
    });
  } catch (error) {
    console.error('Transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get rank progress
router.get('/rank-progress', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user info
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate rank requirements
    const rankRequirements = {
      'ĐỒNG': { minOrders: 0, nextRank: 'BẠC', ordersNeeded: 10 },
      'BẠC': { minOrders: 10, nextRank: 'VÀNG', ordersNeeded: 25 },
      'VÀNG': { minOrders: 25, nextRank: 'BẠCH KIM CƯƠNG', ordersNeeded: 50 },
      'BẠCH KIM CƯƠNG': { minOrders: 50, nextRank: 'KIM CƯƠNG', ordersNeeded: 100 },
      'KIM CƯƠNG': { minOrders: 100, nextRank: null, ordersNeeded: 0 }
    };

    // Count completed orders
    const completedOrders = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .where(eq(transactions.status, 'COMPLETED'));

    const orderCount = completedOrders.length;
    const currentRankInfo = rankRequirements[user[0].rank];

    let progress = 0;
    let ordersNeeded = 0;

    if (currentRankInfo.nextRank) {
      progress = (orderCount / currentRankInfo.ordersNeeded) * 100;
      ordersNeeded = Math.max(0, currentRankInfo.ordersNeeded - orderCount);
    } else {
      progress = 100;
    }

    res.json({
      success: true,
      data: {
        currentRank: user[0].rank,
        orderCount,
        totalOrdersNeeded: currentRankInfo.ordersNeeded || 0,
        ordersNeeded,
        progress: Math.min(progress, 100),
        nextRank: currentRankInfo.nextRank
      }
    });
  } catch (error) {
    console.error('Rank progress error:', error);
    res.status(500).json({ error: 'Failed to fetch rank progress' });
  }
});

// Get all orders (with pagination and filtering)
router.get('/orders', async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const search = req.query.search;
    const offset = (page - 1) * limit;

    let query = db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId));

    // Apply status filter
    if (status && status !== 'all') {
      query = query.where(eq(transactions.status, status.toUpperCase()));
    }

    // Apply search filter
    if (search) {
      query = query.where(
        like(transactions.orderId, `%${search}%`)
      );
    }

    const orders = await query
      .orderBy(desc(transactions.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    let countQuery = db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId));

    if (status && status !== 'all') {
      countQuery = countQuery.where(eq(transactions.status, status.toUpperCase()));
    }
    if (search) {
      countQuery = countQuery.where(like(transactions.orderId, `%${search}%`));
    }

    const totalCount = await countQuery;
    const totalPages = Math.ceil(totalCount.length / limit);

    res.json({
      success: true,
      data: {
        orders: orders.map(order => ({
          id: order.id,
          orderId: order.orderId,
          store: order.store,
          amount: order.amount,
          status: order.status,
          type: order.type,
          description: order.description,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalOrders: totalCount.length,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get all stores/products
router.get('/stores', async (req, res) => {
  try {
    const category = req.query.category;
    let query = db.select().from(stores).where(eq(stores.isActive, 1));

    if (category) {
      query = query.where(eq(stores.category, category));
    }

    const allStores = await query.orderBy(stores.name);

    // Get unique categories
    const categories = await db
      .selectDistinct({ category: stores.category })
      .from(stores)
      .where(eq(stores.isActive, 1));

    res.json({
      success: true,
      data: {
        stores: allStores.map(store => ({
          id: store.id,
          name: store.name,
          logo: store.logo,
          slug: store.slug,
          cashbackRate: store.cashbackRate,
          maxCashback: store.maxCashback,
          category: store.category,
          affiliateUrl: store.affiliateUrl,
          description: store.description
        })),
        categories: categories.map(c => c.category)
      }
    });
  } catch (error) {
    console.error('Stores error:', error);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

// Get wallet/balance information
router.get('/wallet', async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get recent transactions for wallet activity
    const recentTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(5);

    // Get monthly stats
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getTime();

    const monthlyTransactions = await db
      .select()
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.status, 'COMPLETED')
      ))
      .where(transactions.createdAt >= firstDayOfMonth);

    const monthlyEarnings = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);

    res.json({
      success: true,
      data: {
        balance: user[0].balance,
        pendingBalance: user[0].pendingBalance,
        withdrawnBalance: user[0].withdrawnBalance,
        totalRefund: user[0].totalRefund,
        rank: user[0].rank,
        monthlyEarnings,
        recentTransactions: recentTransactions.map(t => ({
          id: t.id,
          orderId: t.orderId,
          store: t.store,
          amount: t.amount,
          status: t.status,
          type: t.type,
          description: t.description,
          createdAt: t.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Wallet error:', error);
    res.status(500).json({ error: 'Failed to fetch wallet information' });
  }
});

// Request withdrawal
router.post('/wallet/withdraw', async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, bankName, accountNumber, accountHolder } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Số tiền không hợp lệ' });
    }

    // Get user info
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check balance
    if (amount > user[0].balance) {
      return res.status(400).json({ error: 'Số dư không đủ' });
    }

    // Create withdrawal transaction
    const withdrawalId = 'WD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    await db.insert(transactions).values({
      id: withdrawalId,
      userId,
      type: 'WITHDRAWAL',
      amount: -amount,
      status: 'PENDING',
      store: 'Bank Transfer',
      orderId: withdrawalId,
      description: `Rút tiền - ${bankName} (${accountNumber})`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    // Update user balance
    await db
      .update(users)
      .set({
        balance: user[0].balance - amount,
        pendingBalance: user[0].pendingBalance + amount,
        updatedAt: Date.now()
      })
      .where(eq(users.id, userId));

    res.json({
      success: true,
      message: 'Yêu cầu rút tiền đã được gửi thành công',
      data: {
        withdrawalId,
        amount,
        status: 'PENDING'
      }
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatar: users.avatar,
        phone: users.phone,
        rank: users.rank,
        balance: users.balance,
        pendingBalance: users.pendingBalance,
        withdrawnBalance: users.withdrawnBalance,
        totalRefund: users.totalRefund,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get stats for profile
    const completedOrders = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.status, 'COMPLETED')));

    const totalCashback = completedOrders.reduce((sum, t) => sum + t.amount, 0);
    const favoriteStore = await db
      .select({ store: transactions.store, count: transactions.id })
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .groupBy(transactions.store)
      .orderBy(desc(count))
      .limit(1);

    res.json({
      success: true,
      data: {
        user: user[0],
        stats: {
          totalOrders: completedOrders.length,
          totalCashback,
          favoriteStore: favoriteStore[0]?.store || 'N/A',
          memberSince: user[0].createdAt
        }
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, avatar } = req.body;

    // Validate input
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Tên không được để trống' });
    }

    // Update user
    await db
      .update(users)
      .set({
        name: name.trim(),
        phone: phone || null,
        avatar: avatar || null,
        updatedAt: Date.now()
      })
      .where(eq(users.id, userId));

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/account/password', async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    // Get user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const { verifyPassword } = await import('../utils/auth.js');
    const isValid = await verifyPassword(currentPassword, user[0].password);

    if (!isValid) {
      return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng' });
    }

    // Hash new password
    const { hashPassword } = await import('../utils/auth.js');
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: Date.now()
      })
      .where(eq(users.id, userId));

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get account settings
router.get('/account/settings', async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        phone: users.phone,
        avatar: users.avatar,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        user: user[0],
        settings: {
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          newsletter: true
        }
      }
    });
  } catch (error) {
    console.error('Account settings error:', error);
    res.status(500).json({ error: 'Failed to fetch account settings' });
  }
});

// Delete account
router.delete('/account', async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Vui lòng nhập mật khẩu để xác nhận' });
    }

    // Get user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const { verifyPassword } = await import('../utils/auth.js');
    const isValid = await verifyPassword(password, user[0].password);

    if (!isValid) {
      return res.status(400).json({ error: 'Mật khẩu không đúng' });
    }

    // Delete user transactions
    await db
      .delete(transactions)
      .where(eq(transactions.userId, userId));

    // Delete user sessions
    await db
      .delete(userSessions)
      .where(eq(userSessions.userId, userId));

    // Delete user
    await db
      .delete(users)
      .where(eq(users.id, userId));

    res.json({
      success: true,
      message: 'Tài khoản đã được xóa thành công'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;