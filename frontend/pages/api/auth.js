import dbPromise from '../../lib/db';
import { hashPassword, comparePassword, signToken } from '../../lib/auth';

export default async function handler(req, res) {
  const db = await dbPromise;
  if (req.method === 'POST') {
    const { action } = req.query;
    if (action === 'signup' || req.query.action === 'signup' || req.body.action === 'signup') {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
      try {
        const hashed = await hashPassword(password);
        const info = await db.run('INSERT INTO users (email, password) VALUES (?, ?)', email, hashed);
        const user = { id: info.lastID, email };
        const token = signToken({ id: user.id, email: user.email });
        return res.json({ user, token });
      } catch (err) {
        if (err && err.code === 'SQLITE_CONSTRAINT') return res.status(400).json({ error: 'Email already exists' });
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
      }
    }

    if (req.query.action === 'login' || req.body.action === 'login' || action === 'login') {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
      const user = await db.get('SELECT id,email,password FROM users WHERE email = ?', email);
      if (!user) return res.status(400).json({ error: 'Invalid credentials' });
      const ok = await comparePassword(password, user.password);
      if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
      const token = signToken({ id: user.id, email: user.email });
      return res.json({ user: { id: user.id, email: user.email }, token });
    }
  }
  res.status(405).json({ error: 'Method not allowed' });
}
