import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { getPrisma } from '@/lib/server/db';
import { createSession } from '@/lib/server/auth/session';
import { getInitialAdminUsers, isLocalAuthEnabled, isRegistrationEnabled, normalizeUsername } from '@/lib/server/auth/config';
import { hashPassword, validatePassword } from '@/lib/server/auth/password';

const inputSchema = z.object({
  schoolUserId: z.string().trim().min(3).max(128).regex(/^[a-zA-Z0-9_.-]+$/),
  email: z.string().trim().email().max(255),
  password: z.string(),
  name: z.string().trim().min(1).max(128),
});

export async function POST(request: Request) {
  if (!isLocalAuthEnabled()) return apiError('AUTH_PROVIDER_DISABLED', 404, '本地认证未启用');
  if (!isRegistrationEnabled()) return apiError('AUTH_REGISTRATION_DISABLED', 403, '当前未开放注册');
  const prisma = getPrisma();
  if (!prisma) return apiError('INTERNAL_ERROR', 503, '数据库未配置');
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError('INVALID_REQUEST', 400, '注册信息格式不正确');
  const schoolUserId = normalizeUsername(parsed.data.schoolUserId);
  const email = parsed.data.email.toLowerCase();
  const passwordError = validatePassword(parsed.data.password);
  if (passwordError) return apiError('AUTH_PASSWORD_POLICY', 400, passwordError);
  try {
    const passwordHash = await hashPassword(parsed.data.password);
    const role = getInitialAdminUsers().has(schoolUserId) ? 'admin' : 'student';
    const now = new Date();
    const user = await prisma.$transaction(async (tx) => tx.user.create({
      data: {
        schoolUserId, username: schoolUserId, name: parsed.data.name, email, role,
        credentials: { create: { authType: 'local', username: schoolUserId, passwordHash } },
        quota: { create: { quotaMonthTokens: 2_000_000n, quotaDayTokens: 200_000n, resetMonthAt: new Date(now.getFullYear(), now.getMonth() + 1, 1), resetDayAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) } },
      },
    }));
    await createSession(user.id);
    return apiSuccess({ user: { id: user.id, schoolUserId: user.schoolUserId, name: user.name, email: user.email, role: user.role } }, 201);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return apiError('AUTH_IDENTITY_EXISTS', 409, '学号/工号或邮箱已被注册');
    return apiError('INTERNAL_ERROR', 500, '注册失败');
  }
}
