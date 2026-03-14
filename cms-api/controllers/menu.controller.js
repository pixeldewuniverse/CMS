const prisma = require('../services/prisma');

async function getMenu(req, res) {
  const { site, location = 'main' } = req.query;
  const siteRecord = await prisma.site.findUnique({ where: { domain: site } });
  if (!siteRecord) return res.status(404).json({ message: 'Site not found' });

  const menu = await prisma.menu.findFirst({
    where: { siteId: siteRecord.id, location },
    include: { items: { orderBy: { order: 'asc' } } }
  });

  return res.json(menu || { name: location, items: [] });
}

module.exports = { getMenu };
