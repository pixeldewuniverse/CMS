const path = require('path');
const prisma = require('../services/prisma');

async function uploadMedia(req, res) {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const siteId = req.body.siteId;
  const media = await prisma.media.create({
    data: {
      siteId,
      fileName: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      mimeType: req.file.mimetype,
      size: req.file.size
    }
  });

  return res.status(201).json(media);
}

module.exports = { uploadMedia };
