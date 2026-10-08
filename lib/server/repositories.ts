import { db } from './database';
export type User = { id: number; name: string; email: string; role: 'admin' | 'receptionist'; active: number; password_hash: string };
export type Member = { id: number; name: string; identification: string; phone: string };
export type Plan = { id: number; name: string; price_cents: number; days: number };
export type Membership = { id: number; member_id: number; plan_id: number; memberName: string; identification: string; phone: string; plan: string; startDate: string; expirationDate: string; price_cents: number; paid: number };
export const repository = {
  userByEmail: (email: string) => db().prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined,
  user: (id: number) => db().prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined,
  users: () => db().prepare('SELECT id,name,email,role,active FROM users ORDER BY id').all(),
  addUser: (name: string, email: string, hash: string, role: string) => Number(db().prepare('INSERT INTO users(name,email,password_hash,role) VALUES (?,?,?,?)').run(name,email,hash,role).lastInsertRowid),
  editUser: (id: number, name: string, email: string, role: string, active: number, hash?: string) => db().prepare('UPDATE users SET name=?,email=?,role=?,active=?,password_hash=COALESCE(?,password_hash) WHERE id=?').run(name,email,role,active,hash ?? null,id),
  members: () => db().prepare('SELECT * FROM members ORDER BY id DESC').all() as Member[],
  member: (id: number) => db().prepare('SELECT * FROM members WHERE id=?').get(id) as Member | undefined,
  memberByIdentification: (value: string) => db().prepare('SELECT * FROM members WHERE identification=?').get(value) as Member | undefined,
  addMember: (name: string, identification: string, phone: string) => Number(db().prepare('INSERT INTO members(name,identification,phone) VALUES (?,?,?)').run(name,identification,phone).lastInsertRowid),
  editMember: (id: number, name: string, identification: string, phone: string) => db().prepare('UPDATE members SET name=?,identification=?,phone=? WHERE id=?').run(name,identification,phone,id),
  plans: () => db().prepare('SELECT * FROM plans ORDER BY id').all() as Plan[],
  plan: (id: number) => db().prepare('SELECT * FROM plans WHERE id=?').get(id) as Plan | undefined,
  memberships: () => db().prepare(`SELECT m.id,m.member_id,m.plan_id,b.name memberName,b.identification,b.phone,p.name plan,m.start_date startDate,m.end_date expirationDate,p.price_cents,EXISTS(SELECT 1 FROM payments x WHERE x.membership_id=m.id) paid FROM memberships m JOIN members b ON b.id=m.member_id JOIN plans p ON p.id=m.plan_id ORDER BY m.id DESC`).all() as Membership[],
  membership: (id: number) => db().prepare('SELECT m.*,p.price_cents FROM memberships m JOIN plans p ON p.id=m.plan_id WHERE m.id=?').get(id) as {id:number;price_cents:number} | undefined,
  addMembership: (member: number, plan: number, start: string, end: string, key: string, actor: number) => Number(db().prepare('INSERT INTO memberships(member_id,plan_id,start_date,end_date,request_key,created_by) VALUES (?,?,?,?,?,?)').run(member,plan,start,end,key,actor).lastInsertRowid),
  addPayment: (membership: number, cents: number, actor: number) => Number(db().prepare('INSERT INTO payments(membership_id,amount_cents,paid_at,created_by) VALUES (?,?,?,?)').run(membership,cents,new Date().toISOString(),actor).lastInsertRowid),
  payments: () => db().prepare(`SELECT x.id,x.membership_id,x.amount_cents,x.paid_at,b.name memberName,p.name plan,u.name operator FROM payments x JOIN memberships m ON m.id=x.membership_id JOIN members b ON b.id=m.member_id JOIN plans p ON p.id=m.plan_id JOIN users u ON u.id=x.created_by ORDER BY x.id DESC`).all(),
};
