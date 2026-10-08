import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
process.env.DATABASE_PATH=resolve('data/e2e.sqlite');
process.env.ADMIN_EMAIL='admin@test.local';
process.env.ADMIN_PASSWORD='AdminTest123!';
process.env.DEMO_RECEPTION_PASSWORD='ReceptionTest123!';
// Reinicia exclusivamente datos de pruebas; nunca la base de uso normal.
async function main(){
  const {db}=await import('../lib/server/database');
  const {initialize}=await import('./init-db');
  db().exec('DELETE FROM payments; DELETE FROM memberships; DELETE FROM members; DELETE FROM sessions; DELETE FROM users;');
  initialize(true);
  const child=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--port','3001'],{stdio:'inherit',env:process.env});
  for(const signal of ['SIGINT','SIGTERM'] as const) process.on(signal,()=>{child.kill(signal);process.exit(0);});
  child.on('exit',code=>process.exit(code??0));
}
main().catch(e=>{console.error(e);process.exit(1);});
