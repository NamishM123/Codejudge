import dbPromise from './db.js';
import fs from 'fs';
import path from 'path';

async function run() {
  // Ensure data directory exists
  const dataDir = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const db = await dbPromise;

  await db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    category_id INTEGER,
    note TEXT,
    occurred_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(category_id) REFERENCES categories(id)
  );
  `);

  const row = await db.get('SELECT COUNT(*) as cnt FROM categories');
  if (!row || row.cnt === 0) {
    const insert = 'INSERT INTO categories (name) VALUES (?)';
    const categories = ['Food','Rent','Entertainment','Savings','Transport','Utilities','Other'];
    for (const name of categories) await db.run(insert, name);
    console.log('Seeded categories');
  }

  console.log('Migration complete');
}

run().catch(err=>{ console.error(err); process.exit(1); });
