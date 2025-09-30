// frontend/src/App.tsx
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { api } from "./lib/api";
import type { MeResponse } from "./lib/auth";
import { clearToken, getToken } from "./lib/auth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Agents from "./pages/Agents";
import ProtectedRoute from "./components/ProtectedRoute";
import Nav from "./components/Nav";

export default function App() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchMe() {
    try {
      setMe(await api<MeResponse>("/me"));
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
            <ProtectedRoute>
              <div>
                <Nav />
                <Dashboard me={me!} />
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
          }
        />
        <Route
          path="/agents"
          element={
            <ProtectedRoute>
              <div>
                <Nav />
                <Agents />
              </div>
            </ProtectedRoute>
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
