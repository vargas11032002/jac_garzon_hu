import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

const ROLES_DIRECTIVA = ["PRESIDENTE", "VICEPRESIDENTE", "TESORERO", "FISCAL"];

async function verificarAcceso(id: string, requiereDirectiva = false) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "No autenticado", status: 401 as const };

  const rol = (session.user as any).rol;
  const jacId = (session.user as any).jacId;

  if (requiereDirectiva && !ROLES_DIRECTIVA.includes(rol)) {
    return { error: "No autorizado", status: 403 as const };
  }

  const acta = await prisma.acta.findUnique({ where: { id } });
  if (!acta) return { error: "No encontrada", status: 404 as const };
  if (acta.jacId !== jacId) return { error: "No autorizado", status: 403 as const };

  return { acta };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const acceso = await verificarAcceso(id);
  if ("error" in acceso) return NextResponse.json({ error: acceso.error }, { status: acceso.status });
  return NextResponse.json(acceso.acta);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const acceso = await verificarAcceso(id, true);
  if ("error" in acceso) return NextResponse.json({ error: acceso.error }, { status: acceso.status });

  const body = await req.json();
  const { jacId: _ignorado, ...dataSegura } = body;

  const acta = await prisma.acta.update({
    where: { id },
    data: {
      ...dataSegura,
      fecha: body.fecha ? new Date(body.fecha) : undefined,
      asistentes: body.asistentes ? Number(body.asistentes) : undefined,
    },
  });
  return NextResponse.json(acta);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const acceso = await verificarAcceso(id, true);
  if ("error" in acceso) return NextResponse.json({ error: acceso.error }, { status: acceso.status });

  await prisma.acta.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}