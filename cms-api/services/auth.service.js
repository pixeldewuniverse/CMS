const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const signToken = (user) =>
  jwt.sign(
    { sub: user.id, email: user.email, role: user.role, siteId: user.siteId || null },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

const hashPassword = (password) => bcrypt.hash(password, 10);
const verifyPassword = (password, hash) => bcrypt.compare(password, hash);

module.exports = { signToken, hashPassword, verifyPassword };
