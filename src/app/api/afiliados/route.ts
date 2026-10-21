import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Quiénes pueden CREAR comuneros: directiva completa + Secretario/a
// (el Secretario tiene esta única acción de escritura en el sistema).
const ROLES_CREAR_AFILIADOS = ["SUPER_ADMIN", "PRESIDENTE", "VICEPRESIDENTE", "TESORERO", "FISCAL", "SECRETARIO"];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const rol = (session.user as any).rol;
    const jacId = (session.user as any).jacId;

    // El SUPER_ADMIN (alcaldía) ve todas las juntas.
    // El resto de roles administrativos (incluido Secretario) solo ven la suya.
    const where = rol === "SUPER_ADMIN" ? {} : { jacId };

    const afiliados = await prisma.afiliado.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        cuotas: {
          where: { anio: new Date().getFullYear() },
        },
      },
    });
    return NextResponse.json(afiliados);
  } catch (e) {
    return NextResponse.json({ error: "Error al obtener afiliados" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const rol = (session.user as any).rol;
    const jacId = (session.user as any).jacId;

    if (!ROLES_CREAR_AFILIADOS.includes(rol)) {
      return NextResponse.json({ error: "No tienes permiso para crear afiliados" }, { status: 403 });
    }

    if (!jacId) {
      return NextResponse.json(
        { error: "Tu usuario no tiene una junta (JAC) asignada" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      cedula, nombre, apellido, telefono, email,
      direccion, barrio, cargo, vigenciaHasta,
    } = body;

    // Validaciones básicas
    if (!cedula || !nombre || !apellido) {
      return NextResponse.json({ error: "Cédula, nombre y apellido son requeridos" }, { status: 400 });
    }

    // Verificar cédula duplicada EN TODO EL SISTEMA
    // (un comunero pertenece únicamente a una junta; la misma cédula
    // no puede registrarse en dos juntas distintas)
    const existe = await prisma.afiliado.findFirst({
      where: { cedula },
      include: { jac: { select: { nombre: true } } },
    });
    if (existe) {
      return NextResponse.json(
        {
          error: existe.jacId === jacId
            ? "Ya existe un afiliado con esa cédula en esta junta"
            : `Esta cédula ya está registrada en la junta "${existe.jac.nombre}"`,
        },
        { status: 400 }
      );
    }

    // Generar código de afiliado usando el código REAL de la junta como prefijo
    const jac = await prisma.jAC.findUnique({ where: { id: jacId } });
    const count = await prisma.afiliado.count({ where: { jacId } });
    const codigoJAC = `${jac?.codigo ?? "JAC"}-${String(count + 1).padStart(4, "0")}`;

    // Contraseña inicial = cédula
    const password = await bcrypt.hash(cedula, 10);

    const afiliado = await prisma.afiliado.create({
      data: {
        jacId,
        cedula,
        codigoJAC,
        nombre,
        apellido,
        telefono: telefono || null,
        email: email || null,
        direccion: direccion || null,
        barrio: barrio || null,
        cargo: cargo || "Comunero",
        vigenciaHasta: vigenciaHasta ? new Date(vigenciaHasta) : null,
        password,
      },
    });

    // Generar cuotas del año actual automáticamente
    const anio = new Date().getFullYear();
    const valorCuota = jac?.valorCuotaMes ?? 5000;

    await prisma.cuota.createMany({
      data: Array.from({ length: 12 }, (_, i) => ({
        afiliadoId: afiliado.id,
        mes: i + 1,
        anio,
        valor: valorCuota,
        pagado: false,
      })),
    });

    const { password: _, ...rest } = afiliado;
    return NextResponse.json(rest, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al crear afiliado" }, { status: 500 });
  }
}