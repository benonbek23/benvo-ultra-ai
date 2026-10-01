const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Setup storage - use /tmp for Vercel
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '/tmp'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Serve website - FIXED PATH for Vercel
app.use(express.static(path.join(__dirname, 'www')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'index.html'));
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  res.json({ success: true, filename: req.file.filename });
});

app.get('/files', (req, res) => {
  res.json({ message: 'BenvoGodUltra34 Ready!' });
});

app.listen(PORT, () => {
  console.log(`Benvo LIVE at ${PORT}`);
});

module.exports = app;
