import dbPromise from '../../lib/db';
import { verifyToken } from '../../lib/auth';

function getUserFromAuth(req) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const parts = auth.split(' ');
  if (parts.length !== 2) return null;
  try { return verifyToken(parts[1]); } catch (e) { return null; }
}

export default async function handler(req, res) {
  const user = getUserFromAuth(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const db = await dbPromise;

  if (req.method === 'POST') {
    const { type, amount, category_id, note, occurred_at } = req.body;
    if (!type || !amount) return res.status(400).json({ error: 'Missing fields' });
    const info = await db.run('INSERT INTO transactions (user_id, type, amount, category_id, note, occurred_at) VALUES (?, ?, ?, ?, ?, ?)', user.id, type, amount, category_id || null, note || null, occurred_at || new Date().toISOString());
    const tx = await db.get('SELECT * FROM transactions WHERE id = ?', info.lastID);
    return res.json(tx);
  }

  if (req.method === 'GET') {
    const { summary, month, year } = req.query;
    if (summary) {
      let startDate = '1970-01-01', endDate = new Date().toISOString().slice(0,10);
      if (month && year) {
        startDate = `${year}-${String(month).padStart(2,'0')}-01`;
        const d = new Date(year, month, 0);
        endDate = d.toISOString().slice(0,10);
      }
      const incomeRow = await db.get("SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE user_id = ? AND type = 'income' AND date(occurred_at) BETWEEN date(?) AND date(?)", user.id, startDate, endDate);
      const expenseRow = await db.get("SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE user_id = ? AND type = 'expense' AND date(occurred_at) BETWEEN date(?) AND date(?)", user.id, startDate, endDate);
      const balance = incomeRow.total - expenseRow.total;
      const byCategory = await db.all(`SELECT c.name as category, COALESCE(SUM(t.amount),0) as total FROM categories c LEFT JOIN transactions t ON t.category_id = c.id AND t.user_id = ? AND t.type = 'expense' AND date(t.occurred_at) BETWEEN date(?) AND date(?) GROUP BY c.id ORDER BY total DESC`, user.id, startDate, endDate);
      return res.json({ income: incomeRow.total, expenses: expenseRow.total, balance, byCategory });
    }

    // list transactions
    const rows = await db.all('SELECT t.*, c.name as category FROM transactions t LEFT JOIN categories c ON t.category_id = c.id WHERE t.user_id = ? ORDER BY t.occurred_at DESC', user.id);
    return res.json(rows);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
