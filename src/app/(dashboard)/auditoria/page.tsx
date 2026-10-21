"use client";
import { useState, useEffect, useCallback } from "react";
import { History, ArrowUpRight, Trash2, Pencil } from "lucide-react";

interface Registro {
  id: string;
  actorNombre: string;
  actorRol: string;
  accion: string;
  entidad: string;
  descripcion: string;
  createdAt: string;
}

const ROL_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Alcaldía",
  PRESIDENTE: "Presidente",
  VICEPRESIDENTE: "Vicepresidente",
  TESORERO: "Tesorero",
  SECRETARIO: "Secretario/a",
  FISCAL: "Fiscal",
};

const ACCION_INFO: Record<string, { icon: any; color: string; bg: string }> = {
  CREAR:    { icon: ArrowUpRight, color: "text-verde-600", bg: "bg-verde-50" },
  EDITAR:   { icon: Pencil,       color: "text-blue-600",  bg: "bg-blue-50" },
  ELIMINAR: { icon: Trash2,       color: "text-red-500",   bg: "bg-red-50" },
};

export default function AuditoriaPage() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtroEntidad, setFiltroEntidad] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/auditoria${filtroEntidad ? `?entidad=${filtroEntidad}` : ""}`);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "No se pudo cargar el historial de auditoría.");
      setLoading(false);
      return;
    }
    setRegistros(await res.json());
    setLoading(false);
  }, [filtroEntidad]);

  useEffect(() => { load(); }, [load]);

  if (error) {
    return (
      <main className="flex-1 p-8">
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl p-6">{error}</div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8">
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[2px] text-verde-500 mb-1">Vigilancia</p>
        <h2 className="font-display text-3xl font-semibold text-cafe">Historial de Auditoría</h2>
        <p className="text-sm text-gray-500 mt-1">Registro de acciones sobre Tesorería y Cuotas</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-cafe">Últimos movimientos</h3>
          <div className="flex gap-2">
            {[["", "Todos"], ["Transaccion", "Tesorería"], ["Cuota", "Cuotas"]].map(([val, label]) => (
              <button key={val} onClick={() => setFiltroEntidad(val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${filtroEntidad === val ? "bg-verde-600 text-white" : "bg-stone-50 text-gray-500 hover:bg-stone-100"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-gray-400">
            <div className="w-5 h-5 border-2 border-stone-200 border-t-verde-500 rounded-full animate-spin" />
          </div>
        ) : registros.length === 0 ? (
          <div className="py-16 text-center">
            <History size={28} className="mx-auto text-stone-300 mb-2" />
            <p className="font-display text-lg text-cafe/50">Sin registros todavía</p>
            <p className="text-sm text-gray-400 mt-1">Las acciones sobre Tesorería y Cuotas aparecerán aquí</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-stone-50">
              <tr>
                {["Fecha", "Acción", "Descripción", "Realizado por"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {registros.map(r => {
                const info = ACCION_INFO[r.accion] ?? ACCION_INFO.EDITAR;
                const Icon = info.icon;
                return (
                  <tr key={r.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-gray-400 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                      <span className="text-gray-300"> · </span>
                      {new Date(r.createdAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${info.bg} ${info.color}`}>
                        <Icon size={11} /> {r.accion}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-cafe">{r.descripcion}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-cafe">{r.actorNombre}</p>
                      <p className="text-xs text-gray-400">{ROL_LABELS[r.actorRol] ?? r.actorRol}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}