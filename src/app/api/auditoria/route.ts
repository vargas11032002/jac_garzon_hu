import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// Solo Presidente y Fiscal pueden ver el historial de auditoría (rol de vigilancia).
// SUPER_ADMIN también puede verlo, filtrando por junta con ?jacId=.
const ROLES_AUDITORIA = ["SUPER_ADMIN", "PRESIDENTE", "FISCAL"];

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const rol = (session.user as any).rol;
  const jacIdSesion = (session.user as any).jacId;

  if (!ROLES_AUDITORIA.includes(rol)) {
    return NextResponse.json({ error: "No tienes permiso para ver el historial de auditoría" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const jacId = rol === "SUPER_ADMIN" ? (searchParams.get("jacId") ?? jacIdSesion) : jacIdSesion;

  if (!jacId) {
    return NextResponse.json({ error: "Debes indicar la junta (jacId)" }, { status: 400 });
  }

  const entidad = searchParams.get("entidad"); // "Transaccion" | "Cuota" | null = todos

  const registros = await prisma.auditLog.findMany({
    where: {
      jacId,
      ...(entidad ? { entidad } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(registros);
}