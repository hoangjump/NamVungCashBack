import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { users, transactions, stores, userSessions } from './schema.js';

const sqlite = new Database('./server/db/namvung.db');
export const db = drizzle(sqlite);

// Export all tables
export { users, transactions, stores, userSessions };

// Auto migrate on startup
export async function migrateDatabase() {
  console.log('🔄 Running database migration...');

  // Check if tables exist
  const tables = sqlite.prepare(`
    SELECT name FROM sqlite_master WHERE type='table'
  `).all();

  const tableNames = tables.map(t => t.name);

  // Run schema if tables don't exist
  if (!tableNames.includes('users')) {
    console.log('📝 Creating database tables...');

    sqlite.exec(`
      PRAGMA defer_foreign_keys = ON;
      PRAGMA foreign_keys = OFF;

      CREATE TABLE "users" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "avatar" TEXT,
        "phone" TEXT,
        "password" TEXT NOT NULL DEFAULT '123456',
        "role" TEXT NOT NULL DEFAULT 'USER',
        "rank" TEXT NOT NULL DEFAULT 'ĐỒNG',
        "balance" REAL NOT NULL DEFAULT 0,
        "pendingBalance" REAL NOT NULL DEFAULT 0,
        "withdrawnBalance" REAL NOT NULL DEFAULT 0,
        "totalRefund" REAL NOT NULL DEFAULT 0,
        "createdAt" INTEGER NOT NULL,
        "updatedAt" INTEGER NOT NULL
      );

      CREATE TABLE "transactions" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'PENDING',
        "amount" REAL NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "store" TEXT,
        "orderId" TEXT,
        "description" TEXT,
        "createdAt" INTEGER NOT NULL,
        "updatedAt" INTEGER NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "users"("id")
      );

      CREATE TABLE "stores" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "logo" TEXT,
        "slug" TEXT NOT NULL UNIQUE,
        "cashbackRate" REAL NOT NULL,
        "maxCashback" REAL,
        "category" TEXT NOT NULL,
        "affiliateUrl" TEXT,
        "description" TEXT,
        "isActive" INTEGER NOT NULL DEFAULT 1,
        "createdAt" INTEGER NOT NULL,
        "updatedAt" INTEGER NOT NULL
      );

      CREATE TABLE "user_sessions" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "token" TEXT NOT NULL UNIQUE,
        "expiresAt" INTEGER NOT NULL,
        "createdAt" INTEGER NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "users"("id")
      );

      CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

      PRAGMA foreign_keys = ON;
      PRAGMA defer_foreign_keys = OFF;
    `);

    // Insert default stores
    const defaultStores = [
      {
        id: 'shopee',
        name: 'Shopee',
        logo: 'https://i.ibb.co/L84hQkL/shopee-logo.png',
        slug: 'shopee',
        cashbackRate: 15,
        maxCashback: 100000,
        category: 'Sàn thương mại điện tử',
        affiliateUrl: 'https://shopee.vn',
        description: 'Sàn TMĐT lớn nhất Việt Nam'
      },
      {
        id: 'lazada',
        name: 'Lazada',
        logo: 'https://i.ibb.co/0mM0hHf/lazada-logo.png',
        slug: 'lazada',
        cashbackRate: 10,
        maxCashback: 80000,
        category: 'Sàn thương mại điện tử',
        affiliateUrl: 'https://lazada.vn',
        description: 'Sàn TMĐT hàng đầu Đông Nam Á'
      },
      {
        id: 'tiki',
        name: 'Tiki',
        logo: 'https://i.ibb.co/3p5D6kZ/tiki-logo.png',
        slug: 'tiki',
        cashbackRate: 8,
        maxCashback: 60000,
        category: 'Sàn thương mại điện tử',
        affiliateUrl: 'https://tiki.vn',
        description: 'Mua sắm online hàng đầu Việt Nam'
      },
      {
        id: 'grab',
        name: 'Grab',
        logo: 'https://i.ibb.co/6y5Kc0C/grab-logo.png',
        slug: 'grab',
        cashbackRate: 5,
        maxCashback: 20000,
        category: 'Di chuyển & Giao đồ ăn',
        affiliateUrl: 'https://grab.com',
        description: 'Ứng dụng di chuyển và giao hàng'
      },
      {
        id: 'foodpanda',
        name: 'Foodpanda',
        logo: 'https://i.ibb.co/KzS9mJ9/foodpanda-logo.png',
        slug: 'foodpanda',
        cashbackRate: 7,
        maxCashback: 25000,
        category: 'Giao đồ ăn',
        affiliateUrl: 'https://foodpanda.vn',
        description: 'Giao đồ ăn nhanh chóng'
      }
    ];

    const insertStore = sqlite.prepare(`
      INSERT INTO stores (id, name, logo, slug, cashbackRate, maxCashback, category, affiliateUrl, description, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    defaultStores.forEach(store => {
      insertStore.run(
        store.id,
        store.name,
        store.logo,
        store.slug,
        store.cashbackRate,
        store.maxCashback,
        store.category,
        store.affiliateUrl,
        store.description,
        Date.now(),
        Date.now()
      );
    });

    // Insert default users
    const { hashPassword } = await import('../utils/auth.js');

    const defaultUsers = [
      {
        id: 'admin_default',
        email: 'admin@namvung.vn',
        name: 'Admin NamVung',
        phone: '0901234567',
        password: await hashPassword('admin123'),
        role: 'ADMIN',
        rank: 'KIM CƯƠNG',
        balance: 100000000,
        pendingBalance: 0,
        withdrawnBalance: 0,
        totalRefund: 500000000
      },
      {
        id: 'user_default_1',
        email: 'user1@namvung.vn',
        name: 'Nguyễn Văn A',
        phone: '0909876543',
        password: await hashPassword('123456'),
        role: 'USER',
        rank: 'BẠC',
        balance: 2500000,
        pendingBalance: 500000,
        withdrawnBalance: 3000000,
        totalRefund: 6500000
      },
      {
        id: 'user_default_2',
        email: 'user2@namvung.vn',
        name: 'Trần Thị B',
        phone: '0912345678',
        password: await hashPassword('123456'),
        role: 'USER',
        rank: 'VÀNG',
        balance: 5000000,
        pendingBalance: 1000000,
        withdrawnBalance: 8000000,
        totalRefund: 14000000
      },
      {
        id: 'user_default_3',
        email: 'user3@namvung.vn',
        name: 'Lê Văn C',
        phone: '0923456789',
        password: await hashPassword('123456'),
        role: 'USER',
        rank: 'ĐỒNG',
        balance: 1000000,
        pendingBalance: 200000,
        withdrawnBalance: 1500000,
        totalRefund: 2700000
      }
    ];

    const insertUser = sqlite.prepare(`
      INSERT OR IGNORE INTO users (id, email, name, phone, password, role, rank, balance, pendingBalance, withdrawnBalance, totalRefund, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    defaultUsers.forEach(user => {
      insertUser.run(
        user.id,
        user.email,
        user.name,
        user.phone,
        user.password,
        user.role,
        user.rank,
        user.balance,
        user.pendingBalance,
        user.withdrawnBalance,
        user.totalRefund,
        Date.now(),
        Date.now()
      );
    });

    console.log('✅ Database tables created successfully!');
    console.log('📝 Default accounts created:');
    console.log('   • Admin: admin@namvung.vn / admin123');
    console.log('   • User1: user1@namvung.vn / 123456');
    console.log('   • User2: user2@namvung.vn / 123456');
    console.log('   • User3: user3@namvung.vn / 123456');

    // Seed sample transactions
    const { seedTransactions } = await import('../utils/seedData.js');
    await seedTransactions();
  } else {
    console.log('✅ Database tables already exist');
  }
}