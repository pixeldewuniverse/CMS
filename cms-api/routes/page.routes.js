const express = require('express');
const { getPages, getPageBySlug } = require('../controllers/page.controller');

const router = express.Router();

router.get('/', getPages);
router.get('/:slug', getPageBySlug);

module.exports = router;
