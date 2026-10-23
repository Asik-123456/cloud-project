require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(express.json());

// Журналдау: уақыт, әдіс, URL, жауап коды
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  res.on('finish', () => {
    console.log(new Date().toISOString(), req.method, req.url, '->', res.statusCode);
  });
  next();
});

app.get('/', (req, res) => {
  res.send('Cloud project is running');
});

app.get('/info', (req, res) => {
  res.json({ status: 'ok', variant: process.env.STUDENT_VARIANT || 'not-set' });
});

// Health-check: қолданба күйі
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    time: new Date().toISOString()
  });
});

// Health-check: деректер қорымен байланыс
app.get('/health/db', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (err) {
    console.error('Health DB error:', err.message);
    res.status(503).json({ status: 'degraded', database: 'unavailable' });
  }
});

app.get('/api/rooms', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM rooms ORDER BY id');
    res.status(200).json(r.rows);
  } catch (err) {
    console.error('DB error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/rooms/:id', async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) {
    return res.status(400).json({ error: 'id must be a number' });
  }
  try {
    const r = await pool.query('SELECT * FROM rooms WHERE id=$1', [req.params.id]);
    if (r.rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(200).json(r.rows[0]);
  } catch (err) {
    console.error('DB error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/rooms', async (req, res) => {
  const { name, type } = req.body || {};

  if (!name || !type ||
      typeof name !== 'string' || typeof type !== 'string' ||
      !name.trim() || !type.trim()) {
    return res.status(400).json({ error: 'name және type міндетті' });
  }

  try {
    const r = await pool.query(
      'INSERT INTO rooms(name, type) VALUES($1, $2) RETURNING *',
      [name.trim(), type.trim()]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error('DB error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => console.log(`Server started on ${PORT}`));