import { afterEach, describe, expect, it } from 'vitest';
import { getInitialAdminUsers, getSessionMaxAge, isLocalAuthEnabled, normalizeUsername } from '@/lib/server/auth/config';

const originalEnv = { ...process.env };
afterEach(() => { process.env = { ...originalEnv }; });

describe('auth config', () => {
  it('normalizes usernames and admin entries', () => {
    process.env.INITIAL_ADMIN_USERS = ' Admin001,teacher001,ADMIN001 ';
    expect(normalizeUsername(' Student001 ')).toBe('student001');
    expect([...getInitialAdminUsers()]).toEqual(['admin001', 'teacher001']);
  });
  it('recognizes local auth and validates session age fallback', () => {
    process.env.AUTH_PROVIDER = 'LOCAL'; process.env.SESSION_MAX_AGE = 'invalid';
    expect(isLocalAuthEnabled()).toBe(true); expect(getSessionMaxAge()).toBe(86400);
  });
});
