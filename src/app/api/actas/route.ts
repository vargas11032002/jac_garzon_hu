import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

const ROLES_DIRECTIVA = ["PRESIDENTE", "VICEPRESIDENTE", "TESORERO", "FISCAL"];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const jacId = (session.user as any).jacId;
  if (!jacId) return NextResponse.json({ error: "Tu usuario no tiene una junta asignada" }, { status: 400 });

  const actas = await prisma.acta.findMany({
    where: { jacId },
    orderBy: { fecha: "desc" },
  });
  return NextResponse.json(actas);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const rol = (session.user as any).rol;
  const jacId = (session.user as any).jacId;

  if (!ROLES_DIRECTIVA.includes(rol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  if (!jacId) return NextResponse.json({ error: "Tu usuario no tiene una junta asignada" }, { status: 400 });

  const body = await req.json();
  const { numero, fecha, tipo, lugar, asistentes, orden, contenido } = body;
  if (!fecha || !tipo || !lugar) {
    return NextResponse.json({ error: "Fecha, tipo y lugar son requeridos" }, { status: 400 });
  }

  const ultimo = await prisma.acta.findFirst({
    where: { jacId },
    orderBy: { numero: "desc" },
  });

  const acta = await prisma.acta.create({
    data: {
      jacId,
      numero: numero ?? (ultimo ? ultimo.numero + 1 : 1),
      fecha: new Date(fecha),
      tipo,
      lugar,
      asistentes: Number(asistentes) || 0,
      orden: orden ?? "[]",
      contenido: contenido ?? "",
      aprobada: false,
    },
  });
  return NextResponse.json(acta, { status: 201 });
}