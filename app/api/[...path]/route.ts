import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomBytes } from 'node:crypto';
import { db } from '@/lib/server/database';
import { repository as r } from '@/lib/server/repositories';
import { COOKIE, publicUser, sessionUser, tokenHash, verifyPassword } from '@/lib/server/security';
import { BusinessError, createMembership, dashboard, id, memberships, pay, required, saveMember, saveUser } from '@/lib/server/services';
export const runtime='nodejs';
export const dynamic='force-dynamic';
async function handle(request: NextRequest, context: {params:Promise<{path:string[]}>}) {
  try {
    const {path}=await context.params;
    const route=path.join('/'), method=request.method;
    if (method !== 'GET') {
      const origin=request.headers.get('origin');
      if (origin && origin !== request.nextUrl.origin) throw new BusinessError('Origen no permitido.',403);
    }
    const data=method==='GET' ? {} : await request.json().catch(() => {throw new BusinessError('JSON inválido.');});
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new BusinessError('Datos inválidos.');
    if (route==='auth/login' && method==='POST') {
      const email=required(data,'email').toLowerCase(), password=required(data,'password');
      const user=r.userByEmail(email);
      if (!user || !user.active || !verifyPassword(password,user.password_hash)) throw new BusinessError('Correo o contraseña incorrectos.',401);
      const token=randomBytes(32).toString('hex'), seconds=data.remember===true ? 604800 : 28800;
      db().prepare('DELETE FROM sessions WHERE expires_at<=?').run(Date.now());
      db().prepare('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES (?,?,?)').run(tokenHash(token),user.id,Date.now()+seconds*1000);
      (await cookies()).set(COOKIE,token,{httpOnly:true,sameSite:'lax',secure:request.nextUrl.protocol==='https:',path:'/',maxAge:seconds});
      return NextResponse.json(publicUser(user));
    }
    const user=await sessionUser();
    if (!user) throw new BusinessError('Debes iniciar sesión.',401);
    if (route==='auth/logout' && method==='POST') {
      const jar=await cookies(), token=jar.get(COOKIE)?.value;
      if (token) db().prepare('DELETE FROM sessions WHERE token_hash=?').run(tokenHash(token));
      jar.delete(COOKIE); return NextResponse.json({ok:true});
    }
    if (route==='auth/me' && method==='GET') return NextResponse.json(publicUser(user));
    if (path[0]==='users' && user.role!=='admin') throw new BusinessError('Acceso reservado al administrador.',403);
    let result: unknown;
    if (route==='users' && method==='GET') result=r.users();
    else if (route==='users' && method==='POST') result=saveUser(data,user.id);
    else if (path[0]==='users' && path.length===2 && method==='PATCH') result=saveUser(data,user.id,id(Number(path[1])));
    else if (route==='members' && method==='GET') result=r.members();
    else if (route==='members' && method==='POST') result=saveMember(data);
    else if (path[0]==='members' && path.length===2 && method==='PATCH') result=saveMember(data,id(Number(path[1])));
    else if (route==='plans' && method==='GET') result=r.plans();
    else if (route==='memberships' && method==='GET') result=memberships();
    else if (route==='memberships' && method==='POST') result=createMembership(data,user.id);
    else if (route==='payments' && method==='GET') result=r.payments();
    else if (route==='payments' && method==='POST') result=pay(data,user.id);
    else if (route==='dashboard' && method==='GET') result=dashboard();
    else throw new BusinessError('Ruta no encontrada.',404);
    return NextResponse.json(result,{status:method==='POST'?201:200,headers:{'Cache-Control':'no-store'}});
  } catch (error) {
    if (error instanceof BusinessError) return NextResponse.json({error:error.message},{status:error.status});
    if ((error as {code?:string}).code?.startsWith('SQLITE_CONSTRAINT')) return NextResponse.json({error:'El registro ya existe o incumple una restricción.'},{status:409});
    console.error(error); return NextResponse.json({error:'Error interno del servidor.'},{status:500});
  }
}
export const GET=handle;
export const POST=handle;
export const PATCH=handle;
