const express = require('express');
const cors = require('cors');
const path = require('path');
const authRouter = require('./auth').router;
const productRouter = require('./products');
const categoryRouter = require('./categories');

const app = express();
const PORT = process.env.PORT || 3001;  // Render uses 10000

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/categories', categoryRouter);

// Serve admin.html
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});