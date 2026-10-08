# Resultados observados

Fecha de trabajo: **7 de octubre de 2026**, zona America/La_Paz. Equipo Windows/PowerShell; Node 20.20.2 y pnpm 11.23.0. Este registro no afirma aprobación docente ni sustituye la evidencia personal del autor.

| Comprobación | Resultado real |
|---|---|
| TypeScript (`node node_modules/typescript/bin/tsc --noEmit`) | Pasó, sin errores. |
| ESLint (`node node_modules/eslint/bin/eslint.js`) | Pasó, sin errores ni advertencias tras corregir los hallazgos. |
| `git diff --check` | Pasó; Git avisa conversión LF/CRLF en Windows. |
| Fechas, calendario, duración, estados y contraseñas | **4 pruebas pasaron, 0 fallaron**. Ejecución en proceso, sin subprocesos bloqueados por sandbox. |
| Servicios SQLite | **1 suite falló antes de ejecutar sus casos internos**. better-sqlite3 13 requiere Node 22+, pero el equipo usa Node 20. La primera ejecución terminó con código nativo 3221225477; tras agregar comprobación de versión, informa el requisito sin fallo nativo. No se atribuyen éxitos a sus casos internos. |
| Compilación Next.js | Una compilación intermedia completa pasó fuera del sandbox, incluidas comprobaciones TypeScript y generación de rutas. Emitió aviso de trazado por ruta SQLite dinámica; se añadió turbopackIgnore. No se ejecutó una compilación completa posterior a todos los ajustes finales porque la solicitud de ejecución fuera del sandbox fue rechazada. TypeScript y lint sí se comprobaron después de los ajustes. |
| Cypress | **No ejecutado**: falta un runtime compatible para servir los flujos SQLite. Se implementaron ocho casos. |
| Inicialización/demo y persistencia funcional | No validadas con SQLite en este equipo. Pendiente ejecución con Node 22+. |

El sandbox produjo `spawn EPERM` al ejecutar tsx/test runner y compilación. Se obtuvo una ejecución fuera del sandbox para la compilación intermedia y la suite SQLite. La solicitud para instalar un controlador compatible con Node 20 y la solicitud posterior de compilación/pruebas fuera del sandbox fueron rechazadas; no se insistió con esas acciones.

Para verificar las pruebas puras dentro del sandbox se utilizó TypeScript para transformar los módulos en memoria y el runner de Node en el mismo proceso, sin esbuild ni procesos secundarios:

```powershell
node -e "const ts=require('typescript'),fs=require('fs');require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,file);require('./tests/dates.test.ts');"
```

La misma ejecución con `tests/services.test.ts` confirmó el mensaje explícito de versión requerida. En un entorno normal con Node compatible usar los comandos pnpm del README.

En la instalación preexistente, pnpm también detectó un almacén diferente y en algunas ejecuciones intentó reinstalar dependencias sin TTY. Las verificaciones de TypeScript/ESLint se ejecutaron con sus binarios Node locales, sin reinstalar ni borrar node_modules. Para una instalación reproducible usar `pnpm install --frozen-lockfile` con Node compatible, aplicando la indicación del almacén del README si corresponde.

## Pendientes personales

1. Ejecutar `db:init`, `db:demo`, pruebas de servicios y Cypress con Node 22+.
2. Repetir la compilación final completa.
3. Verificar persistencia después de detener y reiniciar la aplicación con la misma base.
4. Completar evidencia propia, resultados por caso y autoevaluación en `academico.md`.
5. Grabar el video de hasta cinco minutos. No se generaron capturas, video ni aceptación externa.
