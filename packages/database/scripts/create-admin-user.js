const bcrypt = require('bcryptjs');
const prisma = require('../src/client');

async function main() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { username, password: hash, role: 'ADMIN' },
    create: { email, username, password: hash, role: 'ADMIN' }
  });

  console.log(`Admin user ready: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
