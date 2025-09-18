import express from 'express';
import dbPromise from '../db.js';
import { hashPassword, comparePassword, signToken } from '../auth.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
  try {
    const db = await dbPromise;
    const hashed = await hashPassword(password);
    const info = await db.run('INSERT INTO users (email, password) VALUES (?, ?)', email, hashed);
    const user = { id: info.lastID, email };
    const token = signToken({ id: user.id, email: user.email });
    res.json({ user, token });
  } catch (err) {
    if (err && err.code === 'SQLITE_CONSTRAINT') return res.status(400).json({ error: 'Email already exists' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
  const db = await dbPromise;
  const user = await db.get('SELECT id, email, password FROM users WHERE email = ?', email);
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const ok = await comparePassword(password, user.password);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
  const token = signToken({ id: user.id, email: user.email });
  res.json({ user: { id: user.id, email: user.email }, token });
});

export default router;
