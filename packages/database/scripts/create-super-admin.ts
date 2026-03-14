import { hash } from 'bcryptjs';
import prisma from '../src/client';

async function createSuperAdmin() {
  const username = process.env.SUPERADMIN_USERNAME || 'superadmin';
  const email = process.env.SUPERADMIN_EMAIL || 'admin@cms.com';
  const password = process.env.SUPERADMIN_PASSWORD || 'admin123';

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }]
    }
  });

  if (existingUser) {
    console.log(`Super Admin already exists: ${existingUser.email} (${existingUser.username})`);
    return;
  }

  const passwordHash = await hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: passwordHash,
      role: 'SUPER_ADMIN'
    }
  });

  console.log(`Super Admin created: ${user.email} (${user.username})`);
}

createSuperAdmin()
  .catch((error) => {
    console.error('Failed to create Super Admin:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
