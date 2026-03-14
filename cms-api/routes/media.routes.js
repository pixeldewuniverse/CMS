const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadMedia } = require('../controllers/media.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`)
});

const upload = multer({ storage });

const router = express.Router();

router.post('/', requireAuth, upload.single('file'), uploadMedia);

module.exports = router;
