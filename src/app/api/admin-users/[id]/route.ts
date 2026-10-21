import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Igual que en route.ts: el Secretario no gestiona el equipo directivo.
const ROLES_GESTION_EQUIPO = ["PRESIDENTE", "VICEPRESIDENTE", "TESORERO", "FISCAL"];

async function getPermiso(targetId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "No autenticado", status: 401 as const };

  const rolSesion = (session.user as any).rol;
  const jacIdSesion = (session.user as any).jacId;
  const miId = (session.user as any).id;

  const target = await prisma.adminUser.findUnique({ where: { id: targetId } });
  if (!target) return { error: "Usuario no encontrado", status: 404 as const };

  if (rolSesion === "SUPER_ADMIN") {
    // La alcaldía puede gestionar cualquier admin.
    return { session, target };
  }

  // Equipo directivo (incluido Fiscal): solo puede gestionar gente de SU MISMA junta,
  // nunca al presidente, y nunca a sí mismo (para evitar quedarse sin acceso).
  if (ROLES_GESTION_EQUIPO.includes(rolSesion)) {
    if (target.jacId !== jacIdSesion) {
      return { error: "No autorizado", status: 403 as const };
    }
    if (target.rol === "PRESIDENTE") {
      return { error: "No puedes modificar al presidente de la junta", status: 403 as const };
    }
    if (target.id === miId) {
      return { error: "No puedes modificar tu propia cuenta desde aquí", status: 403 as const };
    }
    return { session, target };
  }

  return { error: "No autorizado", status: 403 as const };
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const permiso = await getPermiso(id);
  if ("error" in permiso) return NextResponse.json({ error: permiso.error }, { status: permiso.status });

  try {
    const body = await req.json();
    const { nombre, email, password, activo } = body;

    const data: any = {};
    if (nombre !== undefined) data.nombre = nombre;
    if (email !== undefined) data.email = email;
    if (activo !== undefined) data.activo = Boolean(activo);
    if (password) data.password = await bcrypt.hash(password, 10);

    const admin = await prisma.adminUser.update({ where: { id }, data });
    const { password: _, ...rest } = admin;
    return NextResponse.json(rest);
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Ya existe un usuario con ese correo" }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Error al actualizar el usuario" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const permiso = await getPermiso(id);
  if ("error" in permiso) return NextResponse.json({ error: permiso.error }, { status: permiso.status });

  try {
    await prisma.adminUser.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al eliminar el usuario" }, { status: 500 });
  }
}