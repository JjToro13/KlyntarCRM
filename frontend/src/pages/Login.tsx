// frontend/src/pages/Login.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";        // 👈
import { api } from "../lib/api";
import type { LoginResponse } from "../lib/auth";
import { saveToken, getToken } from "../lib/auth";      // 👈

export default function Login({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [email, setEmail] = useState("admin@klyntarcrm.local");
  const [password, setPassword] = useState("Admin123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();                       // 👈

  // Si ya hay token (usuario ya logueado), manda a /dashboard
  useEffect(() => {
    if (getToken()) navigate("/dashboard", { replace: true });   // 👈
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token } = await api<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      saveToken(token);
      await onLoggedIn();                                  // refresca /me
      navigate("/dashboard", { replace: true });           // 👈 redirige
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: "64px auto", padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>KlyntarCRM • Iniciar sesión</h2>
      <form onSubmit={handleSubmit} action="#">
        <label style={{ display: "block", margin: "8px 0 4px" }}>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        <label style={{ display: "block", margin: "12px 0 4px" }}>Contraseña</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        {error && <p style={{ color: "crimson", marginTop: 8 }}>{error}</p>}
        <button disabled={loading} type="submit" style={{ marginTop: 16, width: "100%" }}>
          {loading ? "Ingresando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
