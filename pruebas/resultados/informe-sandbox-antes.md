# Resultados de pruebas de aislamiento (antes)

Fecha: 2026-09-23T21:28:52.996Z
Servidor: http://localhost:3100

**PASA: 124 · FALLA: 8 · REVISAR: 0 · INFO: 4 · Total: 136**

## Resumen por grupo

| Grupo | Pasa | Falla | Revisar | Info |
|---|---|---|---|---|
| Control | 3 | 0 | 0 | 0 |
| Sin sesión | 14 | 1 | 0 | 0 |
| Acceso cruzado | 80 | 0 | 0 | 0 |
| Listados | 22 | 0 | 0 | 0 |
| Rol COMUNERO | 3 | 2 | 0 | 4 |
| Asignación masiva | 1 | 3 | 0 | 0 |
| Login | 1 | 2 | 0 | 0 |

## Respuestas que contienen hashes de contraseña (bcrypt)

- GET /api/afiliados (PRESIDENTE)
- GET /api/afiliados (TESORERO)
- GET /api/afiliados (COMUNERO)

## Detalle

| Grupo | Prueba | Esperado | Obtenido | Veredicto | Nota |
|---|---|---|---|---|---|
| Control | Presidente A lee su propio afiliado | 200 | 200 | PASA |  |
| Control | Presidente A lee su propia acta | 200 | 200 | PASA |  |
| Control | Presidente A lee su propio proyecto | 200 | 200 | PASA |  |
| Sin sesión | GET /api/afiliados | 401/403 | 401 | PASA |  |
| Sin sesión | GET /api/afiliados/:id | 401/403 | 401 | PASA |  |
| Sin sesión | PATCH /api/afiliados/:id | 401/403 | 401 | PASA |  |
| Sin sesión | DELETE /api/afiliados/:id | 401/403 | 401 | PASA |  |
| Sin sesión | GET /api/actas | 401/403 | 401 | PASA |  |
| Sin sesión | GET /api/proyectos | 401/403 | 401 | PASA |  |
| Sin sesión | GET /api/tesoreria | 401/403 | 401 | PASA |  |
| Sin sesión | GET /api/comunicados | 401/403 | 401 | PASA |  |
| Sin sesión | GET /api/dashboard | 401/403 | 401 | PASA |  |
| Sin sesión | GET /api/auditoria | 401/403 | 401 | PASA |  |
| Sin sesión | GET /api/reportes/cuotas | 401/403 | 401 | PASA |  |
| Sin sesión | GET /api/jacs | 401/403 | 403 | PASA |  |
| Sin sesión | GET /api/admin-users | 401/403 | 401 | PASA |  |
| Sin sesión | GET /api/portal/me | 401/403 | 401 | PASA |  |
| Sin sesión | GET /api/debug/test-login (endpoint de depuración) | 404/401/403 | 200 | FALLA | Expuesto: devuelve la contraseña enviada y parte del hash |
| Acceso cruzado | PRESIDENTE de A: GET /api/afiliados/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | PRESIDENTE de A: PATCH /api/afiliados/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | PRESIDENTE de A: PATCH /api/cuotas/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | PRESIDENTE de A: GET /api/actas/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | PRESIDENTE de A: PATCH /api/actas/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | PRESIDENTE de A: GET /api/proyectos/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | PRESIDENTE de A: PATCH /api/proyectos/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | PRESIDENTE de A: PATCH /api/comunicados/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | PRESIDENTE de A: PATCH /api/eventos/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | PRESIDENTE de A: DELETE /api/afiliados/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | PRESIDENTE de A: DELETE /api/cuotas/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | PRESIDENTE de A: DELETE /api/actas/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | PRESIDENTE de A: DELETE /api/proyectos/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | PRESIDENTE de A: DELETE /api/comunicados/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | PRESIDENTE de A: DELETE /api/eventos/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | PRESIDENTE de A: DELETE /api/tesoreria/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | TESORERO de A: GET /api/afiliados/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | TESORERO de A: PATCH /api/afiliados/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | TESORERO de A: PATCH /api/cuotas/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | TESORERO de A: GET /api/actas/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | TESORERO de A: PATCH /api/actas/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | TESORERO de A: GET /api/proyectos/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | TESORERO de A: PATCH /api/proyectos/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | TESORERO de A: PATCH /api/comunicados/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | TESORERO de A: PATCH /api/eventos/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | TESORERO de A: DELETE /api/afiliados/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | TESORERO de A: DELETE /api/cuotas/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | TESORERO de A: DELETE /api/actas/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | TESORERO de A: DELETE /api/proyectos/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | TESORERO de A: DELETE /api/comunicados/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | TESORERO de A: DELETE /api/eventos/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | TESORERO de A: DELETE /api/tesoreria/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | SECRETARIO de A: GET /api/afiliados/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | SECRETARIO de A: PATCH /api/afiliados/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | SECRETARIO de A: PATCH /api/cuotas/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | SECRETARIO de A: GET /api/actas/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | SECRETARIO de A: PATCH /api/actas/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | SECRETARIO de A: GET /api/proyectos/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | SECRETARIO de A: PATCH /api/proyectos/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | SECRETARIO de A: PATCH /api/comunicados/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | SECRETARIO de A: PATCH /api/eventos/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | SECRETARIO de A: DELETE /api/afiliados/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | SECRETARIO de A: DELETE /api/cuotas/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | SECRETARIO de A: DELETE /api/actas/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | SECRETARIO de A: DELETE /api/proyectos/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | SECRETARIO de A: DELETE /api/comunicados/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | SECRETARIO de A: DELETE /api/eventos/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | SECRETARIO de A: DELETE /api/tesoreria/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | FISCAL de A: GET /api/afiliados/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | FISCAL de A: PATCH /api/afiliados/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | FISCAL de A: PATCH /api/cuotas/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | FISCAL de A: GET /api/actas/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | FISCAL de A: PATCH /api/actas/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | FISCAL de A: GET /api/proyectos/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | FISCAL de A: PATCH /api/proyectos/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | FISCAL de A: PATCH /api/comunicados/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | FISCAL de A: PATCH /api/eventos/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | FISCAL de A: DELETE /api/afiliados/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | FISCAL de A: DELETE /api/cuotas/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | FISCAL de A: DELETE /api/actas/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | FISCAL de A: DELETE /api/proyectos/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | FISCAL de A: DELETE /api/comunicados/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | FISCAL de A: DELETE /api/eventos/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | FISCAL de A: DELETE /api/tesoreria/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | COMUNERO de A: GET /api/afiliados/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | COMUNERO de A: PATCH /api/afiliados/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | COMUNERO de A: PATCH /api/cuotas/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | COMUNERO de A: GET /api/actas/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | COMUNERO de A: PATCH /api/actas/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | COMUNERO de A: GET /api/proyectos/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | COMUNERO de A: PATCH /api/proyectos/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | COMUNERO de A: PATCH /api/comunicados/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | COMUNERO de A: PATCH /api/eventos/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | COMUNERO de A: DELETE /api/afiliados/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | COMUNERO de A: DELETE /api/cuotas/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | COMUNERO de A: DELETE /api/actas/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | COMUNERO de A: DELETE /api/proyectos/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | COMUNERO de A: DELETE /api/comunicados/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | COMUNERO de A: DELETE /api/eventos/:id de B | 401/403/404 | 403 | PASA |  |
| Acceso cruzado | COMUNERO de A: DELETE /api/tesoreria/:id de B | 401/403/404 | 403 | PASA |  |
| Listados | PRESIDENTE de A: GET /api/afiliados | sin datos de B | HTTP 200, sin datos de B | PASA |  |
| Listados | PRESIDENTE de A: GET /api/afiliados?jacId=:jacId de B | sin datos de B | HTTP 200, sin datos de B | PASA |  |
| Listados | PRESIDENTE de A: GET /api/actas | sin datos de B | HTTP 200, sin datos de B | PASA |  |
| Listados | PRESIDENTE de A: GET /api/actas?jacId=:jacId de B | sin datos de B | HTTP 200, sin datos de B | PASA |  |
| Listados | PRESIDENTE de A: GET /api/proyectos | sin datos de B | HTTP 200, sin datos de B | PASA |  |
| Listados | PRESIDENTE de A: GET /api/tesoreria | sin datos de B | HTTP 200, sin datos de B | PASA |  |
| Listados | PRESIDENTE de A: GET /api/tesoreria?jacId=:jacId de B | sin datos de B | HTTP 200, sin datos de B | PASA |  |
| Listados | PRESIDENTE de A: GET /api/comunicados | sin datos de B | HTTP 200, sin datos de B | PASA |  |
| Listados | PRESIDENTE de A: GET /api/dashboard | sin datos de B | HTTP 200, sin datos de B | PASA |  |
| Listados | PRESIDENTE de A: GET /api/dashboard?jacId=:jacId de B | sin datos de B | HTTP 200, sin datos de B | PASA |  |
| Listados | PRESIDENTE de A: GET /api/auditoria?jacId=:jacId de B | sin datos de B | HTTP 200, sin datos de B | PASA |  |
| Listados | TESORERO de A: GET /api/afiliados | sin datos de B | HTTP 200, sin datos de B | PASA |  |
| Listados | TESORERO de A: GET /api/afiliados?jacId=:jacId de B | sin datos de B | HTTP 200, sin datos de B | PASA |  |
| Listados | TESORERO de A: GET /api/actas | sin datos de B | HTTP 200, sin datos de B | PASA |  |
| Listados | TESORERO de A: GET /api/actas?jacId=:jacId de B | sin datos de B | HTTP 200, sin datos de B | PASA |  |
| Listados | TESORERO de A: GET /api/proyectos | sin datos de B | HTTP 200, sin datos de B | PASA |  |
| Listados | TESORERO de A: GET /api/tesoreria | sin datos de B | HTTP 200, sin datos de B | PASA |  |
| Listados | TESORERO de A: GET /api/tesoreria?jacId=:jacId de B | sin datos de B | HTTP 200, sin datos de B | PASA |  |
| Listados | TESORERO de A: GET /api/comunicados | sin datos de B | HTTP 200, sin datos de B | PASA |  |
| Listados | TESORERO de A: GET /api/dashboard | sin datos de B | HTTP 200, sin datos de B | PASA |  |
| Listados | TESORERO de A: GET /api/dashboard?jacId=:jacId de B | sin datos de B | HTTP 200, sin datos de B | PASA |  |
| Listados | TESORERO de A: GET /api/auditoria?jacId=:jacId de B | sin datos de B | HTTP 403, sin datos de B | PASA |  |
| Rol COMUNERO | COMUNERO: GET /api/afiliados | 401/403 | 200 | FALLA | Un comunero puede consultar esta ruta administrativa |
| Rol COMUNERO | COMUNERO: GET /api/tesoreria | 401/403 | 403 | PASA |  |
| Rol COMUNERO | COMUNERO: GET /api/auditoria | 401/403 | 403 | PASA |  |
| Rol COMUNERO | COMUNERO: GET /api/admin-users | 401/403 | 200 | FALLA | Un comunero puede consultar esta ruta administrativa |
| Rol COMUNERO | COMUNERO: GET /api/jacs | 401/403 | 403 | PASA |  |
| Rol COMUNERO | COMUNERO: GET /api/actas | (decisión de diseño) | 200 | INFO | Confirma si un comunero debe ver esto |
| Rol COMUNERO | COMUNERO: GET /api/proyectos | (decisión de diseño) | 200 | INFO | Confirma si un comunero debe ver esto |
| Rol COMUNERO | COMUNERO: GET /api/comunicados | (decisión de diseño) | 200 | INFO | Confirma si un comunero debe ver esto |
| Rol COMUNERO | COMUNERO: GET /api/dashboard | (decisión de diseño) | 200 | INFO | Confirma si un comunero debe ver esto |
| Asignación masiva | PRESIDENTE de A: PATCH afiliado con {jac:{connect:B}} | el registro sigue en A | movido a la junta B | FALLA |  |
| Asignación masiva | PRESIDENTE de A: PATCH acta con {jac:{connect:B}} | el registro sigue en A | movido a la junta B | FALLA |  |
| Asignación masiva | PRESIDENTE de A: PATCH comunicado con {jac:{connect:B}} | el registro sigue en A | movido a la junta B | FALLA |  |
| Asignación masiva | PRESIDENTE de A: PATCH proyecto con {jac:{connect:B}} | el registro sigue en A | sigue en A (HTTP 200) | PASA |  |
| Login | Cédula repetida: entra con la clave de la junta A | sesión en A | sesión en A | PASA |  |
| Login | Cédula repetida: entra con la clave de la junta B | sesión en B | no inició sesión | FALLA | El login busca solo por cédula (findFirst) y no distingue la junta |
| Login | 15 intentos fallidos seguidos contra un administrador | bloqueo o 429 | sin límite | FALLA | Permite fuerza bruta |
