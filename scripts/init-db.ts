import { db } from '../lib/server/database';
import { repository as r } from '../lib/server/repositories';
import { createMembership, saveUser } from '../lib/server/services';
import { today } from '../lib/dates';

export function initialize(demo=false) {
  db();
  const email=process.env.ADMIN_EMAIL?.trim().toLowerCase(), password=process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error('Configura ADMIN_EMAIL y ADMIN_PASSWORD (mínimo 8 caracteres).');
  const existing=r.userByEmail(email);
  if (existing && (existing.role !== 'admin' || !existing.active)) throw new Error('ADMIN_EMAIL pertenece a una cuenta que no es un administrador activo. Elige otro correo.');
  const admin=existing?.id ?? saveUser({name:process.env.ADMIN_NAME||'Administrador',email,password,role:'admin'},0).id;
  if (demo) {
    const receptionEmail='recepcion@stronghub.com';
    if (!r.userByEmail(receptionEmail)) {
      if (!process.env.DEMO_RECEPTION_PASSWORD) throw new Error('Configura DEMO_RECEPTION_PASSWORD para cargar la demostración.');
      saveUser({name:'Recepción Demo',email:receptionEmail,password:process.env.DEMO_RECEPTION_PASSWORD,role:'receptionist'},admin);
    }
    if (!db().prepare('SELECT id FROM memberships WHERE request_key=?').get('demo-membership')) createMembership({member:{name:'Juan Pérez (ficticio)',identification:'DEMO-001',phone:'70000001'},planId:1,startDate:today(),amountCents:3000,requestKey:'demo-membership'},admin);
  }
  return admin;
}
if (process.argv[1]?.endsWith('init-db.ts')) {
  initialize(process.argv.includes('--demo'));
  console.log('Base inicializada. Los registros existentes fueron conservados.');
}
