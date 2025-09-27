export type LoginResponse = { token: string };
export type MeResponse = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: "ADMIN" | "SUPERVISOR" | "AGENT";
  createdAt: string;
  updatedAt: string;
};

export function saveToken(token: string) { localStorage.setItem("token", token); }
export function getToken() { return localStorage.getItem("token"); }
export function clearToken() { localStorage.removeItem("token"); }
