import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Roles que pueden GESTIONAR el equipo directivo (crear/editar/eliminar miembros).
// El Secretario queda fuera a propósito: solo puede ver y crear comuneros,
// no administrar el equipo directivo.
const ROLES_GESTION_EQUIPO = ["PRESIDENTE", "VICEPRESIDENTE", "TESORERO", "FISCAL"];

// Roles que el equipo directivo (no SUPER_ADMIN) puede asignar al crear un nuevo miembro.
// Nunca se puede crear otro PRESIDENTE desde aquí; eso solo lo hace la alcaldía.
const ROLES_CREABLES_POR_JUNTA = ["VICEPRESIDENTE", "TESORERO", "SECRETARIO", "FISCAL"];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const rolSesion = (session.user as any).rol;
    const jacIdSesion = (session.user as any).jacId;

    if (rolSesion === "SUPER_ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    if (!jacIdSesion) {
      return NextResponse.json({ error: "Tu usuario no tiene una junta asignada" }, { status: 400 });
    }

    const equipo = await prisma.adminUser.findMany({
      where: { jacId: jacIdSesion },
      orderBy: { createdAt: "asc" },
      select: {
        id: true, email: true, nombre: true, rol: true, activo: true, createdAt: true,
      },
    });

    return NextResponse.json(equipo);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener el equipo directivo" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const rolSesion = (session.user as any).rol;
    const jacIdSesion = (session.user as any).jacId;

    const body = await req.json();
    const { email, password, nombre } = body;
    let { rol, jacId } = body;

    if (!email || !password || !nombre) {
      return NextResponse.json(
        { error: "Email, contraseña y nombre son requeridos" },
        { status: 400 }
      );
    }

    // ── Reglas de quién puede crear a quién ──
    if (rolSesion === "SUPER_ADMIN") {
      // La alcaldía SOLO puede crear presidentes, y debe indicar a qué junta.
      rol = "PRESIDENTE";
      if (!jacId) {
        return NextResponse.json({ error: "Debes indicar la junta (jacId)" }, { status: 400 });
      }
    } else if (ROLES_GESTION_EQUIPO.includes(rolSesion)) {
      // El equipo directivo de una junta puede crear Vicepresidente, Tesorero,
      // Secretario o Fiscal, siempre dentro de SU PROPIA junta
      // (se ignora cualquier jacId enviado desde el cliente).
      if (!rol || !ROLES_CREABLES_POR_JUNTA.includes(rol)) {
        return NextResponse.json(
          { error: "Solo puedes crear Vicepresidente, Tesorero, Secretario o Fiscal" },
          { status: 400 }
        );
      }
      jacId = jacIdSesion;
      if (!jacId) {
        return NextResponse.json({ error: "Tu usuario no tiene una junta asignada" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const jac = await prisma.jAC.findUnique({ where: { id: jacId } });
    if (!jac) {
      return NextResponse.json({ error: "La junta indicada no existe" }, { status: 400 });
    }

    // No permitir dos personas con el mismo cargo directivo en la misma junta
    const cargoOcupado = await prisma.adminUser.findFirst({ where: { jacId, rol } });
    if (cargoOcupado) {
      return NextResponse.json(
        { error: `Esta junta ya tiene un ${rol.toLowerCase()} asignado` },
        { status: 400 }
      );
    }

    const existeEmail = await prisma.adminUser.findUnique({ where: { email } });
    if (existeEmail) {
      return NextResponse.json({ error: "Ya existe un usuario con ese correo" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.adminUser.create({
      data: { email, password: hashedPassword, nombre, rol, jacId },
    });

    const { password: _, ...rest } = admin;
    return NextResponse.json(rest, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al crear el usuario administrador" }, { status: 500 });
  }
}