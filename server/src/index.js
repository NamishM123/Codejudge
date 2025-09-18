import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import txRoutes from './routes/transactions.js';
import dbPromise from './db.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/transactions', txRoutes);

app.get('/api/categories', (req, res) => {
  dbPromise.then(db => db.all('SELECT * FROM categories')).then(rows => res.json(rows)).catch(err=>{console.error(err); res.status(500).json({error:'Server error'})});
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
