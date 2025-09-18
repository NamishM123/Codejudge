import dbPromise from '../../lib/db';

export default async function handler(req, res) {
  const db = await dbPromise;
  if (req.method === 'GET') {
    const rows = await db.all('SELECT * FROM categories');
    return res.json(rows);
  }
  res.status(405).json({ error: 'Method not allowed' });
}
