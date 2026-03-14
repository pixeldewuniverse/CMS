const express = require('express');
const { getSites, createSite } = require('../controllers/site.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', getSites);
router.post('/', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN'), createSite);

module.exports = router;
