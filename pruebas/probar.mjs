// Batería de pruebas de aislamiento entre juntas (multi-tenant) para SistemaJAC.
// Uso: node --env-file=.env.test pruebas/probar.mjs antes      (o "despues" tras corregir)
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { guardia, crearPrisma, ids, ROLES, SUPER, CLAVE_ADMIN, CLAVE_DUP, BASE } from "./comun.mjs";
import { sembrar } from "./sembrar.mjs";

guardia();
const etiqueta = process.argv[2] ?? "corrida";
const prisma = crearPrisma();
const A = ids("a");
const B = ids("b");
const filas = [];
const hashes = new Set();
const registrar = (grupo, desc, esperado, obtenido, veredicto, nota = "") =>
  filas.push({ grupo, desc, esperado, obtenido, veredicto, nota });

const DENEGADO = [401, 403, 404];
const veredictoDenegado = (s) => (DENEGADO.includes(s) ? "PASA" : s >= 200 && s < 300 ? "FALLA" : "REVISAR");

// ── HTTP y sesiones ──────────────────────────────────────────────
function cookiesDe(res, previas = "") {
  const mapa = new Map(previas.split("; ").filter(Boolean).map((c) => [c.split("=")[0], c]));
  for (const sc of res.headers.getSetCookie?.() ?? []) {
    const par = sc.split(";")[0];
    mapa.set(par.split("=")[0], par);
  }
  return [...mapa.values()].join("; ");
}

async function iniciarSesion(usuario, clave, admin) {
  const r1 = await fetch(`${BASE}/api/auth/csrf`);
  const { csrfToken } = await r1.json();
  let cookie = cookiesDe(r1);
  const r2 = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    redirect: "manual",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: cookie },
    body: new URLSearchParams({ csrfToken, cedula: usuario, password: clave, adminLogin: admin ? "true" : "false", json: "true" }),
  });
  cookie = cookiesDe(r2, cookie);
  const r3 = await fetch(`${BASE}/api/auth/session`, { headers: { Cookie: cookie } });
  const s = await r3.json().catch(() => ({}));
  return { cookie, usuario: s?.user ?? null, status: r2.status };
}

