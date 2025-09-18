import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { open } from 'sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.SQLITE_FILE || path.join(__dirname, '..', 'data', 'finance.db');

let dbPromise = open({
	filename: dbPath,
	driver: sqlite3.Database
});

export default dbPromise;
