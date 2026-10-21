// Utilidades compartidas por sembrar.mjs y probar.mjs
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";

export const BASE = process.env.BASE_URL ?? "http://localhost:3100";
export const CLAVE_ADMIN = "Prueba2026*";
export const CLAVE_DUP = { a: "ClaveA-2026*", b: "ClaveB-2026*" };
export const ROLES = ["PRESIDENTE", "TESORERO", "SECRETARIO", "FISCAL"];

// Todos los datos de prueba tienen IDs fijos: sembrar.mjs los restaura cuando se vuelve a ejecutar.
export const ids = (k) => ({
  jac: `tst-jac-${k}`,
  codigo: `TEST-${k.toUpperCase()}`,
  nombre: `Junta de Prueba ${k.toUpperCase()}`,
  afiliado: `tst-afi-${k}`,
  cedula: k === "a" ? "1001" : "2001",
  dup: `tst-dup-${k}`, // misma cédula (9999) en ambas juntas, con clave distinta
  cuota: `tst-cuo-${k}`,
  acta: `tst-act-${k}`,
  proyecto: `tst-pro-${k}`,
  trx: `tst-trx-${k}`,
  comunicado: `tst-com-${k}`,
  evento: `tst-eve-${k}`,
  audit: `tst-aud-${k}`,
  admin: (rol) => ({ id: `tst-adm-${rol.toLowerCase()}-${k}`, email: `${rol.toLowerCase()}.${k}@test.local` }),
});
export const SUPER = { id: "tst-super", email: "super@test.local" };

const lugar = (url) => {
  try { const u = new URL(url); return u.host + u.pathname; } catch { return null; }
};

// Freno de seguridad: se niega a correr contra la misma base que usan .env / .env.local
export function guardia() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Falta DATABASE_URL. Ejecuta con: node --env-file=.env.test <script>");
  if (process.env.CONFIRMO_BD_DE_PRUEBAS !== "si")
    throw new Error('Falta CONFIRMO_BD_DE_PRUEBAS="si" en .env.test (solo ponlo si la URL es de una base de PRUEBAS).');
  const propio = lugar(url);
  for (const f of [".env", ".env.local"]) {
    if (!fs.existsSync(f)) continue;
    const m = fs.readFileSync(f, "utf8").match(/^DATABASE_URL\s*=\s*["']?([^"'\r\n]+)/m);
    if (m && lugar(m[1]) === propio)
      throw new Error(`La DATABASE_URL de .env.test apunta a la MISMA base que ${f}. Usa un proyecto o rama de Neon distinto.`);
  }
}

export function crearPrisma() {
  const cs = process.env.DATABASE_URL;
  const adapter = process.env.ADAPTADOR === "pg" ? new PrismaPg({ connectionString: cs }) : new PrismaNeon({ connectionString: cs });
  return new PrismaClient({ adapter });
}