async function llamar(actor, metodo, ruta, cuerpo) {
  const res = await fetch(BASE + ruta, {
    method: metodo,
    redirect: "manual",
    headers: { ...(actor ? { Cookie: actor.cookie } : {}), ...(cuerpo ? { "Content-Type": "application/json" } : {}) },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  const texto = await res.text();
  if (/\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}/.test(texto))
    hashes.add(`${metodo} ${ruta.split("?")[0].replace(/tst-[a-z]+-[ab]/g, ":id")} (${actor?.rol ?? "sin sesión"})`);
  return { status: res.status, texto };
}

// ── 0. Preparación ───────────────────────────────────────────────
await sembrar(prisma);
const actores = {};
for (const rol of ROLES) {
  const s = await iniciarSesion(ids("a").admin(rol).email, CLAVE_ADMIN, true);
  actores[rol] = { ...s, rol };
}
actores.COMUNERO = { ...(await iniciarSesion(A.cedula, CLAVE_ADMIN, false)), rol: "COMUNERO" };
actores.SUPER_ADMIN = { ...(await iniciarSesion(SUPER.email, CLAVE_ADMIN, true)), rol: "SUPER_ADMIN" };

const sinSesion = Object.entries(actores).filter(([, a]) => !a.usuario).map(([r]) => r);
if (sinSesion.length) {
  console.error(`\nNo se pudo iniciar sesión con: ${sinSesion.join(", ")}.`);
  console.error("Revisa que (1) el servidor corra con .env.test, (2) hayas ejecutado sembrar.mjs y (3) BASE_URL sea correcta:", BASE);
  process.exit(2);
}

// ── 1. Controles positivos (si fallan, las demás pruebas no son válidas) ──
let controlesOk = true;
for (const [desc, ruta] of [
  ["Presidente A lee su propio afiliado", `/api/afiliados/${A.afiliado}`],
  ["Presidente A lee su propia acta", `/api/actas/${A.acta}`],
  ["Presidente A lee su propio proyecto", `/api/proyectos/${A.proyecto}`],
]) {
  const r = await llamar(actores.PRESIDENTE, "GET", ruta);
  const ok = r.status === 200;
  if (!ok) controlesOk = false;
  registrar("Control", desc, "200", String(r.status), ok ? "PASA" : "FALLA", ok ? "" : "CONTROL FALLIDO: las demás pruebas no son confiables");
}

// ── 2. Sin sesión ────────────────────────────────────────────────
const rutasSinSesion = [
  ["GET", "/api/afiliados"], ["GET", `/api/afiliados/${B.afiliado}`], ["PATCH", `/api/afiliados/${B.afiliado}`, { nombre: "HACK" }],
  ["DELETE", `/api/afiliados/${B.afiliado}`], ["GET", "/api/actas"], ["GET", "/api/proyectos"], ["GET", "/api/tesoreria"],
  ["GET", "/api/comunicados"], ["GET", "/api/dashboard"], ["GET", "/api/auditoria"], ["GET", "/api/reportes/cuotas"],
  ["GET", "/api/jacs"], ["GET", "/api/admin-users"], ["GET", "/api/portal/me"],
];
for (const [m, ruta, cuerpo] of rutasSinSesion) {
  const r = await llamar(null, m, ruta, cuerpo);
  const v = [401, 403].includes(r.status) ? "PASA" : r.status >= 200 && r.status < 300 ? "FALLA" : "REVISAR";
  registrar("Sin sesión", `${m} ${ruta.replace(/tst-[a-z]+-[ab]/g, ":id")}`, "401/403", String(r.status), v);
}
{
  const r = await llamar(null, "GET", `/api/debug/test-login?email=${SUPER.email}&password=x`);
  const expuesto = r.status === 200;
  registrar("Sin sesión", "GET /api/debug/test-login (endpoint de depuración)", "404/401/403", String(r.status),
    expuesto ? "FALLA" : "PASA", expuesto ? "Expuesto: devuelve la contraseña enviada y parte del hash" : "");
}

// ── 3. Acceso cruzado entre juntas (A intenta tocar datos de B) ──
const objetivos = [
  ["GET", `/api/afiliados/${B.afiliado}`], ["PATCH", `/api/afiliados/${B.afiliado}`, { nombre: "HACK" }],
  ["PATCH", `/api/cuotas/${B.cuota}`, { pagado: true }],
  ["GET", `/api/actas/${B.acta}`], ["PATCH", `/api/actas/${B.acta}`, { contenido: "HACK" }],
  ["GET", `/api/proyectos/${B.proyecto}`], ["PATCH", `/api/proyectos/${B.proyecto}`, { nombre: "HACK" }],
  ["PATCH", `/api/comunicados/${B.comunicado}`, { titulo: "HACK" }],
  ["PATCH", `/api/eventos/${B.evento}`, { titulo: "HACK" }],
  ["DELETE", `/api/afiliados/${B.afiliado}`], ["DELETE", `/api/cuotas/${B.cuota}`], ["DELETE", `/api/actas/${B.acta}`],
  ["DELETE", `/api/proyectos/${B.proyecto}`], ["DELETE", `/api/comunicados/${B.comunicado}`],
  ["DELETE", `/api/eventos/${B.evento}`], ["DELETE", `/api/tesoreria/${B.trx}`],
];
for (const rol of [...ROLES, "COMUNERO"]) {
  for (const [m, ruta, cuerpo] of objetivos) {
    const r = await llamar(actores[rol], m, ruta, cuerpo);
    const v = veredictoDenegado(r.status);
    registrar("Acceso cruzado", `${rol} de A: ${m} ${ruta.replace(/tst-[a-z]+-b/g, ":id de B")}`, "401/403/404", String(r.status), v,
      v === "FALLA" && m !== "GET" ? "Modificó/borró datos de otra junta" : v === "FALLA" ? "Leyó datos de otra junta" : "");
    if (v === "FALLA" && m !== "GET") await sembrar(prisma);
  }
}

// ── 4. Listados sin fuga entre juntas ────────────────────────────
const marcasB = [B.jac, B.afiliado, B.acta, B.proyecto, B.trx, B.comunicado, B.evento, B.audit, B.codigo, B.nombre, "TEST-B-"];
const listados = ["/api/afiliados", `/api/afiliados?jacId=${B.jac}`, "/api/actas", `/api/actas?jacId=${B.jac}`, "/api/proyectos",
  "/api/tesoreria", `/api/tesoreria?jacId=${B.jac}`, "/api/comunicados", "/api/dashboard", `/api/dashboard?jacId=${B.jac}`, `/api/auditoria?jacId=${B.jac}`];
for (const rol of ["PRESIDENTE", "TESORERO"]) {
  for (const ruta of listados) {
    const r = await llamar(actores[rol], "GET", ruta);
    const fuga = r.status === 200 && marcasB.some((mk) => r.texto.includes(mk));
    registrar("Listados", `${rol} de A: GET ${ruta.replace(B.jac, ":jacId de B")}`, "sin datos de B", fuga ? "datos de B presentes" : `HTTP ${r.status}, sin datos de B`, fuga ? "FALLA" : "PASA");
  }
}

// ── 5. Acceso del rol COMUNERO a rutas administrativas ───────────
for (const ruta of ["/api/afiliados", "/api/tesoreria", "/api/auditoria", "/api/admin-users", "/api/jacs"]) {
  const r = await llamar(actores.COMUNERO, "GET", ruta);
  registrar("Rol COMUNERO", `COMUNERO: GET ${ruta}`, "401/403", String(r.status), veredictoDenegado(r.status) === "PASA" ? "PASA" : r.status === 200 ? "FALLA" : "REVISAR",
    r.status === 200 ? "Un comunero puede consultar esta ruta administrativa" : "");
}
for (const ruta of ["/api/actas", "/api/proyectos", "/api/comunicados", "/api/dashboard"]) {
  const r = await llamar(actores.COMUNERO, "GET", ruta);
  registrar("Rol COMUNERO", `COMUNERO: GET ${ruta}`, "(decisión de diseño)", String(r.status), "INFO", "Confirma si un comunero debe ver esto");
}

// ── 6. Asignación masiva (el body pasa directo a Prisma) ─────────
const casosAsignacion = [
  ["afiliado", `/api/afiliados/${A.afiliado}`, () => prisma.afiliado.findUnique({ where: { id: A.afiliado }, select: { jacId: true } })],
  ["acta", `/api/actas/${A.acta}`, () => prisma.acta.findUnique({ where: { id: A.acta }, select: { jacId: true } })],
  ["comunicado", `/api/comunicados/${A.comunicado}`, () => prisma.comunicado.findUnique({ where: { id: A.comunicado }, select: { jacId: true } })],
  ["proyecto", `/api/proyectos/${A.proyecto}`, () => prisma.proyecto.findUnique({ where: { id: A.proyecto }, select: { jacId: true } })],
];
for (const [nombre, ruta, consulta] of casosAsignacion) {
  const r = await llamar(actores.PRESIDENTE, "PATCH", ruta, { jac: { connect: { id: B.jac } } });
  const reg = await consulta();
  const movido = reg?.jacId === B.jac;
  registrar("Asignación masiva", `PRESIDENTE de A: PATCH ${nombre} con {jac:{connect:B}}`, "el registro sigue en A", movido ? "movido a la junta B" : `sigue en A (HTTP ${r.status})`,
    movido ? "FALLA" : "PASA", !movido && r.status >= 500 ? "Rechazado con error no controlado (500)" : "");
  if (movido) await sembrar(prisma);
}

// ── 7. Login del comunero con la misma cédula en dos juntas ──────
for (const k of ["a", "b"]) {
  const s = await iniciarSesion("9999", CLAVE_DUP[k], false);
  const esperado = ids(k).jac;
  const ok = s.usuario?.jacId === esperado;
  registrar("Login", `Cédula repetida: entra con la clave de la junta ${k.toUpperCase()}`, `sesión en ${k.toUpperCase()}`,
    s.usuario ? `sesión en ${s.usuario.jacId === A.jac ? "A" : s.usuario.jacId === B.jac ? "B" : "?"}` : "no inició sesión", ok ? "PASA" : "FALLA",
    ok ? "" : "El login busca solo por cédula (findFirst) y no distingue la junta");
}

// ── 8. Límite de intentos de login ───────────────────────────────
{
  let limitado = false;
  for (let i = 0; i < 15; i++) {
    const r1 = await fetch(`${BASE}/api/auth/csrf`);
    const { csrfToken } = await r1.json();
    const r2 = await fetch(`${BASE}/api/auth/callback/credentials`, {
      method: "POST", redirect: "manual",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: cookiesDe(r1) },
      body: new URLSearchParams({ csrfToken, cedula: SUPER.email, password: `mala-${i}`, adminLogin: "true", json: "true" }),
    });
    if (r2.status === 429) { limitado = true; break; }
  }
  registrar("Login", "15 intentos fallidos seguidos contra un administrador", "bloqueo o 429", limitado ? "429" : "sin límite", limitado ? "PASA" : "FALLA", limitado ? "" : "Permite fuerza bruta");
}

