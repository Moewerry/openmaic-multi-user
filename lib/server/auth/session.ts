import { createHmac, randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import { getPrisma } from '@/lib/server/db';
import { getSessionMaxAge, getSessionSecret, SESSION_COOKIE_NAME } from './config';

const hashToken = (token: string) => createHmac('sha256', getSessionSecret()).update(token).digest('hex');

export async function createSession(userId: string): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) throw new Error('DATABASE_URL is required for local auth');
  const token = randomBytes(32).toString('base64url');
  const maxAge = getSessionMaxAge();
  await prisma.authSession.create({ data: { userId, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + maxAge * 1000) } });
  (await cookies()).set(SESSION_COOKIE_NAME, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge });
}

export async function readSession() {
  const prisma = getPrisma();
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!prisma || !token) return null;
  return prisma.authSession.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: true } });
}

export async function revokeCurrentSession(): Promise<void> {
  const prisma = getPrisma();
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (prisma && token) await prisma.authSession.updateMany({ where: { tokenHash: hashToken(token), revokedAt: null }, data: { revokedAt: new Date() } });
  store.delete(SESSION_COOKIE_NAME);
}
