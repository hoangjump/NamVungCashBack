import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  phone: text('phone'),
  password: text('password').notNull().default('123456'),
  role: text('role').notNull().default('USER'),
  rank: text('rank').notNull().default('ĐỒNG'),
  balance: real('balance').notNull().default(0),
  pendingBalance: real('pendingBalance').notNull().default(0),
  withdrawnBalance: real('withdrawnBalance').notNull().default(0),
  totalRefund: real('totalRefund').notNull().default(0),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(() => new Date())
});

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id),
  type: text('type').notNull(), // CASHBACK, WITHDRAWAL, REFUND
  amount: real('amount').notNull(),
  status: text('status').notNull().default('PENDING'), // PENDING, COMPLETED, CANCELLED
  store: text('store'),
  orderId: text('orderId'),
  description: text('description'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(() => new Date())
});

export const stores = sqliteTable('stores', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  logo: text('logo'),
  slug: text('slug').notNull().unique(),
  cashbackRate: real('cashbackRate').notNull(),
  maxCashback: real('maxCashback'),
  category: text('category').notNull(),
  affiliateUrl: text('affiliateUrl'),
  description: text('description'),
  isActive: integer('isActive', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(() => new Date())
});

export const userSessions = sqliteTable('user_sessions', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id),
  token: text('token').notNull().unique(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(() => new Date())
});