import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarCorreoRecuperacion } from "@/lib/email";
import crypto from "crypto";

// Enmascara un correo tipo "javier.perez@gmail.com" -> "j***********z@gmail.com"
// Conserva el primer y último carácter del nombre de usuario, oculta el resto,
// y muestra el dominio completo. Ayuda a reconocer la cuenta sin exponerla.
function enmascararCorreo(email: string): string {
  const [usuario, dominio] = email.split("@");
  if (!dominio) return email;
  if (usuario.length <= 2) {
    return `${usuario[0] ?? "*"}***@${dominio}`;
  }
  const inicio = usuario[0];
  const fin = usuario[usuario.length - 1];
  const oculto = "*".repeat(Math.min(usuario.length - 2, 8));
  return `${inicio}${oculto}${fin}@${dominio}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tipo = body.tipo === "ADMIN" ? "ADMIN" : "COMUNERO";

    // Mensaje base: siempre se devuelve, exista o no la cuenta (evita enumeración de usuarios).
    const respuestaGenerica = {
      message: "Si los datos son correctos, te enviamos un correo con instrucciones.",
    };

    let email: string | null = null;
    let nombre = "";
    let targetId: string | null = null;

    if (tipo === "ADMIN") {
      const emailBuscado = String(body.email ?? "").trim().toLowerCase();
      if (!emailBuscado) return NextResponse.json(respuestaGenerica);

      const admin = await prisma.adminUser.findUnique({ where: { email: emailBuscado } });
      if (admin?.activo) {
        email = admin.email;
        nombre = admin.nombre;
        targetId = admin.id;
      }
    } else {
      const cedula = String(body.cedula ?? "").trim();
      if (!cedula) return NextResponse.json(respuestaGenerica);

      const afiliado = await prisma.afiliado.findFirst({ where: { cedula } });
      // Solo se puede recuperar por correo si el afiliado tiene uno registrado.
      if (afiliado?.activo && afiliado.email) {
        email = afiliado.email;
        nombre = `${afiliado.nombre} ${afiliado.apellido}`;
        targetId = afiliado.id;
      }
    }

    // Si no se encontró cuenta, o el comunero no tiene correo registrado,
    // igual respondemos genérico (no revelamos el motivo exacto, ni un correo enmascarado).
    if (!email || !targetId) {
      return NextResponse.json(respuestaGenerica);
    }

    // Invalidar tokens previos no usados para esta cuenta (evita acumulación).
    await prisma.passwordResetToken.deleteMany({
      where: { tipo, targetId, usedAt: null },
    });

    const tokenPlano = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(tokenPlano).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await prisma.passwordResetToken.create({
      data: { tokenHash, tipo, targetId, expiresAt },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const resetUrl = `${baseUrl}/restablecer-password?token=${tokenPlano}&tipo=${tipo}`;

    await enviarCorreoRecuperacion({ to: email, nombre, resetUrl });

    // Solo cuando SÍ existe la cuenta se incluye el correo enmascarado,
    // para ayudar al usuario a saber en qué bandeja revisar.
    return NextResponse.json({
      ...respuestaGenerica,
      emailEnmascarado: enmascararCorreo(email),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({
      message: "Si los datos son correctos, te enviamos un correo con instrucciones.",
    });
  }
}