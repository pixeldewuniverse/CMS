const prisma = require('../services/prisma');

async function getSites(req, res) {
  const sites = await prisma.site.findMany({ orderBy: { createdAt: 'desc' } });
  return res.json(sites);
}

async function createSite(req, res) {
  const site = await prisma.site.create({ data: req.body });
  return res.status(201).json(site);
}

module.exports = { getSites, createSite };
