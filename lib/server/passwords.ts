import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
export function hashPassword(password: string) {
  const salt=randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password,salt,64).toString('hex')}`;
}
export function verifyPassword(password: string, stored: string) {
  const [salt,value]=stored.split(':');
  const expected=Buffer.from(value,'hex');
  return expected.length===64 && timingSafeEqual(scryptSync(password,salt,64),expected);
}
