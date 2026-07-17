import { apiSuccess } from '@/lib/server/api-response';
import { getPrisma } from '@/lib/server/db';
import { requireSession } from '@/lib/server/auth/authorization';

export async function GET() {
  const auth = await requireSession();
  if ('response' in auth) return auth.response;
  const quota = await getPrisma()?.userQuota.findUnique({ where: { userId: auth.user.id } });
  return apiSuccess({ user: auth.user, quota: quota ? { monthTotal: quota.quotaMonthTokens.toString(), monthUsed: quota.usedMonthTokens.toString(), dayTotal: quota.quotaDayTokens.toString(), dayUsed: quota.usedDayTokens.toString() } : null });
}
