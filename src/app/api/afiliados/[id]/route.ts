import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// Quiénes pueden VER el detalle de un afiliado (directiva completa, incluido Secretario
// porque puede "ver todo"; el propio comunero no entra por esta ruta administrativa).
const ROLES_VER = ["SUPER_ADMIN", "PRESIDENTE", "VICEPRESIDENTE", "TESORERO", "FISCAL", "SECRETARIO"];

// Quiénes pueden EDITAR/RETIRAR/ELIMINAR (el Secretario queda fuera:
// su único permiso de escritura es crear comuneros, no editarlos ni retirarlos).
const ROLES_GESTION = ["SUPER_ADMIN", "PRESIDENTE", "VICEPRESIDENTE", "TESORERO", "FISCAL"];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const rol = (session.user as any).rol;
  const jacId = (session.user as any).jacId;

  if (!ROLES_VER.includes(rol)) {
    return NextResponse.json({ error: "No tienes permiso para ver este afiliado" }, { status: 403 });
  }

  const afiliado = await prisma.afiliado.findUnique({
    where: { id },
    include: { cuotas: { orderBy: [{ anio: "desc" }, { mes: "asc" }] } },
  });
  if (!afiliado) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  if (rol !== "SUPER_ADMIN" && afiliado.jacId !== jacId) {
    return NextResponse.json({ error: "No tienes permiso para ver este afiliado" }, { status: 403 });
  }

  const { password: _pw, ...rest } = afiliado;
  return NextResponse.json(rest);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const rol = (session.user as any).rol;
  const jacId = (session.user as any).jacId;

  if (!ROLES_GESTION.includes(rol)) {
    return NextResponse.json({ error: "No tienes permiso para editar afiliados" }, { status: 403 });
  }

  const actual = await prisma.afiliado.findUnique({ where: { id } });
  if (!actual) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (rol !== "SUPER_ADMIN" && actual.jacId !== jacId) {
    return NextResponse.json({ error: "No tienes permiso para editar este afiliado" }, { status: 403 });
  }

  const body = await req.json();
  // cedula, password y codigoJAC nunca se editan desde este endpoint;
  // jacId tampoco, para que no se pueda "mover" un afiliado de junta desde aquí.
  const { cedula: _c, password: _p, codigoJAC: _code, jacId: _jac, activo, motivoRetiro, ...data } = body;

  const updateData: Record<string, unknown> = {
    ...data,
    vigenciaHasta: data.vigenciaHasta ? new Date(data.vigenciaHasta) : null,
  };

  if (activo !== undefined) {
    const nuevoActivo = Boolean(activo);
    updateData.activo = nuevoActivo;

    if (!nuevoActivo && actual.activo) {
      // ── Se está RETIRANDO al comunero ──
      if (!motivoRetiro || !String(motivoRetiro).trim()) {
        return NextResponse.json(
          { error: "Debes indicar el motivo del retiro" },
          { status: 400 }
        );
      }
      updateData.motivoRetiro = String(motivoRetiro).trim();
      updateData.fechaRetiro = new Date();
      // Las cuotas pendientes NO se tocan: siguen contando como deuda del afiliado.
    } else if (nuevoActivo && !actual.activo) {
      // ── Se está REACTIVANDO al comunero ──
      updateData.motivoRetiro = null;
      updateData.fechaRetiro = null;
    }
  }

  const afiliado = await prisma.afiliado.update({
    where: { id },
    data: updateData,
  });

  const { password: __, ...rest } = afiliado;
  return NextResponse.json(rest);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const rol = (session.user as any).rol;
  const jacId = (session.user as any).jacId;

  if (!ROLES_GESTION.includes(rol)) {
    return NextResponse.json({ error: "No tienes permiso para eliminar afiliados" }, { status: 403 });
  }

  const afiliado = await prisma.afiliado.findUnique({ where: { id } });
  if (!afiliado) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (rol !== "SUPER_ADMIN" && afiliado.jacId !== jacId) {
    return NextResponse.json({ error: "No tienes permiso para eliminar este afiliado" }, { status: 403 });
  }

  // Nota: esto borra PERMANENTEMENTE al afiliado y sus cuotas.
  // Para un retiro reversible, usa PATCH con { activo: false, motivoRetiro }.
  await prisma.cuota.deleteMany({ where: { afiliadoId: id } });
  await prisma.afiliado.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}