const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Cloud project is running');
});

app.get('/info', (req, res) => {
  res.json({ status: 'ok', variant: process.env.STUDENT_VARIANT || 'not-set' });
});

app.get('/api/rooms', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM rooms ORDER BY id');
    res.json(r.rows);
  } catch (err) {
    console.error('DB error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/rooms/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM rooms WHERE id=$1', [req.params.id]);
    res.json(r.rows[0] || null);
  } catch (err) {
    console.error('DB error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/rooms', async (req, res) => {
  try {
    const { name, type } = req.body;
    const r = await pool.query(
      'INSERT INTO rooms(name, type) VALUES($1, $2) RETURNING *',
      [name, type]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error('DB error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(PORT, () => console.log(`Server started on ${PORT}`));