import { jwtVerify, SignJWT } from 'jose';

const ALGORITHM = 'HS256';

function jwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return new TextEncoder().encode(secret);
}

export async function createAuthToken(payload: { sub: string; email: string; role: string }) {
  return new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(jwtSecret());
}

export async function verifyAuthToken(token: string) {
  const result = await jwtVerify(token, jwtSecret());
  return result.payload;
}
