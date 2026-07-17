import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { getPrisma } from '@/lib/server/db';
import { createSession } from '@/lib/server/auth/session';
import { getInitialAdminUsers, isLocalAuthEnabled, isRegistrationEnabled, normalizeUsername } from '@/lib/server/auth/config';
import { hashPassword, validatePassword } from '@/lib/server/auth/password';

const inputSchema = z.object({ username: z.string().trim().min(3).max(128).regex(/^[a-zA-Z0-9_.-]+$/), password: z.string(), name: z.string().trim().min(1).max(128) });

export async function POST(request: Request) {
  if (!isLocalAuthEnabled()) return apiError('AUTH_PROVIDER_DISABLED', 404, '本地认证未启用');
  if (!isRegistrationEnabled()) return apiError('AUTH_REGISTRATION_DISABLED', 403, '当前未开放注册');
  const prisma = getPrisma();
  if (!prisma) return apiError('INTERNAL_ERROR', 503, '数据库未配置');
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError('INVALID_REQUEST', 400, '注册信息格式不正确');
  const username = normalizeUsername(parsed.data.username);
  const passwordError = validatePassword(parsed.data.password);
  if (passwordError) return apiError('AUTH_PASSWORD_POLICY', 400, passwordError);
  try {
    const passwordHash = await hashPassword(parsed.data.password);
    const role = getInitialAdminUsers().has(username) ? 'admin' : 'student';
    const now = new Date();
    const user = await prisma.$transaction(async (tx) => tx.user.create({
      data: {
        schoolUserId: `local:${username}`, username, name: parsed.data.name, role,
        credentials: { create: { authType: 'local', username, passwordHash } },
        quota: { create: { quotaMonthTokens: 2_000_000n, quotaDayTokens: 200_000n, resetMonthAt: new Date(now.getFullYear(), now.getMonth() + 1, 1), resetDayAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) } },
      },
    }));
    await createSession(user.id);
    return apiSuccess({ user: { id: user.id, username: user.username, name: user.name, role: user.role } }, 201);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return apiError('AUTH_USERNAME_EXISTS', 409, '用户名已存在');
    return apiError('INTERNAL_ERROR', 500, '注册失败');
  }
}
