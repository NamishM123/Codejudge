import express from 'express';
import dbPromise from '../db.js';
import { authMiddleware } from '../auth.js';

const router = express.Router();
router.use(authMiddleware);

// Create transaction
router.post('/', async (req, res) => {
  const { type, amount, category_id, note, occurred_at } = req.body;
  if (!type || !amount) return res.status(400).json({ error: 'Missing type or amount' });
  const db = await dbPromise;
  const info = await db.run('INSERT INTO transactions (user_id, type, amount, category_id, note, occurred_at) VALUES (?, ?, ?, ?, ?, ?)', req.user.id, type, amount, category_id || null, note || null, occurred_at || new Date().toISOString());
  const tx = await db.get('SELECT * FROM transactions WHERE id = ?', info.lastID);
  res.json(tx);
});

// List transactions for user (optional month filter)
router.get('/', async (req, res) => {
  const { month, year } = req.query;
  const db = await dbPromise;
  let rows;
  if (month && year) {
    const start = `${year}-${String(month).padStart(2,'0')}-01`;
    const d = new Date(year, month, 0);
    const end = d.toISOString().slice(0,10);
    rows = await db.all('SELECT t.*, c.name as category FROM transactions t LEFT JOIN categories c ON t.category_id = c.id WHERE t.user_id = ? AND date(t.occurred_at) BETWEEN date(?) AND date(?) ORDER BY t.occurred_at DESC', req.user.id, start, end);
  } else {
    rows = await db.all('SELECT t.*, c.name as category FROM transactions t LEFT JOIN categories c ON t.category_id = c.id WHERE t.user_id = ? ORDER BY t.occurred_at DESC', req.user.id);
  }
  res.json(rows);
});

// Summary: total balance and expenses by category for a given month
router.get('/summary', async (req, res) => {
  const { month, year } = req.query;
  let startDate, endDate;
  if (month && year) {
    startDate = `${year}-${String(month).padStart(2,'0')}-01`;
    const d = new Date(year, month, 0);
    endDate = d.toISOString().slice(0,10);
  } else {
    startDate = '1970-01-01';
    endDate = new Date().toISOString().slice(0,10);
  }

  const db = await dbPromise;

  const incomeRow = await db.get("SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE user_id = ? AND type = 'income' AND date(occurred_at) BETWEEN date(?) AND date(?)", req.user.id, startDate, endDate);
  const expenseRow = await db.get("SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE user_id = ? AND type = 'expense' AND date(occurred_at) BETWEEN date(?) AND date(?)", req.user.id, startDate, endDate);

  const balance = incomeRow.total - expenseRow.total;

  const byCategory = await db.all(`
    SELECT c.name as category, COALESCE(SUM(t.amount),0) as total
    FROM categories c
    LEFT JOIN transactions t ON t.category_id = c.id AND t.user_id = ? AND t.type = 'expense' AND date(t.occurred_at) BETWEEN date(?) AND date(?)
    GROUP BY c.id
    ORDER BY total DESC
  `, req.user.id, startDate, endDate);

  res.json({ income: incomeRow.total, expenses: expenseRow.total, balance, byCategory });
});

export default router;
