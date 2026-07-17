import { apiSuccess } from '@/lib/server/api-response';
import { getCurrentUser } from '@/lib/server/auth/authorization';

export async function GET() {
  const user = await getCurrentUser();
  return apiSuccess(user ? { authenticated: true, user } : { authenticated: false });
}
