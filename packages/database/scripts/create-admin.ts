import { hash } from 'bcryptjs';
import prisma from '../src/client';

async function main() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  const hashedPassword = await hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { username, password: hashedPassword, role: 'ADMIN' },
    create: { email, username, password: hashedPassword, role: 'ADMIN' }
  });

  console.log(`Default admin ready: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
