const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Safe folder create - won't crash on Vercel
try { if (!fs.existsSync('www')) fs.mkdirSync('www'); } catch(e) {}
try { if (!fs.existsSync('uploads')) fs.mkdirSync('uploads'); } catch(e) {}

// Setup storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '/tmp'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Serve your website files
app.use(express.static('www'));
app.use('/uploads', express.static('uploads'));

// Upload API
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  res.json({
    success: true,
    filename: req.file.filename,
    original: req.file.originalname,
    url: `/uploads/${req.file.filename}`
  });
});

// List files API
app.get('/files', (req, res) => {
  try {
    if (!fs.existsSync('uploads')) return res.json([]);
    const files = fs.readdirSync('uploads').map(f => ({
      name: f,
      url: `/uploads/${f}`,
      size: fs.statSync(path.join('uploads', f)).size
    }));
    res.json(files);
  } catch(e) {
    res.json([]);
  }
});

app.listen(PORT, () => {
  console.log(`BenvoGodUltra34 LIVE at http://localhost:${PORT}`);
});

module.exports = app;
