# StrongHub Gym

Proyecto académico individual de **Juan Carlos Núñez**, para Ingeniería de Software II. Next.js, React, TypeScript, Route Handlers y SQLite; diseño oscuro y rojo conservado.

## Requisitos y estado del entorno

Node.js **22 o superior** y pnpm 11.23.0. El controlador instalado `better-sqlite3` 13.0.3 requiere Node 22+. La máquina revisada tiene Node 20.20.2: las pruebas SQLite no pudieron ejecutarse correctamente. La solicitud para instalar un controlador compatible con Node 20 fue rechazada; no se afirma compatibilidad con ese Node. Referencia: [versiones oficiales del controlador](https://github.com/WiseLibs/better-sqlite3/releases).

## Instalación local

Desde la raíz del repositorio, en PowerShell:

```powershell
cd my-app
node --version
pnpm.cmd install --frozen-lockfile
Copy-Item .env.example .env.local
```

Editar `.env.local` antes de inicializar:

| Variable | Uso |
|---|---|
| DATABASE_PATH | SQLite fuera de public; predeterminado: data/stronghub.sqlite. |
| ADMIN_NAME | Nombre del administrador inicial. |
| ADMIN_EMAIL | Correo del administrador inicial. |
| ADMIN_PASSWORD | Contraseña de al menos ocho caracteres. |
| DEMO_RECEPTION_PASSWORD | Contraseña de recepcionista ficticia, necesaria para db:demo. |

```powershell
pnpm.cmd db:init
# Opcional: agrega datos ficticios sin borrar registros existentes.
pnpm.cmd db:demo
pnpm.cmd dev
```

Abrir http://localhost:3000/login. Ingresar con las credenciales configuradas. La recepcionista de demostración usa `recepcion@stronghub.com` y `DEMO_RECEPTION_PASSWORD`. La inicialización es repetible y no cambia contraseñas de usuarios existentes. La base y `.env.local` se excluyen del repositorio. No cambiar DATABASE_PATH entre reinicios.

En otras shells usar `pnpm` en lugar de `pnpm.cmd`. El sufijo `.cmd` evita la restricción de scripts de PowerShell. Si pnpm informa `ERR_PNPM_UNEXPECTED_STORE`, utilizar para install el almacén indicado en el error. En la máquina original:

```powershell
pnpm.cmd --store-dir E:\.pnpm-store install --frozen-lockfile
```

Ese almacén no es un requisito para una instalación nueva. `pnpm-workspace.yaml` autoriza los scripts de SQLite y esbuild; Cypress se instala explícitamente para pruebas.

Para compilación y ejecución de producción local:

```powershell
pnpm.cmd build
pnpm.cmd start
```

## Funcionamiento

- Administrador: gestionar usuarios, miembros, membresías y pagos. Puede desactivar cuentas, pero no su propia cuenta ni quitarse su rol administrador.
- Recepcionista: gestionar miembros, membresías y pagos, consultar planes y dashboard. Servidor y API bloquean administración de usuarios y roles.
- Contraseñas con scrypt y salt aleatorio. Sesiones en SQLite con hash SHA-256 del token; cookie HttpOnly/SameSite. Duración: ocho horas o siete días con Recordarme. Editar/desactivar usuario revoca sus sesiones.
- Miembros con nombre, identificación única y teléfono; registro y edición. En Membresías se selecciona un miembro existente o se registra uno nuevo. Una identificación existente con otros datos se rechaza.
- Planes: Mensual US$30 / 30 días, Trimestral US$80 / 90 días, Anual US$300 / 365 días; solo lectura.
- Crear membresía con pago inmediato o pendiente. Miembro, membresía y pago integrado se guardan en transacción.
- Pagos: un pago completo por membresía, monto validado contra el precio consultado en servidor, centavos enteros, fecha y operador. UNIQUE evita duplicados incluso ante concurrencia.
- Estado: pendiente si falta pago o inicio futuro; activa cuando pagada e `inicio <= hoy < vencimiento`; vencida cuando `hoy >= vencimiento`. Se calcula al consultar, sin tareas programadas.
- Fechas de negocio YYYY-MM-DD con día actual de America/La_Paz. Suma de días UTC. Vencimiento es el primer día sin cobertura. Pagos guardan instantes UTC y se muestran en La Paz.
- Dashboard con cantidades e ingresos totales desde SQLite, sin cifras simuladas.

Se conservan los seis IDs de Cypress y los mensajes de fecha pasada y registro correcto.

## Organización

| Archivos | Responsabilidad |
|---|---|
| app/*/page.tsx, app/components | Presentación y páginas protegidas en servidor. |
| app/api/[...path]/route.ts | HTTP, sesión, permisos y errores. |
| lib/api.ts | Cliente de API. |
| lib/server/services.ts | Validación, transacciones y estados. |
| lib/server/repositories.ts | SQL parametrizado. |
| lib/server/database.ts | SQLite y esquema con claves/restricciones. |
| lib/server/security.ts, passwords.ts | Sesiones, autorización y contraseñas. |
| lib/dates.ts | Fechas compartidas. |
| scripts/init-db.ts, test-server.ts | Inicialización y base de pruebas separada. |

| Endpoint | Métodos | Acceso |
|---|---|---|
| /api/auth/login | POST | Público |
| /api/auth/me, /api/auth/logout | GET, POST respectivamente | Sesión |
| /api/users, /api/users/:id | GET/POST, PATCH | Administrador |
| /api/members, /api/members/:id | GET/POST, PATCH | Ambos |
| /api/plans, /api/dashboard | GET | Ambos |
| /api/memberships, /api/payments | GET/POST | Ambos |

Crear membresía: `{memberId,planId,startDate,requestKey,amountCents?}` o `{member:{name,identification,phone},planId,startDate,requestKey,amountCents?}`. Omitir amountCents crea pendiente de pago. Conservar requestKey al reintentar la misma operación; la UI lo conserva tras errores y bloquea envíos mientras guarda.

Pago: `{membershipId,amountCents}`. Usuario: `{name,email,password,role}`; editar agrega active booleano y permite omitir password. Miembro: `{name,identification,phone}`. Errores: 400 validación, 401 sesión, 403 permiso, 404 no encontrado, 409 duplicado. No existe un endpoint HTTP para reiniciar datos.

## Pruebas

```powershell
pnpm.cmd lint
pnpm.cmd exec tsc --noEmit
pnpm.cmd test:dates
pnpm.cmd test:server
pnpm.cmd build
```

Cypress requiere dos terminales:

```powershell
# Terminal 1: reinicia exclusivamente data/e2e.sqlite y sirve en 3001.
pnpm.cmd dev:test
```

```powershell
# Terminal 2:
pnpm.cmd cypress:install
pnpm.cmd test:e2e
```

No ejecutar dev y dev:test simultáneamente: comparten directorio de construcción Next.js. Las pruebas de servicios usan `data/unit-tests.sqlite`, Cypress `data/e2e.sqlite`; nunca la base normal. El servidor test prepara credenciales reproducibles: `admin@test.local / AdminTest123!`, `recepcion@stronghub.com / ReceptionTest123!`. Son exclusivas de pruebas. Reiniciar dev:test reinicia los datos E2E. Cypress usa fechas dinámicas y no agrega Cucumber.

Comprobación manual de persistencia: registrar miembro/membresía/pago, detener el servidor y volver a iniciarlo con la misma base, sin reiniciar datos de pruebas. Consultar los registros. Las pruebas automatizadas cubren recarga y otra conexión SQLite.

Véase [diagramas, trazabilidad y guía de demostración](docs/academico.md) y [resultados reales](docs/resultados.md).

## Pendientes y límites

Falta validar SQLite y Cypress en un equipo con Node compatible. Juan Carlos debe completar personalmente evidencias, autoevaluación y video. No se afirma aceptación docente.

Alcance local académico: sin banco, cuotas, entrenamientos, reportes avanzados, Docker ni despliegue. Esquema inicial con CREATE TABLE IF NOT EXISTS, tarifas fijas y separación lógica sencilla. Pago tardío no extiende el período original; renovar crea otra membresía. Se permite más de una membresía por miembro.
