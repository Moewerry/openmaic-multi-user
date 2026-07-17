import { z } from 'zod';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { getPrisma } from '@/lib/server/db';
import { isLocalAuthEnabled, normalizeUsername } from '@/lib/server/auth/config';
import { localAuthProvider } from '@/lib/server/auth/providers/local';
import { createSession } from '@/lib/server/auth/session';

const inputSchema = z.object({ username: z.string().trim().min(1).max(128), password: z.string().min(1).max(128) });

export async function POST(request: Request) {
  if (!isLocalAuthEnabled()) return apiError('AUTH_PROVIDER_DISABLED', 404, '本地认证未启用');
  const prisma = getPrisma();
  if (!prisma) return apiError('INTERNAL_ERROR', 503, '数据库未配置');
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError('AUTH_INVALID_CREDENTIALS', 401, '用户名或密码错误');
  const username = normalizeUsername(parsed.data.username);
  const identity = await localAuthProvider.authenticate({ username, password: parsed.data.password });
  const credential = identity ? await prisma.userCredential.findUnique({ where: { authType_username: { authType: 'local', username } }, include: { user: true } }) : null;
  if (!credential) {
    await prisma.loginLog.create({ data: { schoolUserId: `local:${username}`, status: 'failed' } });
    return apiError('AUTH_INVALID_CREDENTIALS', 401, '用户名或密码错误');
  }
  if (credential.user.status !== 'active') return apiError('AUTH_USER_DISABLED', 401, '账号已被禁用');
  await createSession(credential.user.id);
  await prisma.$transaction([
    prisma.user.update({ where: { id: credential.user.id }, data: { lastLoginAt: new Date() } }),
    prisma.loginLog.create({ data: { userId: credential.user.id, schoolUserId: credential.user.schoolUserId, status: 'success' } }),
  ]);
  return apiSuccess({ user: { id: credential.user.id, username: credential.user.username, name: credential.user.name, role: credential.user.role } });
}
