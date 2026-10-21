"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Building2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditarJuntaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [jac, setJac] = useState({
    codigo: "", nombre: "", barrio: "", direccion: "", telefono: "", email: "", valorCuotaMes: "5000",
  });

  useEffect(() => {
    fetch(`/api/jacs/${id}`).then(async r => {
      if (!r.ok) {
        const d = await r.json();
        setError(d.error || "No se pudo cargar la junta.");
        setLoading(false);
        return;
      }
      const d = await r.json();
      setJac({
        codigo: d.codigo,
        nombre: d.nombre,
        barrio: d.barrio ?? "",
        direccion: d.direccion ?? "",
        telefono: d.telefono ?? "",
        email: d.email ?? "",
        valorCuotaMes: String(d.valorCuotaMes),
      });
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!jac.nombre) {
      setError("El nombre es obligatorio.");
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/jacs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: jac.nombre,
        barrio: jac.barrio,
        direccion: jac.direccion,
        telefono: jac.telefono,
        email: jac.email,
        valorCuotaMes: Number(jac.valorCuotaMes),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Error al guardar los cambios.");
      setSaving(false);
      return;
    }
    router.push("/juntas");
  };

  if (loading) {
    return (
      <main className="flex-1 p-8">
        <div className="py-16 flex items-center justify-center gap-2 text-gray-400">
          <div className="w-5 h-5 border-2 border-stone-200 border-t-verde-500 rounded-full animate-spin" />
          Cargando...
        </div>
      </main>
    );
  }

  if (error && !jac.nombre) {
    return (
      <main className="flex-1 p-8">
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl p-6">{error}</div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8 max-w-2xl">
      <Link href="/juntas" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-cafe mb-5 transition-colors">
        <ArrowLeft size={14} /> Volver a Juntas
      </Link>

      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[2px] text-verde-500 mb-1">Alcaldía de Garzón</p>
        <h2 className="font-display text-3xl font-semibold text-cafe">Editar Junta</h2>
        <p className="text-sm text-gray-500 mt-1">Código: <span className="font-mono text-verde-600">{jac.codigo}</span> (no editable)</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Building2 size={16} className="text-verde-600" />
            <h3 className="font-display text-base font-semibold text-cafe">Datos de la Junta</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre *">
              <input required value={jac.nombre}
                onChange={e => setJac(f => ({ ...f, nombre: e.target.value }))}
                className={inputClass} />
            </Field>
            <Field label="Barrio / Vereda">
              <input value={jac.barrio}
                onChange={e => setJac(f => ({ ...f, barrio: e.target.value }))}
                className={inputClass} />
            </Field>
            <Field label="Dirección">
              <input value={jac.direccion}
                onChange={e => setJac(f => ({ ...f, direccion: e.target.value }))}
                className={inputClass} />
            </Field>
            <Field label="Teléfono">
              <input value={jac.telefono}
                onChange={e => setJac(f => ({ ...f, telefono: e.target.value }))}
                className={inputClass} />
            </Field>
            <Field label="Correo de la junta">
              <input type="email" value={jac.email}
                onChange={e => setJac(f => ({ ...f, email: e.target.value }))}
                className={inputClass} />
            </Field>
            <Field label="Cuota mensual (COP)">
              <input type="number" value={jac.valorCuotaMes}
                onChange={e => setJac(f => ({ ...f, valorCuotaMes: e.target.value }))}
                className={inputClass} />
            </Field>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>
        )}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-verde-600 text-white text-sm font-medium rounded-xl hover:bg-verde-500 transition-colors disabled:opacity-60">
            {saving
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Save size={16} />}
            {saving ? "Guardando..." : "Guardar Cambios"}
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