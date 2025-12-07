import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './server/db/schema.js',
  out: './server/db/migrations',
  driver: 'better-sqlite',
  dbCredentials: {
    url: './server/db/namvung.db'
  },
  verbose: true,
  strict: true
});