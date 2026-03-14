require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const siteRoutes = require('./routes/site.routes');
const pageRoutes = require('./routes/page.routes');
const postRoutes = require('./routes/post.routes');
const menuRoutes = require('./routes/menu.routes');
const mediaRoutes = require('./routes/media.routes');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static('uploads'));

app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.use('/auth', authRoutes);
app.use('/sites', siteRoutes);
app.use('/pages', pageRoutes);
app.use('/page', pageRoutes);
app.use('/posts', postRoutes);
app.use('/post', postRoutes);
app.use('/menu', menuRoutes);
app.use('/media', mediaRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`CMS API running on http://localhost:${port}`);
});
