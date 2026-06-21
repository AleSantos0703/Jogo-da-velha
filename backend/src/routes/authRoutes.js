const express = require('express');
const router = express.Router();
const { registerUser, loginUser, authenticateMiddleware } = require('../services/authService');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await registerUser(email, password);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await loginUser(email, password);
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/auth/profile (protected)
router.get('/profile', authenticateMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
