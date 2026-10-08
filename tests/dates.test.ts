import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addDays, membershipStatus, today, validDate } from '../lib/dates';
import { hashPassword, verifyPassword } from '../lib/server/passwords';
test('Fechas válidas y rechazo de calendario imposible',()=>{
  assert.ok(validDate(today())); assert.ok(validDate('2024-02-29'));
  assert.ok(!validDate('2026-02-29'));assert.ok(!validDate('2026-13-01'));assert.ok(!validDate('2026-1-01'));
});
test('Duración por días, mes y año bisiesto',()=>{
  assert.equal(addDays('2026-09-01',30),'2026-10-01');assert.equal(addDays('2024-02-28',1),'2024-02-29');
  assert.equal(addDays('2026-12-01',90),'2027-03-01');assert.equal(addDays('2024-01-01',365),'2024-12-31');
});
test('Estados y límites exclusivos del vencimiento',()=>{
  assert.equal(membershipStatus('2026-01-01','2026-01-31',true,'2025-12-31'),'Pendiente');
  assert.equal(membershipStatus('2026-01-01','2026-01-31',false,'2026-01-10'),'Pendiente');
  assert.equal(membershipStatus('2026-01-01','2026-01-31',true,'2026-01-01'),'Activa');
  assert.equal(membershipStatus('2026-01-01','2026-01-31',true,'2026-01-30'),'Activa');
  assert.equal(membershipStatus('2026-01-01','2026-01-31',true,'2026-01-31'),'Vencida');
  assert.equal(membershipStatus('2026-01-01','2026-01-31',false,'2026-02-01'),'Vencida');
});
test('Hash con salt, contraseña correcta e incorrecta',()=>{
  const first=hashPassword('TestClave123!'),second=hashPassword('TestClave123!');
  assert.notEqual(first,second);assert.notEqual(first,'TestClave123!');assert.ok(verifyPassword('TestClave123!',first));assert.ok(!verifyPassword('OtraClave',first));
});
