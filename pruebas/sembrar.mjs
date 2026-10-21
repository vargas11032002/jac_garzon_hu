// Crea (o restaura) los datos FICTICIOS de prueba: 2 juntas (A y B) con usuarios de cada rol y un registro de cada entidad.
// Uso: node --env-file=.env.test pruebas/sembrar.mjs
import bcrypt from "bcryptjs";
import { pathToFileURL } from "node:url";
import { guardia, crearPrisma, ids, ROLES, SUPER, CLAVE_ADMIN, CLAVE_DUP } from "./comun.mjs";

export async function sembrar(prisma) {
  const hAdmin = await bcrypt.hash(CLAVE_ADMIN, 10);
  const anio = new Date().getFullYear();

  const superData = { jacId: null, email: SUPER.email, password: hAdmin, nombre: "Super Admin Prueba", rol: "SUPER_ADMIN", activo: true };
  await prisma.adminUser.upsert({ where: { id: SUPER.id }, create: { id: SUPER.id, ...superData }, update: superData });

  for (const k of ["a", "b"]) {
    const t = ids(k);
    const K = k.toUpperCase();
    await prisma.jAC.upsert({
      where: { id: t.jac },
      create: { id: t.jac, codigo: t.codigo, nombre: t.nombre },
      update: { nombre: t.nombre, activa: true },
    });

    for (const rol of ROLES) {
      const a = t.admin(rol);
      const d = { jacId: t.jac, email: a.email, password: hAdmin, nombre: `${rol} ${K}`, rol, activo: true };
      await prisma.adminUser.upsert({ where: { id: a.id }, create: { id: a.id, ...d }, update: d });
    }

    const afi = { jacId: t.jac, cedula: t.cedula, codigoJAC: `TEST-${K}-001`, nombre: "Comunero", apellido: `Prueba ${K}`, password: hAdmin, activo: true };
    await prisma.afiliado.upsert({ where: { id: t.afiliado }, create: { id: t.afiliado, ...afi }, update: afi });

    const hDup = await bcrypt.hash(CLAVE_DUP[k], 10);
    const dup = { jacId: t.jac, cedula: "9999", codigoJAC: `TEST-${K}-999`, nombre: "Persona", apellido: `Duplicada ${K}`, password: hDup, activo: true };
    await prisma.afiliado.upsert({ where: { id: t.dup }, create: { id: t.dup, ...dup }, update: dup });

    const cuota = { afiliadoId: t.afiliado, mes: 1, anio, valor: 5000, pagado: false };
    await prisma.cuota.upsert({ where: { id: t.cuota }, create: { id: t.cuota, ...cuota }, update: cuota });

    const acta = { jacId: t.jac, numero: 1, fecha: new Date(), tipo: "ORDINARIA", lugar: "Salón comunal", asistentes: 10, orden: "Orden del día de prueba", contenido: `Acta de prueba ${K}`, aprobada: false };
    await prisma.acta.upsert({ where: { id: t.acta }, create: { id: t.acta, ...acta }, update: acta });

    const pro = { jacId: t.jac, nombre: `Proyecto de prueba ${K}`, estado: "PLANEACION" };
    await prisma.proyecto.upsert({ where: { id: t.proyecto }, create: { id: t.proyecto, ...pro }, update: pro });

    const trx = { jacId: t.jac, tipo: "INGRESO", concepto: `Ingreso de prueba ${K}`, valor: 10000 };
    await prisma.transaccion.upsert({ where: { id: t.trx }, create: { id: t.trx, ...trx }, update: trx });

    const com = { jacId: t.jac, titulo: `Comunicado de prueba ${K}`, contenido: "Texto de prueba", tipo: "GENERAL", publicado: true };
    await prisma.comunicado.upsert({ where: { id: t.comunicado }, create: { id: t.comunicado, ...com }, update: com });

    const eve = { jacId: t.jac, titulo: `Evento de prueba ${K}`, fecha: new Date(), tipo: "REUNION" };
    await prisma.evento.upsert({ where: { id: t.evento }, create: { id: t.evento, ...eve }, update: eve });

    const aud = { jacId: t.jac, actorId: t.admin("PRESIDENTE").id, actorNombre: `PRESIDENTE ${K}`, actorRol: "PRESIDENTE", accion: "EDITAR", entidad: "Cuota", entidadId: t.cuota, descripcion: `Registro de auditoría de prueba ${K}` };
    await prisma.auditLog.upsert({ where: { id: t.audit }, create: { id: t.audit, ...aud }, update: aud });
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  guardia();
  const prisma = crearPrisma();
  await sembrar(prisma);
  await prisma.$disconnect();
  console.log("Datos de prueba listos (juntas TEST-A y TEST-B).");
}
