import { db, transactions } from '../db/index.js';
import { eq } from 'drizzle-orm';

export async function seedTransactions() {
  console.log('🔄 Seeding sample transactions...');

  // Sample transactions for each user
  const sampleTransactions = [
    // Admin transactions
    {
      id: 'txn_admin_1',
      userId: 'admin_default',
      type: 'CASHBACK',
      amount: 500000,
      status: 'COMPLETED',
      store: 'Shopee',
      orderId: 'SHP-ADMIN-001',
      description: 'Mua điện thoại iPhone 15 Pro'
    },
    {
      id: 'txn_admin_2',
      userId: 'admin_default',
      type: 'CASHBACK',
      amount: 300000,
      status: 'COMPLETED',
      store: 'Lazada',
      orderId: 'LZD-ADMIN-002',
      description: 'Mua laptop Dell XPS'
    },
    {
      id: 'txn_admin_3',
      userId: 'admin_default',
      type: 'CASHBACK',
      amount: 200000,
      status: 'PENDING',
      store: 'Tiki',
      orderId: 'TKI-ADMIN-003',
      description: 'Mua sách programming'
    },

    // User1 transactions (Rank BẠC - 5 orders)
    {
      id: 'txn_user1_1',
      userId: 'user_default_1',
      type: 'CASHBACK',
      amount: 150000,
      status: 'COMPLETED',
      store: 'Shopee',
      orderId: 'SHP-U1-001',
      description: 'Mua áo sơ mi H&M'
    },
    {
      id: 'txn_user1_2',
      userId: 'user_default_1',
      type: 'CASHBACK',
      amount: 100000,
      status: 'COMPLETED',
      store: 'Lazada',
      orderId: 'LZD-U1-002',
      description: 'Mua giày Adidas'
    },
    {
      id: 'txn_user1_3',
      userId: 'user_default_1',
      type: 'CASHBACK',
      amount: 80000,
      status: 'COMPLETED',
      store: 'Grab',
      orderId: 'GRB-U1-003',
      description: 'Đi GrabBike'
    },
    {
      id: 'txn_user1_4',
      userId: 'user_default_1',
      type: 'CASHBACK',
      amount: 120000,
      status: 'COMPLETED',
      store: 'Foodpanda',
      orderId: 'FPD-U1-004',
      description: 'Đặt đồ ăn trưa'
    },
    {
      id: 'txn_user1_5',
      type: 'CASHBACK',
      amount: 90000,
      status: 'PENDING',
      store: 'Tiki',
      orderId: 'TKI-U1-005',
      description: 'Mua mỹ phẩm Laneige'
    },

    // User2 transactions (Rank VÀNG - 25 orders)
    {
      id: 'txn_user2_1',
      userId: 'user_default_2',
      type: 'CASHBACK',
      amount: 200000,
      status: 'COMPLETED',
      store: 'Shopee',
      orderId: 'SHP-U2-001',
      description: 'Mua Samsung Galaxy S24'
    },
    {
      id: 'txn_user2_2',
      userId: 'user_default_2',
      type: 'CASHBACK',
      amount: 150000,
      status: 'COMPLETED',
      store: 'Lazada',
      orderId: 'LZD-U2-002',
      description: 'Mua Sony WH-1000XM4'
    }
  ];

  // Generate more transactions for User2 to reach 25 orders
  for (let i = 3; i <= 25; i++) {
    sampleTransactions.push({
      id: `txn_user2_${i}`,
      userId: 'user_default_2',
      type: 'CASHBACK',
      amount: Math.floor(Math.random() * 200000) + 50000,
      status: 'COMPLETED',
      store: ['Shopee', 'Lazada', 'Tiki', 'Grab', 'Foodpanda'][Math.floor(Math.random() * 5)],
      orderId: `ORD-U2-${String(i).padStart(4, '0')}`,
      description: 'Giao dịch mẫu #' + i
    });
  }

  // Generate transactions for User3 (Rank ĐỒNG - 0 orders)
  // No transactions for User3 initially

  const insertTransaction = db.prepare(`
    INSERT OR IGNORE INTO transactions (id, userId, type, amount, status, store, orderId, description, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = Date.now();
  sampleTransactions.forEach(txn => {
    insertTransaction.run(
      txn.id,
      txn.userId,
      txn.type,
      txn.amount,
      txn.status,
      txn.store,
      txn.orderId,
      txn.description,
      now,
      now
    );
  });

  console.log('✅ Sample transactions seeded successfully!');
  console.log('   • Admin: 3 transactions');
  console.log('   • User1: 5 transactions (Rank BẠC)');
  console.log('   • User2: 25 transactions (Rank VÀNG)');
  console.log('   • User3: 0 transactions (Rank ĐỒNG)');
}