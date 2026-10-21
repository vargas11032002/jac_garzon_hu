"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn, Shield, Users } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      cedula: form.email.trim(), // el campo "cedula" se usa como email para admins
      password: form.password,
      adminLogin: "true",
      redirect: false,
    });
    if (res?.ok) {
      router.push("/dashboard");
    } else {
      setError("Correo o contraseña incorrecta. Verifique sus datos.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-verde-600 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-verde-500 rounded-full opacity-30" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-verde-700 rounded-full opacity-40" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur rounded-2xl mb-4 border border-white/20">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white">JAC Garzón</h1>
          <p className="text-white/60 text-sm mt-1">Panel Administrativo — Garzón, Huila</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Selector de tipo de acceso */}
          <div className="flex bg-stone-100 rounded-xl p-1 mb-6">
            <button
              type="button"
              disabled
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white text-cafe text-xs font-semibold shadow-sm cursor-default"
            >
              <Shield size={14} /> Administrador
            </button>
            <Link
              href="/login"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-gray-500 text-xs font-semibold hover:text-cafe transition-colors"
            >
              <Users size={14} /> Comunero
            </Link>
          </div>

          <h2 className="font-display text-xl font-semibold text-cafe mb-1">Acceso Administrador</h2>
          <p className="text-sm text-gray-400 mb-6">Ingresa con tu correo y contraseña</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Correo electrónico</label>
              <input type="email" placeholder="admin@garzon.gov.co"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-cafe text-sm outline-none focus:border-verde-500 focus:ring-2 focus:ring-verde-50 transition-all"
                required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Contraseña</label>
              <div className="relative">
                <input type={show ? "text" : "password"} placeholder="Tu contraseña"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-stone-200 text-cafe text-sm outline-none focus:border-verde-500 focus:ring-2 focus:ring-verde-50 transition-all"
                  required />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-verde-600 text-white font-semibold text-sm rounded-xl hover:bg-verde-500 transition-colors disabled:opacity-60 mt-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogIn size={16} />}
              {loading ? "Verificando..." : "Ingresar"}
            </button>
          </form>

          <div className="text-center mt-4">
            <Link
              href="/admin/login/olvide-password"
              className="text-xs text-gray-400 hover:text-cafe underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">Sistema desarrollado por JAV Dev Group</p>
      </div>
    </div>
  );
}