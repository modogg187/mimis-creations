const express = require('express');
const router = express.Router();
const db = require('./db');
const upload = require('./upload');
const { verifyToken } = require('./auth');

// GET all (public)
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT p.id, p.name, p.price, p.image, c.slug AS category
    FROM products p
    JOIN categories c ON p.category_id = c.id
    ORDER BY p.id DESC
  `).all();
  res.json(rows);
});

// GET single (for edit form)
router.get('/:id', (req, res) => {
  const row = db.prepare(`
    SELECT p.*, c.id AS category_id
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// POST – create
router.post('/', verifyToken, upload.single('image'), (req, res) => {
  const { name, price, category_id } = req.body;
  if (!name || !price || !category_id || !req.file) {
    return res.status(400).json({ error: 'All fields required' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  const stmt = db.prepare(`
    INSERT INTO products (name, price, category_id, image, created_by)
    VALUES (?, ?, ?, ?, ?)
  `);
  const info = stmt.run(name, price, category_id, imageUrl, req.user.id);
  res.json({ id: info.lastInsertRowid, message: 'Created' });
});

// PUT – update
router.put('/:id', verifyToken, upload.single('image'), (req, res) => {
  const id = req.params.id;
  const { name, price, category_id } = req.body;
  if (!name || !price || !category_id) {
    return res.status(400).json({ error: 'Name, price, category required' });
  }

  let imageUrl = null;
  if (req.file) {
    imageUrl = `/uploads/${req.file.filename}`;
  }

  const updates = [];
  const params = [name, price, category_id];
  let sql = 'UPDATE products SET name = ?, price = ?, category_id = ?';

  if (imageUrl) {
    sql += ', image = ?';
    params.push(imageUrl);
  }
  sql += ' WHERE id = ? AND created_by = ?';
  params.push(id, req.user.id);

  const stmt = db.prepare(sql);
  const info = stmt.run(...params);
  if (info.changes === 0) return res.status(404).json({ error: 'Not found or unauthorized' });
  res.json({ message: 'Updated' });
});

// DELETE
router.delete('/:id', verifyToken, (req, res) => {
  const stmt = db.prepare('DELETE FROM products WHERE id = ? AND created_by = ?');
  const info = stmt.run(req.params.id, req.user.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Not found or unauthorized' });
  res.json({ message: 'Deleted' });
});

module.exports = router;