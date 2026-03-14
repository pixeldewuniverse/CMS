const prisma = require('@packages/database/src/client');
const { requireUser } = require('../services/auth-guard.service');

async function getSites() {
  return prisma.site.findMany({ orderBy: { createdAt: 'desc' } });
}

async function createSite(request) {
  const user = requireUser(request);
  if (!user || !['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
    return { error: { status: 403, message: 'Forbidden' } };
  }

  const body = await request.json();
  const site = await prisma.site.create({
    data: {
      name: body.name,
      domain: body.domain,
      seoTitle: body.seoTitle,
      seoDesc: body.seoDesc
    }
  });

  return { data: site };
}

module.exports = { getSites, createSite };
