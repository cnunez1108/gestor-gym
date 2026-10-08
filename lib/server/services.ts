import { db } from './database';
import { repository as r } from './repositories';
import { hashPassword } from './passwords';
import { addDays, membershipStatus, today, validDate } from '../dates';
export class BusinessError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export type Input = Record<string, unknown>;
export function required(input: Input, field: string) {
  const value = input[field];
  if (typeof value !== 'string' || !value.trim() || value.length > 200) throw new BusinessError('Completa todos los campos con valores válidos.');
  return value.trim();
}
export function id(value: unknown) {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value <= 0) throw new BusinessError('Identificador inválido.');
  return value;
}
export function saveUser(input: Input, actor: number, edit?: number) {
  const name=required(input,'name'), email=required(input,'email').toLowerCase(), role=required(input,'role');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new BusinessError('Correo inválido.');
  if (!['admin','receptionist'].includes(role)) throw new BusinessError('Rol inválido.');
  const duplicate=r.userByEmail(email);
  if (duplicate && duplicate.id !== edit) throw new BusinessError('El correo ya está registrado.',409);
  let hash: string | undefined;
  if (!edit || input.password) {
    const password=required(input,'password');
    if (password.length < 8) throw new BusinessError('La contraseña debe tener al menos 8 caracteres.');
    hash=hashPassword(password);
  }
  if (edit) {
    if (!r.user(edit)) throw new BusinessError('Usuario no encontrado.',404);
    if (typeof input.active !== 'boolean') throw new BusinessError('Estado inválido.');
    if (edit === actor && (!input.active || role !== 'admin')) throw new BusinessError('No puedes desactivar tu propia cuenta ni quitarte el rol administrador.');
    r.editUser(edit,name,email,role,input.active ? 1 : 0,hash);
    db().prepare('DELETE FROM sessions WHERE user_id=?').run(edit);
    return {id:edit};
  }
  return {id:r.addUser(name,email,hash!,role)};
}
export function saveMember(input: Input, edit?: number) {
  const name=required(input,'name'), identification=required(input,'identification'), phone=required(input,'phone');
  const duplicate=r.memberByIdentification(identification);
  if (duplicate && duplicate.id !== edit) throw new BusinessError('La identificación ya está registrada.',409);
  if (edit) {
    if (!r.member(edit)) throw new BusinessError('Miembro no encontrado.',404);
    r.editMember(edit,name,identification,phone); return {id:edit};
  }
  return {id:r.addMember(name,identification,phone)};
}
export function pay(input: Input, actor: number) {
  const membership=id(input.membershipId), item=r.membership(membership);
  if (!item) throw new BusinessError('Membresía no encontrada.',404);
  if (input.amountCents !== item.price_cents) throw new BusinessError('El monto debe coincidir con el precio del plan en US$.');
  if (db().prepare('SELECT id FROM payments WHERE membership_id=?').get(membership)) throw new BusinessError('La membresía ya tiene un pago.',409);
  return {id:r.addPayment(membership,item.price_cents,actor)};
}
export function createMembership(input: Input, actor: number) {
  const plan=r.plan(id(input.planId));
  if (!plan) throw new BusinessError('Plan no encontrado.',404);
  const start=required(input,'startDate');
  if (!validDate(start)) throw new BusinessError('Fecha inválida.');
  if (start < today()) throw new BusinessError('La fecha de inicio no puede ser anterior a la fecha actual.');
  const key=required(input,'requestKey');
  if (input.amountCents !== undefined && input.amountCents !== plan.price_cents) throw new BusinessError('El monto debe coincidir con el precio del plan en US$.');
  return db().transaction(() => {
    if (db().prepare('SELECT id FROM memberships WHERE request_key=?').get(key)) throw new BusinessError('Esta solicitud ya fue registrada.',409);
    let member: number;
    if (input.memberId !== undefined) {
      member=id(input.memberId);
      if (!r.member(member)) throw new BusinessError('Miembro no encontrado.',404);
    } else {
      const details=input.member;
      if (!details || typeof details !== 'object' || Array.isArray(details)) throw new BusinessError('Datos de miembro inválidos.');
      const data=details as Input;
      const existing=r.memberByIdentification(required(data,'identification'));
      if (existing) {
        if (existing.name !== required(data,'name') || existing.phone !== required(data,'phone')) throw new BusinessError('La identificación ya está registrada con otros datos.',409);
        member=existing.id;
      } else member=saveMember(data).id;
    }
    const membership=r.addMembership(member,plan.id,start,addDays(start,plan.days),key,actor);
    if (input.amountCents !== undefined) pay({membershipId:membership,amountCents:input.amountCents},actor);
    return {id:membership};
  }).immediate();
}
export function memberships() {
  return r.memberships().map(m => ({...m,amount:m.price_cents/100,status:membershipStatus(m.startDate,m.expirationDate,!!m.paid)}));
}
export function dashboard() {
  const list=memberships();
  const payments=r.payments() as {amount_cents:number}[];
  return {members:r.members().length,memberships:list.length,active:list.filter(m=>m.status==='Activa').length,incomeCents:payments.reduce((sum,p)=>sum+p.amount_cents,0)};
}
