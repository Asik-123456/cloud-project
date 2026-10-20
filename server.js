const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Cloud project is running');
});

app.get('/info', (req, res) => {
  res.json({ status: 'ok', variant: process.env.STUDENT_VARIANT || 'not-set' });
});

app.listen(PORT, () => console.log(`Server started on ${PORT}`));

app.get('/rooms', (req, res) => {
  res.json([
    { id: 1, type: 'Single' },
    { id: 2, type: 'Double' },
    { id: 3, type: 'Suite' }
  ]);
});