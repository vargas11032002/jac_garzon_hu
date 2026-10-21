"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { Building2, Search, CheckCircle2, Users, UserCog, Plus, Pencil, Power, PowerOff } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Jac {
  id: string;
  codigo: string;
  nombre: string;
  barrio: string | null;
  municipio: string;
  activa: boolean;
  valorCuotaMes: number;
  _count: { afiliados: number; adminUsers: number };
}

function JuntasContent() {
  const searchParams = useSearchParams();
  const [juntas, setJuntas] = useState<Jac[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState(searchParams.get("success") ? "Junta creada exitosamente ✓" : "");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const toggleActiva = async (j: Jac) => {
    const accion = j.activa ? "desactivar" : "activar";
    if (j.activa && !confirm(`¿Desactivar "${j.nombre}"? Dejará de operar, pero sus datos históricos se conservan.`)) return;
    setTogglingId(j.id);
    await fetch(`/api/jacs/${j.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activa: !j.activa }),
    });
    setTogglingId(null);
    setToast(`Junta ${j.activa ? "desactivada" : "activada"} ✓`);
    load();
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/jacs");
    if (res.status === 403) {
      setError("No tienes permiso para ver esta sección.");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setJuntas(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 3500); return () => clearTimeout(t); } }, [toast]);

  const filtered = juntas.filter(j =>
    `${j.nombre} ${j.codigo} ${j.barrio ?? ""} ${j.municipio}`
      .toLowerCase().includes(search.toLowerCase())
  );

  if (error) {
    return (
      <main className="flex-1 p-8">
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl p-6">{error}</div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8">
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-verde-600 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 animate-fade-up">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}

      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[2px] text-verde-500 mb-1">Alcaldía de Garzón</p>
          <h2 className="font-display text-3xl font-semibold text-cafe">Juntas de Acción Comunal</h2>
          <p className="text-sm text-gray-500 mt-1">Crea y administra las juntas comunales del municipio</p>
        </div>
        <Link href="/juntas/nueva"
          className="flex items-center gap-2 px-4 py-2.5 bg-verde-600 text-white text-sm font-medium rounded-xl hover:bg-verde-500 transition-colors">
          <Plus size={16} /> Nueva Junta
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Juntas", value: juntas.length, color: "text-verde-600" },
          { label: "Activas", value: juntas.filter(j => j.activa).length, color: "text-blue-600" },
          { label: "Total Comuneros", value: juntas.reduce((s, j) => s + j._count.afiliados, 0), color: "text-dorado-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-stone-100 px-5 py-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
            <p className={`font-display text-3xl font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm mb-5 px-4 py-3 flex items-center gap-2">
        <Search size={15} className="text-gray-400 shrink-0" />
        <input
          placeholder="Buscar por nombre, código o barrio..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none text-cafe placeholder:text-gray-400"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-cafe">Lista de Juntas</h3>
          <span className="text-xs text-gray-400 bg-stone-50 px-3 py-1 rounded-full">
            {filtered.length} registro{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-gray-400">
            <div className="w-5 h-5 border-2 border-stone-200 border-t-verde-500 rounded-full animate-spin" />
            Cargando...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-display text-lg text-cafe/50">
              {search ? "Sin resultados para tu búsqueda" : "No hay juntas registradas"}
            </p>
            {!search && (
              <Link href="/juntas/nueva" className="inline-flex items-center gap-1.5 mt-3 text-sm text-verde-600 hover:underline font-medium">
                <Plus size={14} /> Crear la primera junta
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50">
                <tr>
                  {["Junta", "Código", "Barrio/Vereda", "Comuneros", "Directivos", "Cuota Mensual", "Estado", ""].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filtered.map(j => (
                  <tr key={j.id} className="hover:bg-stone-50/50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-verde-100 flex items-center justify-center text-verde-700 shrink-0">
                          <Building2 size={14} />
                        </div>
                        <p className="text-sm font-medium text-cafe">{j.nombre}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-semibold text-verde-600 font-mono">{j.codigo}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{j.barrio ?? "—"}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Users size={13} className="text-gray-400" /> {j._count.afiliados}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <UserCog size={13} className="text-gray-400" /> {j._count.adminUsers}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">
                      ${j.valorCuotaMes.toLocaleString("es-CO")}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${j.activa ? "bg-verde-50 text-verde-600" : "bg-red-50 text-red-500"}`}>
                        {j.activa ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/juntas/${j.id}/editar`}
                          className="w-7 h-7 rounded-lg hover:bg-stone-100 flex items-center justify-center transition-colors" title="Editar">
                          <Pencil size={13} className="text-gray-500" />
                        </Link>
                        <button
                          onClick={() => toggleActiva(j)}
                          disabled={togglingId === j.id}
                          title={j.activa ? "Desactivar" : "Activar"}
                          className="w-7 h-7 rounded-lg hover:bg-stone-100 flex items-center justify-center transition-colors">
                          {j.activa
                            ? <PowerOff size={13} className={togglingId === j.id ? "text-gray-300" : "text-red-400"} />
                            : <Power size={13} className={togglingId === j.id ? "text-gray-300" : "text-verde-500"} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

export default function JuntasPage() {
  return <Suspense><JuntasContent /></Suspense>;
}