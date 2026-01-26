const express = require('express');
const router = express.Router();
const { run, get } = require('../database');

// POST /api/auth/login - Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user by username
    const user = await get('SELECT * FROM users WHERE username = ?', [username]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Simple password comparison (no hashing)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Login successful
    res.json({ 
      success: true, 
      username: user.username,
      message: 'Login successful' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/register - Register new user (optional)
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    if (password.length < 3) {
      return res.status(400).json({ error: 'Password must be at least 3 characters' });
    }

    // Check if username already exists
    const existingUser = await get('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Create new user
    const result = await run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, password]
    );

    const newUser = await get('SELECT id, username, createdAt FROM users WHERE id = ?', [result.id]);
    res.status(201).json({ 
      success: true, 
      user: newUser,
      message: 'User registered successfully' 
    });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      res.status(400).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

module.exports = router;
