import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function run() {
  const db = await open({ filename: ':memory:', driver: sqlite3.Database });
  await db.exec(`
    CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT, password TEXT);
    CREATE TABLE categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);
    CREATE TABLE transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, type TEXT, amount REAL, category_id INTEGER, occurred_at DATETIME);
  `);
  await db.run('INSERT INTO users (email,password) VALUES (?,?)', 'a@b.com','x');
  await db.run('INSERT INTO categories (name) VALUES (?)', 'Food');
  const uid = (await db.get('SELECT id FROM users')).id;
  const cid = (await db.get('SELECT id FROM categories')).id;
  await db.run("INSERT INTO transactions (user_id,type,amount,category_id,occurred_at) VALUES (?,?,?,?,?)", uid, 'income', 1000, null, '2025-09-01');
  await db.run("INSERT INTO transactions (user_id,type,amount,category_id,occurred_at) VALUES (?,?,?,?,?)", uid, 'expense', 200, cid, '2025-09-02');
  const income = (await db.get("SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE user_id = ? AND type = 'income'", uid)).total;
  const expense = (await db.get("SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE user_id = ? AND type = 'expense'", uid)).total;
  if (income !== 1000) throw new Error('Income sum mismatch');
  if (expense !== 200) throw new Error('Expense sum mismatch');
}

try {
  await run();
  console.log('summary tests passed');
  process.exit(0);
} catch (e) {
  console.error(e);
  process.exit(1);
}
