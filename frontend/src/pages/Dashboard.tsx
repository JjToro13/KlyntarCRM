// frontend/src/pages/Dashboard.tsx
import type { MeResponse } from "../lib/auth";

export default function Dashboard({ me }: { me: MeResponse }) {
  return (
    
    <div style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <p>Bienvenido, <b>{me.firstName || "Usuario"}</b> ({me.email}) — Rol: <b>{me.role}</b></p>
      <p>Próximamente: métricas, últimos leads, etc.</p>
    </div>
  );
}
