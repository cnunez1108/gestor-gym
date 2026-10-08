import { createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from './database';
import { User } from './repositories';
export const COOKIE = 'stronghub_session';
export { verifyPassword } from './passwords';
export const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');
export async function sessionUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return undefined;
  return db().prepare('SELECT u.* FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token_hash=? AND s.expires_at>? AND u.active=1').get(tokenHash(token),Date.now()) as User | undefined;
}
export function publicUser(user: User) {
  return {id:user.id,name:user.name,email:user.email,role:user.role,active:user.active};
}
export async function pageUser(admin = false) {
  const user = await sessionUser();
  if (!user) redirect('/login');
  if (admin && user.role !== 'admin') redirect('/dashboard');
  return publicUser(user);
}
