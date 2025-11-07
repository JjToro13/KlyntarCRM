// frontend/src/App.tsx
import { api } from "./lib/api";
import { useEffect, useState } from "react";
import type { MeResponse } from "./lib/auth";
import { clearToken, getToken } from "./lib/auth";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Leads from "./pages/Leads";
import Login from "./pages/Login";
import Nav from "./components/Nav";
import Agents from "./pages/Agents";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchMe() {
    try {
      const data = await api<MeResponse>("/me");
      setMe(data);
    } catch {
      // si el token no sirve, lo limpiamos y forzamos login
      clearToken();
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

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            getToken() ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLoggedIn={fetchMe} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            me ? (
              <ProtectedRoute>
                <div>
                  <Nav />
                  <Dashboard me={me} />
                  <div style={{ padding: "0 24px 24px" }}>
                    <button
                      onClick={() => {
                        clearToken();
                        setMe(null);
                        location.href = "/login";
                      }}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/agents"
          element={
            me ? (
              <ProtectedRoute>
                <div>
                  <Nav />
                  <Agents />
                </div>
              </ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/leads"
          element={
            me ? (
              <ProtectedRoute>
                <div>
                  <Nav />
                  <Leads />
                </div>
              </ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/"
          element={<Navigate to={me ? "/dashboard" : "/login"} replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
