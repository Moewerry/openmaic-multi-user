import { apiSuccess } from '@/lib/server/api-response';
import { getPrisma } from '@/lib/server/db';
import {
  getServerWebSearchProviders,
  getServerImageProviders,
  getServerVideoProviders,
  getServerTTSProviders,
} from '@/lib/server/provider-config';

const version = process.env.npm_package_version || '0.1.0';

type DatabaseStatus = 'ok' | 'error' | 'skipped';

async function checkDatabase(): Promise<DatabaseStatus> {
  const prisma = getPrisma();
  if (!prisma) {
    return 'skipped';
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return 'ok';
  } catch {
    return 'error';
  }
}

export async function GET() {
  const database = await checkDatabase();

  return apiSuccess({
    status: 'ok',
    version,
    database,
    capabilities: {
      webSearch: Object.keys(getServerWebSearchProviders()).length > 0,
      imageGeneration: Object.keys(getServerImageProviders()).length > 0,
      videoGeneration: Object.keys(getServerVideoProviders()).length > 0,
      tts: Object.values(getServerTTSProviders()).some((info) => !info.disabled),
    },
  });
}
