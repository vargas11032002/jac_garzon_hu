"use client";
import { useState, useEffect, useCallback } from "react";
import { UserCog, CheckCircle2, Crown, Wallet, Plus, X, Pencil, Trash2, FileText, Scale } from "lucide-react";
import { useSession } from "next-auth/react";

interface Miembro {
  id: string; email: string; nombre: string; rol: string; activo: boolean;
}

type RolAsignable = "VICEPRESIDENTE" | "TESORERO" | "SECRETARIO" | "FISCAL";

const CARGO_INFO: Record<string, { label: string; icon: any; color: string }> = {
  PRESIDENTE:     { label: "Presidente",     icon: Crown,    color: "bg-dorado-100 text-dorado-600" },
  VICEPRESIDENTE: { label: "Vicepresidente", icon: UserCog,  color: "bg-orange-100 text-orange-600" },
  TESORERO:       { label: "Tesorero",       icon: Wallet,   color: "bg-blue-100 text-blue-700" },
  SECRETARIO:     { label: "Secretario/a",   icon: FileText, color: "bg-purple-100 text-purple-600" },
  FISCAL:         { label: "Fiscal",         icon: Scale,    color: "bg-teal-100 text-teal-600" },
};

const ORDEN_CARGOS = ["PRESIDENTE", "VICEPRESIDENTE", "TESORERO", "SECRETARIO", "FISCAL"] as const;
const ROLES_ASIGNABLES: RolAsignable[] = ["VICEPRESIDENTE", "TESORERO", "SECRETARIO", "FISCAL"];

