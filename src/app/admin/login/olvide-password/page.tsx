"use client";
import { useState } from "react";
import Link from "next/link";
import { KeyRound, ArrowLeft } from "lucide-react";

export default function OlvidePasswordAdmin() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: "ADMIN", email: email.trim() }),
    });
    setLoading(false);
    setEnviado(true);
  };

  return (
    <div className="min-h-screen bg-verde-600 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur rounded-2xl mb-4 border border-white/20">
            <KeyRound size={28} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white">JAC Garzón</h1>
          <p className="text-white/60 text-sm mt-1">Recuperar contraseña — Administrador</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {enviado ? (
            <div className="text-center space-y-3">
              <h2 className="font-display text-xl font-semibold text-cafe">Revisa tu correo</h2>
              <p className="text-sm text-gray-500">
                Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.
                Revisa también la carpeta de spam.
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-display text-xl font-semibold text-cafe mb-1">Recuperar contraseña</h2>
              <p className="text-sm text-gray-400 mb-6">
                Ingresa tu correo electrónico y te enviaremos un enlace de recuperación.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Correo electrónico
                  </label>
                  <input
                    type="email" placeholder="admin@garzon.gov.co"
                    value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-cafe text-sm outline-none focus:border-verde-500 focus:ring-2 focus:ring-verde-50 transition-all"
                    required
                  />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-verde-600 text-white font-semibold text-sm rounded-xl hover:bg-verde-500 transition-colors disabled:opacity-60 mt-2">
                  {loading ? "Enviando..." : "Enviar enlace de recuperación"}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <Link href="/admin/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-cafe transition-colors">
              <ArrowLeft size={14} /> Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}