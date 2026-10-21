import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = String(body.token ?? "");
    const tipo = body.tipo === "ADMIN" ? "ADMIN" : "COMUNERO";
    const password = String(body.password ?? "");

    if (!token || !password) {
      return NextResponse.json({ error: "Token y contraseña son requeridos" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const registro = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (
      !registro ||
      registro.tipo !== tipo ||
      registro.usedAt !== null ||
      registro.expiresAt < new Date()
    ) {
      return NextResponse.json(
        { error: "El enlace no es válido o ya expiró. Solicita uno nuevo." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    if (tipo === "ADMIN") {
      await prisma.adminUser.update({
        where: { id: registro.targetId },
        data: { password: passwordHash },
      });
    } else {
      await prisma.afiliado.update({
        where: { id: registro.targetId },
        data: { password: passwordHash },
      });
    }

    await prisma.passwordResetToken.update({
      where: { id: registro.id },
      data: { usedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al restablecer la contraseña" }, { status: 500 });
  }
}