export default function EquipoPage() {
  const { data: session } = useSession();
  const [equipo, setEquipo] = useState<Miembro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [showForm, setShowForm] = useState<null | RolAsignable>(null);
  const [form, setForm] = useState({ nombre: "", email: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [editing, setEditing] = useState<Miembro | null>(null);
  const [editForm, setEditForm] = useState({ nombre: "", email: "", password: "" });
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const abrirEditar = (m: Miembro) => {
    setEditForm({ nombre: m.nombre, email: m.email, password: "" });
    setEditError("");
    setEditing(m);
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setEditError("");
    setSavingEdit(true);

    const body: any = { nombre: editForm.nombre, email: editForm.email };
    if (editForm.password) body.password = editForm.password;

    const res = await fetch(`/api/admin-users/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!res.ok) {
      setEditError(data.error || "Error al guardar los cambios.");
      setSavingEdit(false);
      return;
    }

    setSavingEdit(false);
    setEditing(null);
    setToast("Cambios guardados ✓");
    load();
  };

  const handleEliminar = async (m: Miembro) => {
    if (!confirm(`¿Eliminar a ${m.nombre} (${CARGO_INFO[m.rol]?.label ?? m.rol})? Esta acción no se puede deshacer.`)) return;
    setDeletingId(m.id);
    const res = await fetch(`/api/admin-users/${m.id}`, { method: "DELETE" });
    setDeletingId(null);
    if (!res.ok) {
      const d = await res.json();
      alert(d.error || "Error al eliminar.");
      return;
    }
    setToast("Usuario eliminado");
    load();
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin-users");
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "No se pudo cargar el equipo directivo.");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setEquipo(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 3500); return () => clearTimeout(t); } }, [toast]);

  const abrirForm = (rol: RolAsignable) => {
    setForm({ nombre: "", email: "", password: "" });
    setFormError("");
    setShowForm(rol);
  };

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showForm) return;
    setFormError("");
    setSaving(true);

    const res = await fetch("/api/admin-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, rol: showForm }),
    });
    const data = await res.json();

    if (!res.ok) {
      setFormError(data.error || "Error al crear el usuario.");
      setSaving(false);
      return;
    }

    setSaving(false);
    setShowForm(null);
    setToast(`${CARGO_INFO[showForm].label} agregado exitosamente ✓`);
    load();
  };

  if (error) {
    return (
      <main className="flex-1 p-8">
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl p-6">{error}</div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8 max-w-3xl">
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-verde-600 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 animate-fade-up">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}

      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[2px] text-verde-500 mb-1">Mi Junta</p>
        <h2 className="font-display text-3xl font-semibold text-cafe">Equipo Directivo</h2>
        <p className="text-sm text-gray-500 mt-1">
          Presidente, vicepresidente, tesorero, secretario y fiscal de la junta
        </p>
      </div>

      {loading ? (
        <div className="py-16 flex items-center justify-center gap-2 text-gray-400">
          <div className="w-5 h-5 border-2 border-stone-200 border-t-verde-500 rounded-full animate-spin" />
          Cargando...
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {ORDEN_CARGOS.map(rol => {
            const miembro = equipo.find(m => m.rol === rol);
            const info = CARGO_INFO[rol];
            const Icon = info.icon;
            const esAsignable = ROLES_ASIGNABLES.includes(rol as RolAsignable);
            const puedoCrear = !miembro && esAsignable && (session?.user as any)?.rol !== "SUPER_ADMIN";

            return (
              <div key={rol} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex items-center gap-4 group">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${info.color}`}>
                  <Icon size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{info.label}</p>
                  {miembro ? (
                    <>
                      <p className="text-sm font-medium text-cafe mt-0.5">{miembro.nombre}</p>
                      <p className="text-xs text-gray-400">{miembro.email}</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400 mt-0.5">Vacante</p>
                  )}
                </div>
                {miembro ? (
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${miembro.activo ? "bg-verde-50 text-verde-600" : "bg-red-50 text-red-500"}`}>
                      {miembro.activo ? "Activo" : "Inactivo"}
                    </span>
                    {rol !== "PRESIDENTE" && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => abrirEditar(miembro)}
                          className="w-7 h-7 rounded-lg hover:bg-stone-100 flex items-center justify-center transition-colors" title="Editar">
                          <Pencil size={13} className="text-gray-500" />
                        </button>
                        <button onClick={() => handleEliminar(miembro)}
                          disabled={deletingId === miembro.id}
                          className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors" title="Eliminar">
                          <Trash2 size={13} className={deletingId === miembro.id ? "text-gray-300" : "text-red-400"} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : puedoCrear ? (
                  <button
                    onClick={() => abrirForm(rol as RolAsignable)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-verde-600 text-white text-xs font-medium rounded-lg hover:bg-verde-500 transition-colors">
                    <Plus size={13} /> Asignar
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-semibold text-cafe">
                Nuevo {CARGO_INFO[showForm].label}
              </h3>
              <button onClick={() => setShowForm(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCrear} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nombre completo</label>
                <input required value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-cafe text-sm outline-none focus:border-verde-500 focus:ring-2 focus:ring-verde-50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Correo electrónico</label>
                <input type="email" required value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-cafe text-sm outline-none focus:border-verde-500 focus:ring-2 focus:ring-verde-50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Contraseña inicial</label>
                <input required value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-cafe text-sm outline-none focus:border-verde-500 focus:ring-2 focus:ring-verde-50" />
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">{formError}</div>
              )}

              <button type="submit" disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-verde-600 text-white text-sm font-medium rounded-xl hover:bg-verde-500 transition-colors disabled:opacity-60">
                {saving ? "Guardando..." : `Crear ${CARGO_INFO[showForm].label}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-semibold text-cafe">
                Editar {CARGO_INFO[editing.rol]?.label ?? editing.rol}
              </h3>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGuardarEdicion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nombre completo</label>
                <input required value={editForm.nombre}
                  onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-cafe text-sm outline-none focus:border-verde-500 focus:ring-2 focus:ring-verde-50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Correo electrónico</label>
                <input type="email" required value={editForm.email}
                  onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-cafe text-sm outline-none focus:border-verde-500 focus:ring-2 focus:ring-verde-50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nueva contraseña (opcional)</label>
                <input value={editForm.password}
                  placeholder="Dejar en blanco para no cambiarla"
                  onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-cafe text-sm outline-none focus:border-verde-500 focus:ring-2 focus:ring-verde-50" />
              </div>

              {editError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">{editError}</div>
              )}

              <button type="submit" disabled={savingEdit}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-verde-600 text-white text-sm font-medium rounded-xl hover:bg-verde-500 transition-colors disabled:opacity-60">
                {savingEdit ? "Guardando..." : "Guardar Cambios"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}