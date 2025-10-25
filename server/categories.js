const express = require('express');
const router = express.Router();
const db = require('./db');
const { verifyToken } = require('./auth');

// GET all categories (public)
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT id, name, slug FROM categories ORDER BY name').all();
  res.json(rows);
});

// POST – create new (admin only)
router.post('/', verifyToken, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  try {
    const stmt = db.prepare('INSERT INTO categories (name, slug, created_by) VALUES (?, ?, ?)');
    const info = stmt.run(name, slug, req.user.id);
    res.json({ id: info.lastInsertRowid, name, slug });
  } catch (e) {
    res.status(400).json({ error: 'Category exists' });
  }
});

// DELETE – remove (admin only)
router.delete('/:id', verifyToken, (req, res) => {
  const id = req.params.id;
  const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
  const info = stmt.run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;