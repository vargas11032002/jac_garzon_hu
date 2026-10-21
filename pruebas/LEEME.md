# Pruebas de aislamiento entre juntas (multi-tenant)

Batería automática que ataca la API de SistemaJAC como lo haría un usuario de la junta A
contra los datos de la junta B (acceso cruzado, listados, asignación masiva, login con cédula
repetida, rutas sin sesión, rol COMUNERO y límite de intentos de login).

| Archivo | Función |
|---|---|
| `comun.mjs` | Utilidades compartidas, IDs fijos de los datos de prueba y freno de seguridad (`guardia`) |
| `sembrar.mjs` | Crea/restaura datos FICTICIOS: juntas TEST-A y TEST-B con usuarios de cada rol y un registro por entidad |
| `probar.mjs` | Ejecuta las pruebas y genera el informe en `pruebas/resultados/` |
| `resultados/` | Informes de las corridas (`.md` y `.json`) |

## Requisitos
- Una base PostgreSQL **de pruebas** (distinta a la real). El script se niega a correr si `DATABASE_URL` coincide con la de `.env` o `.env.local`.
- Node 20.6 o superior (usa `--env-file`).

## Pasos
```bash
npm install
cp .env.test.example .env.test        # editar con la URL de la base de PRUEBAS
npx prisma migrate deploy             # con DATABASE_URL de la base de pruebas (npx dotenv -e .env.test -- npx prisma migrate deploy)

# Terminal 1: servidor apuntando a la base de pruebas, puerto 3100
node --env-file=.env.test node_modules/next/dist/bin/next dev -p 3100

# Terminal 2:
node --env-file=.env.test pruebas/sembrar.mjs
node --env-file=.env.test pruebas/probar.mjs antes      # o "despues" tras corregir
```

El resultado queda en `pruebas/resultados/resultados-<etiqueta>.md` y `.json`.
Todos los datos de prueba usan IDs fijos (`tst-...`), por lo que `sembrar.mjs` puede ejecutarse varias veces.
