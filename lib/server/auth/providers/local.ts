import { getPrisma } from '@/lib/server/db';
import { normalizeUsername } from '../config';
import { verifyPassword } from '../password';
import type { AuthProvider } from './types';

export const localAuthProvider: AuthProvider<{ schoolUserId: string; password: string }> = {
  id: 'local',
  async authenticate({ schoolUserId, password }) {
    const prisma = getPrisma();
    if (!prisma) return null;
    const normalized = normalizeUsername(schoolUserId);
    const credential = await prisma.userCredential.findUnique({ where: { authType_username: { authType: 'local', username: normalized } }, include: { user: true } });
    if (!credential?.passwordHash || !(await verifyPassword(password, credential.passwordHash))) return null;
    return { authType: 'local', username: normalized, displayName: credential.user.name || undefined, email: credential.user.email || undefined };
  },
};
