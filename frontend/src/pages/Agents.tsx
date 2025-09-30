// frontend/src/pages/Agents.tsx
import { useEffect, useState } from "react";
import { api } from "../lib/api";

type Agent = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: "AGENT" | "ADMIN" | "SUPERVISOR";
  createdAt: string;
};

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await api<Agent[]>("/agents");
      setAgents(data);
    } catch (e: any) {
      setError(e.message || "Error al cargar agentes");
    } finally {
      setLoading(false);
    }
  }

  async function createAgent(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api<Agent>("/agents", {
        method: "POST",
        body: JSON.stringify({ email, firstName, lastName })
      });
      setEmail(""); setFirstName(""); setLastName("");
      await load();
    } catch (e: any) {
      setError(e.message || "No se pudo crear el agente");
    }
  }

  async function removeAgent(id: string) {
    if (!confirm("¿Eliminar agente?")) return;
    try {
      await api<void>(`/agents/${id}`, { method: "DELETE" });
      await load();
    } catch (e: any) {
      alert(e.message || "No se pudo eliminar");
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Agentes</h1>

      <form onSubmit={createAgent} style={{ display: "grid", gap: 8, maxWidth: 420, marginBottom: 16 }}>
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="email@dominio.com" required />
        <input value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="Nombre" />
        <input value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Apellido" />
        <button type="submit">Crear agente</button>
      </form>

      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {loading ? <p>Cargando…</p> : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #444", padding: 8 }}>Email</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #444", padding: 8 }}>Nombre</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #444", padding: 8 }}>Rol</th>
              <th style={{ borderBottom: "1px solid #444", padding: 8 }}></th>
            </tr>
          </thead>
          <tbody>
            {agents.map(a => (
              <tr key={a.id}>
                <td style={{ padding: 8 }}>{a.email}</td>
                <td style={{ padding: 8 }}>{[a.firstName, a.lastName].filter(Boolean).join(" ") || "—"}</td>
                <td style={{ padding: 8 }}>{a.role}</td>
                <td style={{ padding: 8, textAlign: "right" }}>
                  <button onClick={()=>removeAgent(a.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {agents.length === 0 && (
              <tr><td style={{ padding: 8 }} colSpan={4}>Sin agentes aún.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
