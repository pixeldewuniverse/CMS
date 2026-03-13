const prisma = require('@packages/database/src/client');

async function getPagesBySite(domain) {
  const site = await prisma.site.findUnique({ where: { domain } });
  if (!site) return { error: { status: 404, message: 'Site not found' } };

  const pages = await prisma.page.findMany({
    where: { siteId: site.id, status: 'PUBLISHED' },
    orderBy: { updatedAt: 'desc' }
  });

  return { data: pages };
}

async function getPageBySlug(domain, slug) {
  const site = await prisma.site.findUnique({ where: { domain } });
  if (!site) return { error: { status: 404, message: 'Site not found' } };

  const page = await prisma.page.findFirst({ where: { siteId: site.id, slug, status: 'PUBLISHED' } });
  if (!page) return { error: { status: 404, message: 'Page not found' } };
  return { data: page };
}

module.exports = { getPagesBySite, getPageBySlug };
