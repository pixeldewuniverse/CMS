const prisma = require('../services/prisma');

async function getPages(req, res) {
  const domain = req.query.site;
  const site = await prisma.site.findUnique({ where: { domain } });
  if (!site) return res.status(404).json({ message: 'Site not found' });

  const pages = await prisma.page.findMany({
    where: { siteId: site.id, status: 'PUBLISHED' },
    orderBy: { updatedAt: 'desc' }
  });

  return res.json(pages);
}

async function getPageBySlug(req, res) {
  const { slug } = req.params;
  const domain = req.query.site;
  const site = await prisma.site.findUnique({ where: { domain } });
  if (!site) return res.status(404).json({ message: 'Site not found' });

  const page = await prisma.page.findFirst({ where: { siteId: site.id, slug, status: 'PUBLISHED' } });
  if (!page) return res.status(404).json({ message: 'Page not found' });

  return res.json(page);
}

module.exports = { getPages, getPageBySlug };
