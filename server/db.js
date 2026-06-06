import sqlite3Pkg from 'sqlite3';
const sqlite3 = sqlite3Pkg.verbose();
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.resolve(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(path.join(dbDir, 'database.sqlite'), (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      name TEXT,
      education TEXT,
      isSetup BOOLEAN DEFAULT 0
    )`);

    // Create Contacts Table
    db.run(`CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT,
      method TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // Create MoodLogs Table
    db.run(`CREATE TABLE IF NOT EXISTS mood_logs (
      id TEXT PRIMARY KEY,
      user_id INTEGER,
      mood TEXT,
      moodText TEXT,
      stressLevel INTEGER,
      triggers TEXT, -- Stored as JSON string
      notes TEXT,
      date TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);
  }
});

export default db;
