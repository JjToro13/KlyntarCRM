import { useEffect, useState } from "react";
import Login from "./pages/Login";
import { api } from "./lib/api";
import type { MeResponse } from "./lib/auth";
import { clearToken, getToken } from "./lib/auth";

export default function App() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchMe() {
    try {
      const data = await api<MeResponse>("/me");
      setMe(data);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = getToken();
    if (token) fetchMe();
    else setLoading(false);
  }, []);

  if (loading) return <p style={{ padding: 24 }}>Cargando…</p>;
  if (!me) return <Login onLoggedIn={fetchMe} />;

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 48, margin: "24px 0" }}>KlyntarCRM</h1>
      <p>
        Bienvenido, <strong>{me.firstName || "Usuario"}</strong> ({me.email}) —
        Rol: <b>{me.role}</b>
      </p>
      <button
        onClick={() => {
          clearToken();
          setMe(null);
        }}
        style={{ marginTop: 12 }}
      >
        Cerrar sesión
      </button>
      <hr style={{ margin: "24px 0" }} />
      <p>
        🔒 Esta sección solo aparece si el token es válido (respuesta de{" "}
        <code>/me</code>).
      </p>
    </div>
  );
}
