export const SESSION_COOKIE_NAME = 'openmaic_session';
export const isLocalAuthEnabled = () => process.env.AUTH_PROVIDER?.trim().toLowerCase() === 'local';
export const isRegistrationEnabled = () => process.env.REGISTRATION_ENABLED?.trim().toLowerCase() !== 'false';
export const normalizeUsername = (value: string) => value.trim().toLowerCase();

export function getSessionMaxAge(): number {
  const value = Number.parseInt(process.env.SESSION_MAX_AGE || '86400', 10);
  return Number.isSafeInteger(value) && value > 0 ? value : 86400;
}

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret) throw new Error('SESSION_SECRET is required when local auth is enabled');
  if (process.env.NODE_ENV === 'production' && secret.length < 32) throw new Error('SESSION_SECRET must contain at least 32 characters in production');
  return secret;
}

export function getInitialAdminUsers(): Set<string> {
  return new Set((process.env.INITIAL_ADMIN_USERS || '').split(',').map(normalizeUsername).filter(Boolean));
}
