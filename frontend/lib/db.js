import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_URL = process.env.DATABASE_URL;

// If DATABASE_URL is provided, use Postgres. Otherwise use SQLite file.
let isPostgres = !!DB_URL;

// SQLite setup
const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
const sqliteFile = process.env.SQLITE_FILE || path.join(dbDir, 'finance-next.db');

let sqlitePromise = open({ filename: sqliteFile, driver: sqlite3.Database });

// Postgres setup
let pgPool = null;
if (isPostgres) {
  pgPool = new pg.Pool({ connectionString: DB_URL, ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false });
}

async function runSqliteMigrations(db) {
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  `);

  const row = await db.get('SELECT COUNT(*) as cnt FROM categories');
  if (!row || row.cnt === 0) {
    const insert = 'INSERT INTO categories (name) VALUES (?)';
    const categories = ['Food','Rent','Entertainment','Savings','Transport','Utilities','Other'];
    for (const name of categories) await db.run(insert, name);
  }
}

async function runPostgresMigrations(pool) {
  await pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    type TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    note TEXT,
    occurred_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
  );
  `);

  const { rows } = await pool.query('SELECT COUNT(*)::int as cnt FROM categories');
  if (rows[0].cnt === 0) {
    const categories = ['Food','Rent','Entertainment','Savings','Transport','Utilities','Other'];
    for (const name of categories) await pool.query('INSERT INTO categories (name) VALUES ($1)', [name]);
  }
}

export async function migrate() {
  if (isPostgres) {
    await runPostgresMigrations(pgPool);
    return;
  }
  const db = await sqlitePromise;
  await runSqliteMigrations(db);
}

// Unified query helpers
export async function query(text, params) {
  if (isPostgres) {
    const res = await pgPool.query(text, params);
    return res;
  }
  const db = await sqlitePromise;
  const stmt = await db.all(text, params);
  return { rows: stmt };
}

export async function get(text, params) {
  if (isPostgres) {
    const res = await pgPool.query(text, params);
    return res.rows[0];
  }
  const db = await sqlitePromise;
  return await db.get(text, params);
}

export async function all(text, params) {
  if (isPostgres) {
    const res = await pgPool.query(text, params);
    return res.rows;
  }
  const db = await sqlitePromise;
  return await db.all(text, params);
}

export async function run(text, params) {
  if (isPostgres) {
    const res = await pgPool.query(text + ' RETURNING id', params);
    return { lastID: res.rows[0].id };
  }
  const db = await sqlitePromise;
  const info = await db.run(text, params);
  return info;
}

export default {
  migrate,
  query,
  get,
  all,
  run,
  isPostgres
};
