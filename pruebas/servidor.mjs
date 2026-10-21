// Arranca "next dev" leyendo .env.test (next no acepta --env-file en NODE_OPTIONS).
// Uso: node pruebas/servidor.mjs
import fs from "node:fs";
import { spawn } from "node:child_process";

const env = { ...process.env };
for (const linea of fs.readFileSync(".env.test", "utf8").split(/\r?\n/)) {
  const m = linea.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
  if (m && !linea.trim().startsWith("#")) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
if (!env.DATABASE_URL) throw new Error("Falta DATABASE_URL en .env.test");
const puerto = new URL(env.NEXTAUTH_URL ?? "http://localhost:3100").port || "3100";
console.log("Servidor de pruebas en el puerto", puerto, "→ base:", new URL(env.DATABASE_URL).host);
spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "-p", puerto], { env, stdio: "inherit" })
  .on("exit", (c) => process.exit(c ?? 0));
