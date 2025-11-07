import { useEffect, useState } from "react";
import { api } from "../lib/api";

type Lead = {
  id: string;
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "DISQUALIFIED" | "CLOSED_WON" | "CLOSED_LOST";
  agent?: { id: string; email: string; firstName?: string | null; lastName?: string | null } | null;
  createdAt: string;
};

type LeadsResp = { total: number; page: number; pageSize: number; items: Lead[] };

export default function Leads() {
  const [items, setItems] = useState<Lead[]>([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // form crear
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");

  async function load(p = page, search = q) {
    setLoading(true);
    try {
      const data = await api<LeadsResp>(`/leads?q=${encodeURIComponent(search)}&page=${p}&pageSize=${pageSize}`);
      setItems(data.items);
      setTotal(data.total);
      setPage(data.page);
    } finally {
      setLoading(false);
    }
  }

  async function createLead(e: React.FormEvent) {
    e.preventDefault();
    await api<Lead>("/leads", {
      method: "POST",
      body: JSON.stringify({ email, phone, firstName, lastName }),
    });
    setEmail(""); setPhone(""); setFirst(""); setLast("");
    load(1, q);
  }

  async function removeLead(id: string) {
    if (!confirm("¿Eliminar lead?")) return;
    await api<void>(`/leads/${id}`, { method: "DELETE" });
    load(page, q);
  }

  useEffect(() => { load(1, q); }, []); // inicial

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div style={{ padding: 24 }}>
      <h1>Leads</h1>

      {/* Buscar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por email, teléfono o nombre" />
        <button onClick={() => load(1, q)}>Buscar</button>
      </div>

      {/* Crear */}
      <form onSubmit={createLead} style={{ display: "grid", gap: 8, maxWidth: 520, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" />
          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Teléfono" />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={firstName} onChange={e=>setFirst(e.target.value)} placeholder="Nombre" />
          <input value={lastName} onChange={e=>setLast(e.target.value)} placeholder="Apellido" />
        </div>
        <button type="submit">Crear lead</button>
      </form>

      {/* Tabla */}
      {loading ? <p>Cargando…</p> : (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #444", padding: 8 }}>Email</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #444", padding: 8 }}>Teléfono</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #444", padding: 8 }}>Nombre</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #444", padding: 8 }}>Estado</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #444", padding: 8 }}>Agente</th>
                <th style={{ borderBottom: "1px solid #444", padding: 8 }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map(l => (
                <tr key={l.id}>
                  <td style={{ padding: 8 }}>{l.email || "—"}</td>
                  <td style={{ padding: 8 }}>{l.phone || "—"}</td>
                  <td style={{ padding: 8 }}>{[l.firstName, l.lastName].filter(Boolean).join(" ") || "—"}</td>
                  <td style={{ padding: 8 }}>{l.status}</td>
                  <td style={{ padding: 8 }}>
                    {l.agent ? (l.agent.firstName || l.agent.email) : "—"}
                  </td>
                  <td style={{ padding: 8, textAlign: "right" }}>
                    <button onClick={() => removeLead(l.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td style={{ padding: 8 }} colSpan={6}>Sin leads aún.</td></tr>
              )}
            </tbody>
          </table>

          {/* Paginación */}
          <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
            <button disabled={page <= 1} onClick={() => load(page - 1, q)}>← Anterior</button>
            <span>Página {page} de {pages}</span>
            <button disabled={page >= pages} onClick={() => load(page + 1, q)}>Siguiente →</button>
          </div>
        </>
      )}
    </div>
  );
}
