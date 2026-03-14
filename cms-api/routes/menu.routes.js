const express = require('express');
const { getMenu } = require('../controllers/menu.controller');

const router = express.Router();

router.get('/', getMenu);

module.exports = router;
