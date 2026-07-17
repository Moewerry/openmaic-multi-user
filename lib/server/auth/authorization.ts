import type { UserRole } from '@prisma/client';
import { apiError } from '@/lib/server/api-response';
import { readSession } from './session';

export async function getCurrentUser() {
  const session = await readSession();
  if (!session || session.revokedAt || session.expiresAt <= new Date() || session.user.status !== 'active') return null;
  const { id, username, name, email, role, status } = session.user;
  return { id, username, name, email, role, status };
}

export async function requireSession() {
  const user = await getCurrentUser();
  return user ? { user } : { response: apiError('AUTH_REQUIRED', 401, '请先登录') };
}

export async function requireRole(...roles: UserRole[]) {
  const auth = await requireSession();
  if ('response' in auth) return auth;
  return roles.includes(auth.user.role) ? auth : { response: apiError('AUTH_FORBIDDEN', 403, '没有执行此操作的权限') };
}
