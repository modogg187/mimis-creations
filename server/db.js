const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mimi.db');
const db = new Database(dbPath);

// Users
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT
  );
`);

// Categories (user-created)
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_by INTEGER,
    FOREIGN KEY(created_by) REFERENCES users(id)
  );
`);

// Products
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category_id INTEGER NOT NULL,
    image TEXT NOT NULL,
    created_by INTEGER,
    FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY(created_by) REFERENCES users(id)
  );
`);

// Seed default categories (optional)
const defaults = [
  { name: 'Necklaces', slug: 'necklaces' },
  { name: 'Earrings', slug: 'earrings' },
  { name: 'Bracelets', slug: 'bracelets' },
  { name: 'Rings', slug: 'rings' }
];

const insertCat = db.prepare('INSERT OR IGNORE INTO categories (name, slug) VALUES (?, ?)');
defaults.forEach(c => insertCat.run(c.name, c.slug));

module.exports = db;