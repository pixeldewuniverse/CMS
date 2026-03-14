const express = require('express');
const { getPosts, getPostBySlug } = require('../controllers/post.controller');

const router = express.Router();

router.get('/', getPosts);
router.get('/:slug', getPostBySlug);

module.exports = router;
