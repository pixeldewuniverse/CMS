const prisma = require('../services/prisma');

async function getPosts(req, res) {
  const { site } = req.query;
  const siteRecord = await prisma.site.findUnique({ where: { domain: site } });
  if (!siteRecord) return res.status(404).json({ message: 'Site not found' });

  const posts = await prisma.post.findMany({
    where: { siteId: siteRecord.id, status: 'PUBLISHED' },
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });

  return res.json(posts);
}

async function getPostBySlug(req, res) {
  const { slug } = req.params;
  const { site } = req.query;
  const siteRecord = await prisma.site.findUnique({ where: { domain: site } });
  if (!siteRecord) return res.status(404).json({ message: 'Site not found' });

  const post = await prisma.post.findFirst({
    where: { slug, siteId: siteRecord.id, status: 'PUBLISHED' },
    include: { category: true }
  });

  if (!post) return res.status(404).json({ message: 'Post not found' });
  return res.json(post);
}

module.exports = { getPosts, getPostBySlug };
