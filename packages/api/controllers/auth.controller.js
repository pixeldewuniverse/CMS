const prisma = require('@packages/database/src/client');
const { signToken, hashPassword, comparePassword } = require('../services/auth.service');

async function register(request) {
  const body = await request.json();
  const passwordHash = await hashPassword(body.password);
  const username = body.username || String(body.email || '').split('@')[0] || `user-${Date.now()}`;

  const user = await prisma.user.create({
    data: {
      email: body.email,
      username,
      password: passwordHash,
      role: body.role || 'ADMIN'
    }
  });

  return { data: { token: signToken(user), user: { id: user.id, email: user.email, role: user.role } } };
}

async function login(request) {
  const body = await request.json();
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) return { error: { status: 401, message: 'Invalid credentials' } };

  const ok = await comparePassword(body.password, user.password);
  if (!ok) return { error: { status: 401, message: 'Invalid credentials' } };

  return { data: { token: signToken(user), user: { id: user.id, email: user.email, role: user.role } } };
}

module.exports = { register, login };
