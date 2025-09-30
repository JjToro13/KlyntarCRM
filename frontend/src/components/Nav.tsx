// frontend/src/components/Nav.tsx
import { Link } from "react-router-dom";

export default function Nav() {
  return (
    <nav style={{ display: "flex", gap: 12, padding: "12px 24px", borderBottom: "1px solid #333" }}>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/agents">Agentes</Link>
    </nav>
  );
}
