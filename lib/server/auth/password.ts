import { compare, hash } from 'bcryptjs';

export function validatePassword(password: string): string | null {
  if (password.length < 8 || password.length > 128) return '密码长度应为 8 到 128 个字符';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return '密码至少包含一个字母和一个数字';
  return null;
}

export const hashPassword = (password: string) => hash(password, 12);
export const verifyPassword = (password: string, passwordHash: string) => compare(password, passwordHash);
