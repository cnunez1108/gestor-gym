import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

let connection: Database.Database | undefined;
export function db() {
  if (connection) return connection;
  if (Number(process.versions.node.split('.')[0]) < 22) {
    throw new Error('StrongHub requiere Node.js 22 o superior para better-sqlite3 13. Actualiza Node antes de inicializar o ejecutar SQLite.');
  }
  const path = resolve(/* turbopackIgnore: true */ process.env.DATABASE_PATH || 'data/stronghub.sqlite');
  if (path.startsWith(resolve('public') + '/') || path.startsWith(resolve('public') + '\\')) throw new Error('SQLite debe estar fuera de public.');
  mkdirSync(dirname(path), { recursive: true });
  connection = new Database(path);
  connection.pragma('foreign_keys = ON');
  connection.pragma('journal_mode = WAL');
  connection.pragma('busy_timeout = 5000');
  connection.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('admin','receptionist')),
      active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1))
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY, name TEXT NOT NULL, identification TEXT NOT NULL UNIQUE, phone TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, price_cents INTEGER NOT NULL CHECK(price_cents > 0), days INTEGER NOT NULL CHECK(days > 0)
    );
    CREATE TABLE IF NOT EXISTS memberships (
      id INTEGER PRIMARY KEY, member_id INTEGER NOT NULL REFERENCES members(id), plan_id INTEGER NOT NULL REFERENCES plans(id),
      start_date TEXT NOT NULL, end_date TEXT NOT NULL CHECK(end_date > start_date),
      request_key TEXT NOT NULL UNIQUE, created_by INTEGER NOT NULL REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY, membership_id INTEGER NOT NULL UNIQUE REFERENCES memberships(id),
      amount_cents INTEGER NOT NULL CHECK(amount_cents > 0), paid_at TEXT NOT NULL, created_by INTEGER NOT NULL REFERENCES users(id)
    );
    INSERT OR IGNORE INTO plans(id,name,price_cents,days) VALUES (1,'Mensual',3000,30),(2,'Trimestral',8000,90),(3,'Anual',30000,365);
  `);
  return connection;
}