// ── Resultados ───────────────────────────────────────────────────
const cuenta = (v) => filas.filter((f) => f.veredicto === v).length;
const resumen = `PASA: ${cuenta("PASA")} · FALLA: ${cuenta("FALLA")} · REVISAR: ${cuenta("REVISAR")} · INFO: ${cuenta("INFO")} · Total: ${filas.length}`;
const porGrupo = {};
for (const f of filas) { porGrupo[f.grupo] ??= { PASA: 0, FALLA: 0, REVISAR: 0, INFO: 0 }; porGrupo[f.grupo][f.veredicto]++; }

const esc = (s) => String(s).replace(/\|/g, "\\|");
let md = `# Resultados de pruebas de aislamiento (${etiqueta})\n\nFecha: ${new Date().toISOString()}\nServidor: ${BASE}\n\n**${resumen}**\n\n`;
if (!controlesOk) md += "> ⚠️ Algún control positivo falló: los resultados NO son confiables.\n\n";
md += "## Resumen por grupo\n\n| Grupo | Pasa | Falla | Revisar | Info |\n|---|---|---|---|---|\n";
for (const [g, c] of Object.entries(porGrupo)) md += `| ${g} | ${c.PASA} | ${c.FALLA} | ${c.REVISAR} | ${c.INFO} |\n`;
if (hashes.size) md += `\n## Respuestas que contienen hashes de contraseña (bcrypt)\n\n${[...hashes].map((h) => `- ${h}`).join("\n")}\n`;
md += "\n## Detalle\n\n| Grupo | Prueba | Esperado | Obtenido | Veredicto | Nota |\n|---|---|---|---|---|---|\n";
for (const f of filas) md += `| ${esc(f.grupo)} | ${esc(f.desc)} | ${esc(f.esperado)} | ${esc(f.obtenido)} | ${f.veredicto} | ${esc(f.nota)} |\n`;

const dir = fileURLToPath(new URL("./resultados/", import.meta.url));
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(`${dir}resultados-${etiqueta}.md`, md);
fs.writeFileSync(`${dir}resultados-${etiqueta}.json`, JSON.stringify({ etiqueta, fecha: new Date().toISOString(), resumen, porGrupo, hashes: [...hashes], filas }, null, 2));

console.log("\n" + resumen);
console.table(porGrupo);
for (const f of filas.filter((x) => x.veredicto === "FALLA")) console.log(`FALLA · ${f.grupo} · ${f.desc} → ${f.obtenido}${f.nota ? " (" + f.nota + ")" : ""}`);
if (hashes.size) console.log("\nHashes bcrypt en respuestas:\n - " + [...hashes].join("\n - "));
console.log(`\nInforme: pruebas/resultados/resultados-${etiqueta}.md`);
await sembrar(prisma); // deja la base limpia para la siguiente corrida
await prisma.$disconnect();
