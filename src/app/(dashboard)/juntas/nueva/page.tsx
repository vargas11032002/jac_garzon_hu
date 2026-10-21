"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, UserCog, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NuevaJuntaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [jac, setJac] = useState({
    codigo: "", nombre: "", barrio: "", direccion: "", telefono: "", email: "", valorCuotaMes: "5000",
  });
  const [presidente, setPresidente] = useState({
    nombre: "", email: "", password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!jac.codigo || !jac.nombre) {
      setError("Código y nombre de la junta son obligatorios.");
      return;
    }
    if (!presidente.nombre || !presidente.email || !presidente.password) {
      setError("Nombre, correo y contraseña del presidente son obligatorios.");
      return;
    }

    setLoading(true);

    // 1. Crear la junta
    const resJac = await fetch("/api/jacs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...jac, valorCuotaMes: Number(jac.valorCuotaMes) }),
    });
    const dataJac = await resJac.json();

    if (!resJac.ok) {
      setError(dataJac.error || "Error al crear la junta.");
      setLoading(false);
      return;
    }

    // 2. Crear el presidente de esa junta
    const resPresidente = await fetch("/api/admin-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...presidente, jacId: dataJac.id }),
    });
    const dataPresidente = await resPresidente.json();

    if (!resPresidente.ok) {
      setError(
        `La junta se creó, pero hubo un error al crear el presidente: ${dataPresidente.error || "error desconocido"}. Puedes intentar crearlo de nuevo desde el detalle de la junta.`
      );
      setLoading(false);
      return;
    }

    router.push("/juntas?success=1");
  };

  return (
    <main className="flex-1 p-8 max-w-3xl">
      <Link href="/juntas" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-cafe mb-5 transition-colors">
        <ArrowLeft size={14} /> Volver a Juntas
      </Link>

      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[2px] text-verde-500 mb-1">Alcaldía de Garzón</p>
        <h2 className="font-display text-3xl font-semibold text-cafe">Nueva Junta de Acción Comunal</h2>
        <p className="text-sm text-gray-500 mt-1">Registra la junta y asigna a su presidente en un solo paso</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos de la junta */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Building2 size={16} className="text-verde-600" />
            <h3 className="font-display text-base font-semibold text-cafe">Datos de la Junta</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Código *">
              <input required value={jac.codigo}
                onChange={e => setJac(f => ({ ...f, codigo: e.target.value }))}
                placeholder="JAC-GAR-002" className={inputClass} />
            </Field>
            <Field label="Nombre *">
              <input required value={jac.nombre}
                onChange={e => setJac(f => ({ ...f, nombre: e.target.value }))}
                placeholder="JAC Vereda La Cabaña" className={inputClass} />
            </Field>
            <Field label="Barrio / Vereda">
              <input value={jac.barrio}
                onChange={e => setJac(f => ({ ...f, barrio: e.target.value }))}
                placeholder="Vrd. La Cabaña" className={inputClass} />
            </Field>
            <Field label="Dirección">
              <input value={jac.direccion}
                onChange={e => setJac(f => ({ ...f, direccion: e.target.value }))}
                placeholder="Vía Garzón - La Jagua" className={inputClass} />
            </Field>
            <Field label="Teléfono">
              <input value={jac.telefono}
                onChange={e => setJac(f => ({ ...f, telefono: e.target.value }))}
                placeholder="310..." className={inputClass} />
            </Field>
            <Field label="Correo de la junta">
              <input type="email" value={jac.email}
                onChange={e => setJac(f => ({ ...f, email: e.target.value }))}
                placeholder="jaclacabana@garzon.gov.co" className={inputClass} />
            </Field>
            <Field label="Cuota mensual (COP)">
              <input type="number" value={jac.valorCuotaMes}
                onChange={e => setJac(f => ({ ...f, valorCuotaMes: e.target.value }))}
                className={inputClass} />
            </Field>
          </div>
        </div>

        {/* Datos del presidente */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <UserCog size={16} className="text-verde-600" />
            <h3 className="font-display text-base font-semibold text-cafe">Presidente de la Junta</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre completo *">
              <input required value={presidente.nombre}
                onChange={e => setPresidente(f => ({ ...f, nombre: e.target.value }))}
                placeholder="Nombre y apellido" className={inputClass} />
            </Field>
            <Field label="Correo electrónico *">
              <input type="email" required value={presidente.email}
                onChange={e => setPresidente(f => ({ ...f, email: e.target.value }))}
                placeholder="presidente@..." className={inputClass} />
            </Field>
            <Field label="Contraseña inicial *">
              <input type="text" required value={presidente.password}
                onChange={e => setPresidente(f => ({ ...f, password: e.target.value }))}
                placeholder="Contraseña temporal" className={inputClass} />
            </Field>
          </div>
          <p className="text-xs text-gray-400 mt-3">El presidente podrá cambiar esta contraseña luego desde su perfil.</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>
        )}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-verde-600 text-white text-sm font-medium rounded-xl hover:bg-verde-500 transition-colors disabled:opacity-60">
            {loading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Save size={16} />}
            {loading ? "Creando..." : "Crear Junta y Presidente"}
          </button>
          <Link href="/juntas" className="px-5 py-2.5 text-sm text-gray-500 hover:text-cafe transition-colors">
            Cancelar
          </Link>
        </div>
      </form>
    </main>
  );
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-cafe text-sm outline-none focus:border-verde-500 focus:ring-2 focus:ring-verde-50 transition-all";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}