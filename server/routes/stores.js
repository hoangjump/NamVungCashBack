import express from 'express';
import { db, stores } from '../db/index.js';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Get all stores
router.get('/', async (req, res) => {
  try {
    const allStores = await db
      .select()
      .from(stores)
      .where(eq(stores.isActive, true));

    res.json({
      success: true,
      stores: allStores
    });
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ error: 'Lỗi khi tải danh sách cửa hàng' });
  }
});

// Get store by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const store = await db
      .select()
      .from(stores)
      .where(eq(stores.slug, slug))
      .limit(1);

    if (store.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy cửa hàng' });
    }

    res.json({
      success: true,
      store: store[0]
    });
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({ error: 'Lỗi khi tải thông tin cửa hàng' });
  }
});

export default router;