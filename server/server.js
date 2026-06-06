import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GoogleGenerativeAI } from '@google/generative-ai';
import db from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-antigravity-key-123';

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
app.post('/api/auth/signup', (req, res) => {
  const { email, password, name, education, contacts } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'Email, password, and name are required' });

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json({ error: 'Error hashing password' });

    db.run(`INSERT INTO users (email, password, name, education, isSetup) VALUES (?, ?, ?, ?, 1)`, [email, hash, name, education], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Email already exists' });
        return res.status(500).json({ error: err.message });
      }
      
      const userId = this.lastID;
      
      // Save contacts
      if (contacts && contacts.length > 0) {
        const stmt = db.prepare(`INSERT INTO contacts (user_id, name, method) VALUES (?, ?, ?)`);
        contacts.forEach(contact => {
          if (contact.name.trim() && contact.method.trim()) {
            stmt.run([userId, contact.name, contact.method]);
          }
        });
        stmt.finalize();
      }

      const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token });
    });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ error: 'Error comparing passwords' });
      if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token });
    });
  });
});

// ==========================================
// PROFILE ROUTES
// ==========================================
app.get('/api/profile', authenticateToken, (req, res) => {
  db.get(`SELECT id, email, name, education, isSetup FROM users WHERE id = ?`, [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'User not found' });

    db.all(`SELECT id, name, method FROM contacts WHERE user_id = ?`, [req.user.id], (err, contacts) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ ...user, isSetup: Boolean(user.isSetup), contacts });
    });
  });
});

app.post('/api/profile', authenticateToken, (req, res) => {
  const { name, education, contacts } = req.body;
  
  db.run(`UPDATE users SET name = ?, education = ?, isSetup = 1 WHERE id = ?`, [name, education, req.user.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    db.run(`DELETE FROM contacts WHERE user_id = ?`, [req.user.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });

      if (contacts && contacts.length > 0) {
        const stmt = db.prepare(`INSERT INTO contacts (user_id, name, method) VALUES (?, ?, ?)`);
        contacts.forEach(contact => {
          stmt.run([req.user.id, contact.name, contact.method]);
        });
        stmt.finalize();
      }
      res.json({ success: true });
    });
  });
});

// ==========================================
// MOOD LOG ROUTES
// ==========================================
app.get('/api/moods', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM mood_logs WHERE user_id = ? ORDER BY date DESC`, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const logs = rows.map(row => ({
      ...row,
      triggers: JSON.parse(row.triggers)
    }));
    res.json(logs);
  });
});

app.post('/api/moods', authenticateToken, (req, res) => {
  const { id, mood, moodText, stressLevel, triggers, notes, date } = req.body;
  db.run(`INSERT INTO mood_logs (id, user_id, mood, moodText, stressLevel, triggers, notes, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, req.user.id, mood, moodText, stressLevel, JSON.stringify(triggers || []), notes, date],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.delete('/api/moods/:id', authenticateToken, (req, res) => {
  db.run(`DELETE FROM mood_logs WHERE id = ? AND user_id = ?`, [req.params.id, req.user.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ==========================================
// CHATBOT ROUTE (SECURE API PROXY)
// ==========================================
app.post('/api/chat', authenticateToken, async (req, res) => {
  try {
    const { message, context } = req.body;
    
    // Always use the backend .env key to hide it from clients!
    const apiKey = process.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_actual_api_key_here') {
      return res.status(500).json({ error: 'Backend Gemini API key not configured properly.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `${context}\n\nUser: ${message}\nAssistant:`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    res.json({ response: responseText });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to generate content.' });
  }
});

// ==========================================
// STATIC FRONTEND SERVING (FOR PRODUCTION)
// ==========================================
// Serve the static files from the React app build directory
app.use(express.static(path.join(__dirname, '../dist')));

// Catch-all route to serve index.html for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
