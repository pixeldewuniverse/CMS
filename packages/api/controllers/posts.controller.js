const prisma = require('@packages/database/src/client');

async function getPostsBySite(domain) {
  const site = await prisma.site.findUnique({ where: { domain } });
  if (!site) return { error: { status: 404, message: 'Site not found' } };

  const posts = await prisma.post.findMany({
    where: { siteId: site.id, status: 'PUBLISHED' },
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });

  return { data: posts };
}

async function getPostBySlug(domain, slug) {
  const site = await prisma.site.findUnique({ where: { domain } });
  if (!site) return { error: { status: 404, message: 'Site not found' } };

  const post = await prisma.post.findFirst({
    where: { siteId: site.id, slug, status: 'PUBLISHED' },
    include: { category: true }
  });
  if (!post) return { error: { status: 404, message: 'Post not found' } };
  return { data: post };
}

module.exports = { getPostsBySite, getPostBySlug };
