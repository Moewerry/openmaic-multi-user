import { describe, expect, it } from 'vitest';
import { hashPassword, validatePassword, verifyPassword } from '@/lib/server/auth/password';

describe('password policy', () => {
  it('rejects weak passwords', () => { expect(validatePassword('password')).not.toBeNull(); expect(validatePassword('12345678')).not.toBeNull(); });
  it('hashes and verifies without storing plaintext', async () => {
    const value = 'Test@123456'; const hashed = await hashPassword(value);
    expect(hashed).not.toContain(value); expect(await verifyPassword(value, hashed)).toBe(true); expect(await verifyPassword('wrong123', hashed)).toBe(false);
  });
});
