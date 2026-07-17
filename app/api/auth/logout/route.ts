import { apiSuccess } from '@/lib/server/api-response';
import { revokeCurrentSession } from '@/lib/server/auth/session';

export async function POST() {
  await revokeCurrentSession();
  return apiSuccess({ authenticated: false });
}
