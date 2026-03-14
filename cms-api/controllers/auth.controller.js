const prisma = require('../services/prisma');
const { signToken, hashPassword, verifyPassword } = require('../services/auth.service');

async function register(req, res) {
  const { email, password, name, role = 'ADMIN' } = req.body;
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: { email, passwordHash, name, role }
  });

  return res.status(201).json({ token: signToken(user), user: { id: user.id, email: user.email, role: user.role } });
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

  return res.json({ token: signToken(user), user: { id: user.id, email: user.email, role: user.role, siteId: user.siteId } });
}

module.exports = { register, login };
